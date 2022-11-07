import { getCachedMovieById, Movie } from "./database";
import User from "./user";
import fs from 'fs';
import path from 'path';
import { ensureDirectoryExists } from "./utils";

type FolderInfo = {
    name: string
}

type MovieFolder = {
    movie_info: Movie,
    folder_info: FolderInfo
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

    getMovieDownloadPath(torrent_id: number): string {
        return path.join(this.download_path, torrent_id.toString());
    }

    private init() {
        for(let dir of fs.readdirSync(this.download_path)) {
            const data: MovieFolder = JSON.parse(fs.readFileSync(path.join(this.download_path, dir, "movie.info"), "utf-8"));
            this.movies.set(parseInt(dir), data.movie_info);
            this.folders.set(parseInt(dir), data.folder_info);
        }
    }

    createMovieFolder(movie: Movie, name: string) {
        const data: MovieFolder = {
            movie_info: movie,
            folder_info: {
                name: name
            }
        }
        fs.writeFileSync(path.join(ensureDirectoryExists(this.getMovieDownloadPath(movie.id)), "movie.info"), JSON.stringify(data));
    }

    addTorrent(torrent_id: number, files: string[], folder_name: string) {
        const movie = getCachedMovieById(torrent_id);
        this.createMovieFolder(movie, folder_name);
        this.movies.set(torrent_id, movie);
        this.user.getDownloader().downloadTorrent(torrent_id, files);
    }

    exists(torrent_id: number): boolean {
        return this.movies.has(torrent_id);
    }

    getFolders(): Map<number, FolderInfo> {
        return this.folders;
    }
}