import User from "./user";


export default class UserManager {
    private static users: Map<string, User> = new Map();
    
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
            console.info(`${this.users.size} users connected`);
        }

        const user = this.users.get(login);

        return user;
    }


    static async killUser(login: string) {
        if (this.users.has(login)) {
            const user = this.users.get(login);
            await user.kill();
            this.users.delete(login);
        }
    }
}