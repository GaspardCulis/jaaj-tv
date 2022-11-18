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

    async getTorrentFiles(torrent_id: number, keep_files: boolean = true): Promise<{ name: string, path: string, length: number, offset: 0 }[]> {
        if (!this.isTorrentFileDownloaded(torrent_id)) {
            await this.downloadTorrentFile(torrent_id);
        }
        const data = parseTorrent(fs.readFileSync(this.getTorrentFileDownloadPath(torrent_id)));
        if (!keep_files) {
            await fs.promises.rm(this.getTorrentFileDownloadPath(torrent_id), { force: true });
        }
        return data.files;
    }

    async downloadTorrent(torrent_id: number, files: string[]) {
        if (!this.isTorrentFileDownloaded(torrent_id)) {
            await this.downloadTorrentFile(torrent_id);
        }
        const torrent = this._client.add(this.getTorrentFileDownloadPath(torrent_id), {path: this.user.getLibrary().getMovieDownloadPath(torrent_id)}, (torrent) => {
            torrent.deselect(0, torrent.pieces.length - 1, false);

            for(let file of torrent.files) {
                const formatted_path = file.path.replace(file._torrent.path, "").replace(/\\/g, "/").replace(/^\//, "");
                if (files.includes(formatted_path)) {
                    file.select();
                } else {
                    file._destroy();
                }
            };
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
        torrent.on('error', (e) => {console.error(e); instance.user.getLibrary().setMovieError(torrent_id, e.message)});
        torrent.on('download', function () {
            torrent.discovery.tracker.destroy(); // Tracker evasion
            bar.update(instance.getTorrentProgress(torrent) * 100);
        });
        torrent.on('done', async () => {
            bar.stop();
            // Remove deselected files which have empty files
            const files = torrent.files;
            const files_to_remove = torrent.files.filter((file) => file._destroyed);
            const abs_path = torrent.path;
            instance.removeTorrent(torrent_id);

            for (let file of files_to_remove) {
                const file_path = path.join(abs_path, file.path);
                if (fs.existsSync(file_path)) {
                    await fs.promises.rm(file_path, { force: true })
                        .then(() => {console.log("Removed empty file "+file.path)});
                }
            }
            await instance.user.getLibrary().setMovieDownloaded(torrent_id);
            console.info("Finished downloading torrent "+torrent_id);
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
        if (torrent === undefined)
            return 1;
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

    getDownloadsCount(): number {
        return this.torrents.size;
    }
}

