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

    private init() {
        for(let dir of fs.readdirSync(this.download_path)) {
            const data = fs.readFileSync(path.join(this.download_path, dir, "movie.info"), "utf-8");
            this.movies.set(parseInt(dir), this.parseMovieFromFolder(data));
        }
    }

    createMovieFolder(movie: Movie) {
        const movie_path = path.join(this.download_path, movie.id.toString());
        ensureDirectoryExists(movie_path);
        fs.writeFileSync(path.join(movie_path, "movie.info"), JSON.stringify(movie));
    }

    addTorrent(torrent_id: number, files: string[]) {
        const movie = getCachedMovieById(torrent_id);
        this.createMovieFolder(movie);
        this.movies.set(torrent_id, movie);
    }

    exists(torrent_id: number): boolean {
        console.log(this.movies);
        console.log(typeof torrent_id);
        return this.movies.has(torrent_id);
    }
}