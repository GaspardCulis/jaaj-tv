import User from "./user";


export default class UserManager {
    private static users: Map<string, User> = new Map();
    private static keepAlives: Map<string, number> = new Map();
    
    static async getUser(login: string): Promise<User> {
        const user = this.getUserSync(login);

        await user.waitReady();

        return user;
    }

    /**
     * Use with caution, this method does not wait for user to be ready
     */
    static getUserSync(login: string): User {
        if (!this.users.has(login)) {
            this.users.set(login, new User(login));
            this.keepAlives.set(login, Date.now());
            console.info(`${this.users.size} users connected`);
        }

        const user = this.users.get(login);

        return user;
    }

    static async keepClientAlive(login: string) {
        this.keepAlives.set(login, Date.now());
    }

    static async cleanUpClients() {
        for (let [login, lastTimeAlive] of this.keepAlives.entries()) {
            if (Date.now() - lastTimeAlive > 1000 * 60) {
                if (this.users.get(login).getDownloader().getDownloadsCount() > 0) continue;
                console.info(`Cleaning up ${login}`);
                this.killUser(login);
                this.keepAlives.delete(login);
            }
        }
    }

    static async killUser(login: string) {
        if (this.users.has(login)) {
            const user = this.users.get(login);
            await user.kill();
            this.users.delete(login);
        }
    }
}

setInterval(() => {
    UserManager.cleanUpClients();
}, 1000 * 30);