import { Torrent, YggTorrent, Categories, SubCategories, SortBy, SortOrder } from 'node-yggtorrent';
import WebTorrent from 'webtorrent';
import User from './user';
import path from 'path';
import { ensureDirectoryExists } from './utils';

export default class Downloader {
    
    /**
     * @param { User } user
     */
    constructor(user) {
        this.download_path = ensureDirectoryExists(path.join(user.directory, "movies"));
        this.torrents_path = ensureDirectoryExists(path.join(user.directory, "torrents"));
        this._client = new WebTorrent();
        this.user = user;

        this.torrents = [];
    }

    /**
     * @param { Torrent | String | Number } torrent 
     */
    async download(torrent) {
        const file_path = path.join(this.torrents_path, torrent.id + ".torrent");
        await this.user._client.downloadTorrent(torrent, file_path);

        const wt_torrent = this._client.add(file_path);
        this.torrents.push(wt_torrent);
    }
}

