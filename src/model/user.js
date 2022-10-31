import { Torrent, YggTorrent, Categories, SubCategories, SortBy, SortOrder } from 'node-yggtorrent';
import { ensureDirectoryExists } from './utils';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const USERS_FOLDER = process.env.USERS_FOLDER;

export default class User {
    constructor(login) {
        this.login = login;
        this.directory = ensureDirectoryExists(path.join(USERS_FOLDER, this.login));
        this._client = new YggTorrent();
        this._client.initializeBrowser().then(() => {
            this._client.login(process.env.YGGTORRENT_LOGIN, process.env.YGGTORRENT_PASSWORD).then(() => {
                this._client.isLoggedIn().then((yes) => {
                    if (!yes) throw new Error("Failed to login.");
                })
            });
        })
    }
}