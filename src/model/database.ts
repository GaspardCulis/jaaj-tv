import fs from 'fs';
import shajs from 'sha.js';

const DB_PATH = './data/database.json';

export type Movie = {
    id: number,
    baseName: string,
    image: string,
    url: string,
    index: number,
    title?: string,
    year?: number,
    language?: string,
    resolution?: string,
    season?: number,
    episode?: number,
    quality?: string,
}

type Database = {
    users: {
        [username: string]: {
            password: string,
        }
    },
    sessions: {
        [token: string]: {
            username: string,
            maxAge: number,
            createdAt: number,
        }
    }
    invite_codes: {
        [code: string]: {permanent: boolean}
    },
    cached_results: {
        [query: string]: {
            results: number[], // Movie ids
            createdAt: number,
        }
    }
    cached_movies: {
        [id: number]: Movie,
    }
}

function getDatabase(): Database {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function storeDatabase(database: Database) {
    fs.writeFileSync(DB_PATH, JSON.stringify(database, null, 4));
}

function initDatabase() {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({
            users: {},
            sessions: {},
            invite_codes: {},
            cached_results: {},
            cached_movies: {},
        }, null, 4));
    } else {
        const db = getDatabase();
        db.users = db.users || {};
        db.sessions = db.sessions || {};
        db.invite_codes = db.invite_codes || {};
        db.cached_results = db.cached_results || {};
        db.cached_movies = db.cached_movies || {};
        storeDatabase(db);
    }
}
initDatabase();

function updateTokens() {
    let database = getDatabase();
    let changed = false;
    for (let token in database.sessions) {
        if (database.sessions[token].createdAt + database.sessions[token].maxAge < Date.now()) {
            delete database.sessions[token];
            changed = true;
        }
    }
    if (changed) storeDatabase(database);
}
updateTokens();

export function createAuthToken(username: string): { token: string, maxAge: number } {
    let token = shajs('sha256').update(username + Date.now()).digest('hex');
    let maxAge = 1 * 60 * 60 * 24 * 7; // 1 week
    let database = getDatabase();
    database.sessions[token] = {
        username: username,
        maxAge: maxAge,
        createdAt: Date.now()
    };
    storeDatabase(database);
return {token: token, maxAge: maxAge};
}

export function revokeToken(token: string) {
    let database = getDatabase();
    delete database.sessions[token];
    storeDatabase(database);
}

/** Returns username if logged in, false otherwise */
export function isLoggedIn(token: string): boolean | string { 
    updateTokens();
    const database = getDatabase();
    if (database.sessions[token]) {
        return database.sessions[token].username;
    }
    return false;
}

export function isLoginValid(username: string, password: string): boolean {
    const database = getDatabase();
    let valid = false;
    if (database.users[username]) {
        if (database.users[username].password == shajs('sha256').update(password).digest('hex')) {
            valid = true;
        }
    }
    return valid;
}

/** Returns true if the user has been created, false if the username is already taken */
export function createUser(username: string, password: string): boolean { 
    const database = getDatabase();
    let created = false;
    if (!database.users[username]) {
        database.users[username] = {
            password: shajs('sha256').update(password).digest('hex')
        };
        storeDatabase(database);
        created = true;
    }
    return created;
}

export function consumeInviteCode(code: string): boolean {
    let database = getDatabase();
    let consumed = false;

    if (database.invite_codes[code]) {
        if(!database.invite_codes[code].permanent) {
            delete database.invite_codes[code];
        }
        consumed = true;
    }

    storeDatabase(database);
    return consumed
}

export function userExists(username: string): boolean {
    const database = getDatabase();
    return username in database.users;
}

export function cacheResults(query: any, results: Movie[]) {
    let database = getDatabase();

    for (let movie of results) {
        database.cached_movies[movie.id] = movie;
    }

    database.cached_results[JSON.stringify(query)] = {
        createdAt: Date.now(),
        results: results.map((movie) => movie.id)
    };
    storeDatabase(database);
}

export function getCachedResults(query: any): Movie[] {
    cleanUpCache();
    let database = getDatabase();
    let cached_results = database.cached_results[JSON.stringify(query)];
    if (cached_results) {
        return cached_results.results.map((id) => database.cached_movies[id]);
    } else {
        return null;
    }
}

function getMovieReferenceCount(movie: Movie): number {
    let database = getDatabase();
    let count = 0;
    for (let query in database.cached_results) {
        if (database.cached_results[query].results.includes(movie.id)) {
            count++;
        }
    }
    return count;
}

function cleanUpCache() {
    const maxAge = 1000 * 60 * 60 * 24 * 0.5; // 12 hours

    let database = getDatabase();
    for (let query in database.cached_results) {
        if (database.cached_results[query].createdAt + maxAge < Date.now()) {
            for (let id of database.cached_results[query].results) {
                if (getMovieReferenceCount(database.cached_movies[id]) <= 1) {
                    delete database.cached_movies[id];
                }
            }
            delete database.cached_results[query];
        }
    }
    storeDatabase(database);
}

export function clearCache() {
    let database = getDatabase();
    database.cached_results = {};
    database.cached_movies = {};
    storeDatabase(database);
}

export function getCachedMovieById(id: number): Movie {
    let database = getDatabase();
    return database.cached_movies[id];
}