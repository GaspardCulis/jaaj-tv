import { Torrent, YggTorrent, Categories, SubCategories, SortBy, SortOrder } from 'node-yggtorrent';
import WebTorrent from 'webtorrent';

export default class Downloader {
    
    /**
     * @param { String } download_path The path where files are downloaded to
     */
    constructor(download_path) {
        this.download_path = download_path;
        this._client = new WebTorrent({
            tracker: false
        });
    }

    /**
     * @param { Torrent } torrent 
     */
    download(torrent) {
        
    }
}