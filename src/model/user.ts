import { Torrent, YggTorrent, Categories, SubCategories, SortBy, SortOrder } from 'node-yggtorrent';
import { ensureDirectoryExists } from './utils';
import path from 'path';
import getConfig from './config';

const USERS_FOLDER = process.env.USERS_FOLDER;

export default class User {
    private login: string;
    private directory: string;
    private _client: YggTorrent;
    private ready = false;

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
        })
    }

    getClient(): YggTorrent {
        return this._client;
    }

    async waitReady() {
        while (!this.ready) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    async kill() {
        await this._client.closeBrowser();
    }

}