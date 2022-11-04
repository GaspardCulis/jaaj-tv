import User from "./user";


export default class Library {
    private user: User;

    constructor(user: User) {
        this.user = user;
    }

    addTorrent(torrent_id: number, files: string[]) {
        console.log("Adding torrent "+torrent_id+" and downloading "+files);
    }
}