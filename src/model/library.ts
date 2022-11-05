import { getCachedMovieById, Movie } from "./database";
import User from "./user";
import fs from 'fs';
import path from 'path';
import { ensureDirectoryExists } from "./utils";


export default class Library {
    private download_path: string;
    private user: User;
    private movies: Map<number, Movie> = new Map();

    constructor(user: User) {
        this.user = user;
        this.download_path = ensureDirectoryExists(path.join(this.user.directory, "movies"));
        this.init();
    }

    private parseMovieFromFolder(data: string): Movie {
        return JSON.parse(data);
    }

    getMovieDownloadPath(torrent_id: number): string {
        return path.join(this.download_path, torrent_id.toString());
    }

    private init() {
        for(let dir of fs.readdirSync(this.download_path)) {
            const data = fs.readFileSync(path.join(this.download_path, dir, "movie.info"), "utf-8");
            this.movies.set(parseInt(dir), this.parseMovieFromFolder(data));
        }
    }

    createMovieFolder(movie: Movie) {
        fs.writeFileSync(path.join(ensureDirectoryExists(this.getMovieDownloadPath(movie.id)), "movie.info"), JSON.stringify(movie));
    }

    addTorrent(torrent_id: number, files: string[]) {
        const movie = getCachedMovieById(torrent_id);
        this.createMovieFolder(movie);
        this.movies.set(torrent_id, movie);
        this.user.getDownloader().downloadTorrent(torrent_id, files);
    }

    exists(torrent_id: number): boolean {
        return this.movies.has(torrent_id);
    }
}