import fs from 'fs';

export class Config {
    static _instance;
    _config;
    
    constructor() {
        if (Config._instance) {
            throw new Error('Cannot create another instance of Config');
        }
        this._config = JSON.parse(fs.readFileSync('./jaajtv.config.json'));
        Config._instance = this;
    }

    /**
     * @returns { Config }
     */
    static get instance() {
        if (!Config._instance) {
            new Config();
        }
        return Config._instance;
    }

    /**
     * @returns {{ yggtorrent: { username: String, password: String }, jaajtv_folder: String }}
     */
    static getConfig() {
        return Config.instance._config;
    }


}