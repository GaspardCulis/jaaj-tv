import fs from 'fs';

let CONFIG_PATH = './jaajtv.config.json';

let config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

type Config = { 
    yggtorrent: { 
        username: string, 
        password: string 
    }, 
    jellyfin: {
        url: string,
        token: string
    },
    jaajtv_folder: string
}


export default function getConfig(): Config {
    return config;
}