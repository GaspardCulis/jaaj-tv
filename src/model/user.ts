import { Torrent, YggTorrent, Categories, SubCategories, SortBy, SortOrder } from 'node-yggtorrent';
import { ensureDirectoryExists } from './utils';
import path from 'path';
import getConfig from './config';
import Downloader from './downloader';
import Library from './library';

const USERS_FOLDER = path.join(getConfig().jaajtv_folder, "users");

export default class User {
    public login: string;
    public directory: string;
    public ready = false;
    private _client: YggTorrent;
    private _downloader: Downloader;
    private _library: Library;

    constructor(login: string) {
        this.login = login;
        this.directory = ensureDirectoryExists(path.join(USERS_FOLDER, this.login));
        this._client = new YggTorrent();
        this._client.initializeBrowser().then(() => {
            this._client.login(getConfig().yggtorrent.username, getConfig().yggtorrent.password).then(() => {
                setTimeout(() => {
                    this._client.isLoggedIn().then((yes: boolean) => {
                        if (!yes) throw new Error("Failed to login.");
                        this.ready = true;
                    });
                }, 1000);
            });
        });
        this._downloader = new Downloader(this);
        this._library = new Library(this);
    }

    async waitReady() {
        while (!this.ready) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    getClient(): YggTorrent {
        return this._client;
    }

    getDownloader(): Downloader {
        return this._downloader;
    }

    getLibrary(): Library {
        return this._library;
    }

    async kill() {
        await this._client.closeBrowser();
    }

}