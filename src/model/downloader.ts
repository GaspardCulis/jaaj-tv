import WebTorrent from 'webtorrent';
import User from './user';
import path from 'path';
import { ensureDirectoryExists } from './utils';
import fs from 'fs';
import parseTorrent from 'parse-torrent';

export default class Downloader {
    private torrents_path: string;
    private _client: WebTorrent;
    private user: User;

    constructor(user: User) {
        this.torrents_path = ensureDirectoryExists(path.join(user.directory, "torrents"));
        this._client = new WebTorrent();
        this.user = user;
    }

    getTorrentFileDownloadPath(torrent_id: number): string {
        return path.join(this.torrents_path, torrent_id.toString() + ".torrent");
    }

    async downloadTorrentFile(torrent_id: number) {
        await this.user.getClient().downloadTorrent(torrent_id, this.getTorrentFileDownloadPath(torrent_id));
    }

    isTorrentFileDownloaded(torrent_id: number): boolean {
        return fs.existsSync(this.getTorrentFileDownloadPath(torrent_id));
    }

    async getTorrentFiles(torrent_id: number): Promise<{ name: string, path: string, length: number, offset: 0 }[]> {
        if (!this.isTorrentFileDownloaded(torrent_id)) {
            await this.downloadTorrentFile(torrent_id);
        }
        const data = parseTorrent(fs.readFileSync(this.getTorrentFileDownloadPath(torrent_id)));
        return data.files;
    }

    
}

