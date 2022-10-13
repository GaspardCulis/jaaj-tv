var Client = require('./lib/client');
var fs = require('fs');


class Downloader {

    static USER_DOWNLOADS_PATH = "/home/ygg-tv/downloads/";
    /**
     * @param { String } username 
     */
    constructor(username) {
        this.downloadPath = Downloader.USER_DOWNLOADS_PATH + username;
        if (!fs.existsSync(this.downloadPath)) {
            fs.mkdirSync(this.downloadPath, {
                recursive: true
            });
        }
        this._client = new Client({
            downloadPath: this.downloadPath
        });
    }
}


