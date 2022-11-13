import { getCachedMovieById, Movie } from "./database";
import User from "./user";
import fs from 'fs';
import path from 'path';
import { ensureDirectoryExists, moveFilesOutOfDirectory } from "./utils";

type FolderInfo = {
    name: string,
    created_at: number,
}

type TorrentInfo = {
    files: string[],
    downloaded: boolean,
    error: string | null,
}

type MovieFolder = {
    movie_info: Movie,
    folder_info: FolderInfo,
    torrent_info: TorrentInfo,
}

export default class Library {
    private download_path: string;
    private user: User;
    private movies: Map<number, Movie> = new Map();
    private folders: Map<number, FolderInfo> = new Map();
    private torrents: Map<number, TorrentInfo> = new Map();

    constructor(user: User) {
        this.user = user;
        this.download_path = ensureDirectoryExists(path.join(this.user.directory, "movies"));
        this.init();
    }

    private init() {
        for(let dir of fs.readdirSync(this.download_path)) {
            const id = parseInt(dir)
            const data: MovieFolder = this.getData(id);
            this.movies.set(id, data.movie_info);
            this.folders.set(id, data.folder_info);
            this.torrents.set(id, data.torrent_info);
        }
        setTimeout(() => {
            this.resumeDownloads();
        }, 1000);
    }

    private resumeDownloads() {
        for(let id of this.movies.keys()) {
            const data: MovieFolder = this.getData(id);
            if (!data.torrent_info.downloaded) {
                console.log("Resuming download of torrent " + id);
                this.user.getDownloader().downloadTorrent(id, data.torrent_info.files);
            }
        }
    }

    createMovieFolder(movie: Movie, folder_name: string, files: string[]) {
        const data: MovieFolder = {
            movie_info: movie,
            folder_info: {
                name: folder_name,
                created_at: Date.now(),
            },
            torrent_info: {
                files: files,
                downloaded: false,
                error: null
            }
        }
        this.folders.set(movie.id, data.folder_info);
        this.torrents.set(movie.id, data.torrent_info);
        this.setData(movie.id, data);
    }

    addTorrent(torrent_id: number, files: string[], folder_name: string) {
        const movie = getCachedMovieById(torrent_id);
        if (this.movies.has(torrent_id)) {
            this.torrents.set(torrent_id, {
                files: this.torrents.get(torrent_id).files.concat(files).filter((v, i, a) => a.indexOf(v) === i),
                downloaded: false,
                error: null
            });
            this.folders.set(torrent_id, {
                name: folder_name,
                created_at: Date.now()
            });
            this.setData(torrent_id, {
                movie_info: movie,
                folder_info: this.folders.get(torrent_id),
                torrent_info: this.torrents.get(torrent_id)
            });
        } else {
            this.movies.set(torrent_id, movie);
            this.createMovieFolder(movie, folder_name, files);
        }
        this.user.getDownloader().downloadTorrent(torrent_id, files);
    }

    async deleteFiles(torrent_id: any, to_delete: string[]) {
        const data = this.getData(torrent_id);
        data.torrent_info.files = data.torrent_info.files.filter(f => !to_delete.includes(f));
        if (data.torrent_info.files.length === 0) {
            await this.deleteMovie(torrent_id);
        } else {
            this.setData(torrent_id, data);
            this.torrents.set(torrent_id, data.torrent_info);
        }
        for(let file of to_delete) {
            await fs.promises.rm(path.join(this.getMovieDownloadPath(torrent_id), file), { force: true });
            console.log("Deleted file " + path.join(this.getMovieDownloadPath(torrent_id), file));
        }
    }

    async deleteMovie(torrent_id: number) {
        this.movies.delete(torrent_id);
        this.folders.delete(torrent_id);
        this.torrents.delete(torrent_id);
        await fs.promises.rm(this.getMovieFolderPath(torrent_id), { force: true, recursive: true });
    }

    async setMovieDownloaded(torrent_id: number) {
        const data = this.getData(torrent_id);
        data.torrent_info.downloaded = true;
        //await this.formatMovieFolder(this.getMovieDownloadPath(torrent_id));
        this.setData(torrent_id, data);
    }

    isMovieDownloaded(torrent_id: number): boolean {
        return this.getData(torrent_id).torrent_info.downloaded;
    }

    setMovieError(torrent_id: number, error: string) {
        const data = this.getData(torrent_id);
        data.torrent_info.error = error;
        this.setData(torrent_id, data);
    }

    exists(torrent_id: number): boolean {
        return this.movies.has(torrent_id);
    }

    getMovies(): Map<number, Movie> {
        return this.movies;
    }

    getFolders(): Map<number, FolderInfo> {
        return this.folders;
    }

    getTorrentInfo(torrent_id: number): TorrentInfo {
        return this.getData(torrent_id).torrent_info;
    }


    getMovieFolderPath(torrent_id: number): string {
        return path.join(this.download_path, torrent_id.toString());
    }

    getMovieDownloadPath(torrent_id: number): string {
        return path.join(this.getMovieFolderPath(torrent_id), "files");
    }

    private getData(torrent_id: number): MovieFolder {
        return JSON.parse(fs.readFileSync(path.join(this.getMovieFolderPath(torrent_id), "movie.info"), "utf-8"));
    }

    private setData(torrent_id: number, data: MovieFolder) {
        fs.writeFileSync(path.join(ensureDirectoryExists(this.getMovieFolderPath(torrent_id)), "movie.info"), JSON.stringify(data));
    }

    private async formatMovieFolder(movie_path: string, is_root: boolean = true) {
        const files = await fs.promises.readdir(movie_path);
        if (files.length === 0 && !is_root) {
            await fs.promises.rmdir(movie_path);
        } else if (files.length == 1) {
            const type = await fs.promises.lstat(path.join(movie_path, files[0])).catch((e) => null);
            if (type && type.isDirectory()) {
                await moveFilesOutOfDirectory(path.join(movie_path, files[0]));
                await this.formatMovieFolder(movie_path, is_root);
            } else if(!is_root) {
                await moveFilesOutOfDirectory(movie_path);
            }
        } else {
            for (let file of files) {
                const type = await fs.promises.lstat(path.join(movie_path, file)).catch((e) => null);
                if (type && type.isDirectory()) {
                    await this.formatMovieFolder(path.join(movie_path, file), false);
                }
            }
        }
    }
}