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
        this.user = user;
        this._client = new WebTorrent();
        this._client.on('error', console.error);
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

    async downloadTorrent(torrent_id: number, files: string[]) {
        if (!this.isTorrentFileDownloaded(torrent_id)) {
            await this.downloadTorrentFile(torrent_id);
        }
        const torrent = this._client.add(this.getTorrentFileDownloadPath(torrent_id), {path: this.user.getLibrary().getMovieDownloadPath(torrent_id)}, (torrent) => {
            torrent.files.forEach(file => file.deselect());
            torrent.deselect(0, torrent.pieces.length - 1, false);

            torrent.files.forEach(file => {
                const formatted_path = file.path.replace(file._torrent.path, "").replace(/\\/g, "/").replace(/^\//, "");
                if (files.includes(formatted_path)) {
                    file.select();
                }
            });
        });

        torrent.on('warning', console.log);
        torrent.on('error',console.log);
        torrent.on('download', function (bytes) {
            console.log('progress: ' + torrent.progress);
        });
        
        
    }

    
}

