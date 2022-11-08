import WebTorrent from 'webtorrent';
import User from './user';
import path from 'path';
import { ensureDirectoryExists } from './utils';
import fs from 'fs';
import parseTorrent from 'parse-torrent';
import cliProgress from 'cli-progress';
import colors from 'ansi-colors';

export default class Downloader {
    private torrents_path: string;
    private _client: WebTorrent;
    private user: User;
    private torrents: Map<number, WebTorrent.Torrent> = new Map();

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
                } else {
                    file.deselect();
                    file._destroy();
                }
            });
        });

        const bar = new cliProgress.SingleBar({
            format: 'Download progress |' + colors.greenBright('{bar}') + '| {percentage}% || Time left : {eta_formatted}',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        });
        
        console.log("Starting to download torrent "+torrent_id);
        bar.start(100, 0);
        const instance = this;
        torrent.on('warning', console.log);
        torrent.on('error',console.log);
        torrent.on('download', function () {
            torrent.discovery.tracker.destroy(); // Tracker evasion
            bar.update(instance.getTorrentProgress(torrent) * 100);
        });
        torrent.on('done', () => {
            bar.stop();
            // Remove deselected files which have empty files
            for (let file of torrent.files) {
                if (file._destroyed) {
                    fs.unlink(file.path, (err) => {
                        if (err) console.log("Failed to remove file "+file.path);
                        else console.log("Removed file "+file.path);
                    });
                }
            }
            instance.removeTorrent(torrent_id);
            console.log("Finished downloading torrent "+torrent_id);
        });
        this.torrents.set(torrent_id, torrent);
    }

    getTorrent(torrent_id: number): WebTorrent.Torrent {
        return this.torrents.get(torrent_id);
    }

    removeTorrent(torrent_id: number) {
        if (this.torrents.has(torrent_id)) {
            this.torrents.get(torrent_id).destroy({destroyStore: !this.torrents.get(torrent_id).done});
            this.torrents.delete(torrent_id);
        } else {
            throw new Error("Torrent "+torrent_id+" does not exist");
        }
    }

    getTorrentProgress(torrent: WebTorrent.Torrent | number): number {
        if (typeof torrent === "number")
            torrent = this.getTorrent(torrent);
        let total = 0;
        let progress = 0;

        for(let file of torrent.files) {
            if (!file._destroyed) {
                total += file.length || 0;
                progress += file.downloaded || 0;
            }
        }

        return progress / total;
    } 

    
}

