import { Jellyfin, Api } from '@jellyfin/sdk';
import { UserApi } from '@jellyfin/sdk/lib/generated-client/api'
import { Configuration } from '@jellyfin/sdk/lib/generated-client/configuration'
import getConfig from './config';
import User from './user';


export default class JellyfinApi {
    private static apis = new Map<string, JellyfinApi>();

    private jellyfin: Jellyfin;
    private config: Configuration;
    private api: Api;
    private user: User;

    constructor(user: User) {
        this.user = user;
        if (!JellyfinApi.apis.has(user.login)) {
            this.jellyfin = new Jellyfin({
                clientInfo: {
                    name: 'JaajTV - Client : '+user.login,
                    version: '1.0.0'
                },
                deviceInfo: {
                    name: 'Instance',
                    id: 'jaajtv'
                }
            });
            this.api = this.jellyfin.createApi(getConfig().jellyfin.url, getConfig().jellyfin.token);
            JellyfinApi.apis.set(user.login, this);
        } else {
            return JellyfinApi.apis.get(user.login);
        }
    }

    getUsers() {
        const users = new UserApi();
        
    }
}