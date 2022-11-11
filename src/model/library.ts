import { getCachedMovieById, Movie } from "./database";
import User from "./user";
import fs from 'fs';
import path from 'path';
import { ensureDirectoryExists, moveFilesOutOfDirectory } from "./utils";

type FolderInfo = {
    name: string
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
                name: folder_name
            },
            torrent_info: {
                files: files,
                downloaded: false,
                error: null
            }
        }
        this.setData(movie.id, data);
    }

    addTorrent(torrent_id: number, files: string[], folder_name: string) {
        const movie = getCachedMovieById(torrent_id);
        this.createMovieFolder(movie, folder_name, files);
        this.movies.set(torrent_id, movie);
        this.user.getDownloader().downloadTorrent(torrent_id, files);
    }

    async setMovieDownloaded(torrent_id: number) {
        const data = this.getData(torrent_id);
        data.torrent_info.downloaded = true;
        await this.formatMovieFolder(this.getMovieDownloadPath(torrent_id));
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

    private async formatMovieFolder(movie_path: string) {
        const files = await fs.promises.readdir(movie_path);
        if (files.length == 1 && await fs.promises.lstat(path.join(movie_path, files[0])).then(stat => stat.isDirectory())) {
            await moveFilesOutOfDirectory(path.join(movie_path, files[0]));
            await this.formatMovieFolder(movie_path);
        }
    }
}