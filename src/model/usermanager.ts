import User from "./user";


export default class UserManager {
    private static users: Map<string, User> = new Map();
    
    static async getUser(login: string): Promise<User> {
        if (!this.users.has(login)) {
            this.users.set(login, new User(login));
        }

        const user = this.users.get(login);
        await user.waitReady();

        console.info(`${this.users.size} users connected`);

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