import fs from 'fs';

let CONFIG_PATH = './jaajtv.config.json';

let config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

export default function getConfig(): { yggtorrent: { username: string, password: string }, jaajtv_folder: string } {
    return config;
}