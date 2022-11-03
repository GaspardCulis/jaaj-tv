import fs from 'fs';
import shajs from 'sha.js';

const DB_PATH = './data/database.json';

/**
 * @returns { {users: Object, sessions: Object, invite_codes: Array<String>} }
 */
function getDatabase() {
    return JSON.parse(fs.readFileSync(DB_PATH));
}

/**
 * @param { {users: Object, sessions: Object, invite_codes: Array<String>, cached_results: Array<Object>, cached_movies: Array<Object>} } database
 */
function storeDatabase(database) {
    fs.writeFileSync(DB_PATH, JSON.stringify(database, null, 4));
}

function updateTokens() {
    let database = getDatabase();
    for (let token in database.sessions) {
        if (database.sessions[token].birth + database.sessions[token].maxAge < Date.now()) {
            delete database.sessions[token];
        }
    }
    storeDatabase(database);
}

/**
 * @param { String } username
 * @returns { { token: String, expires: number } }
 */
export function createAuthToken(username) {
    let token = shajs('sha256').update(username + Date.now()).digest('hex');
    let maxAge = 1000 * 60 * 60 * 24 * 7; // 1 week
    let database = getDatabase();
    database.sessions[token] = {
        username: username,
        maxAge: maxAge,
        birth: Date.now()
    };
    storeDatabase(database);
    return {token: token, expires: Date.now() + maxAge};
}

/**
 * @param { String } token 
 */
export function revokeToken(token) {
    let database = getDatabase();
    delete database.sessions[token];
    storeDatabase(database);
}


/**
 * @param { String } token
 * @returns { boolean } 
 */
export function isLoggedIn(token) {
    updateTokens();
    const database = getDatabase();
    let logged = false;
    if (database.sessions[token]) {
        logged = true;
    }
    return logged;
}

/**
 * @param { String } username
 * @param { String } password
 * @returns { boolean }
 */
export function isLoginValid(username, password) {
    const database = getDatabase();
    let valid = false;
    if (database.users[username]) {
        if (database.users[username].password == shajs('sha256').update(password).digest('hex')) {
            valid = true;
        }
    }
    return valid;
}

/**
 * @param { String } username
 * @param { String } password
 * @returns { boolean } True if the user has been created, false if the username is already taken
 */
export function createUser(username, password) {
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

/**
 * @param { String } code 
 * @returns { boolean }
 */
export function consumeInviteCode(code) {
    let database = getDatabase();
    let consumed = false;

    if (database.invite_codes.includes(code)) {
        database.invite_codes = database.invite_codes.filter((value) => value !== code);
        consumed = true;
    }

    storeDatabase(database);
    return consumed
}

/**
 * 
 * @param { String } username 
 * @returns { boolean }
 */
export function userExists(username) {
    const database = getDatabase();
    return username in database.users;
}

/**
 * @param { Object } query 
 * @param { Object } results 
 */
export function cacheResults(query, results) {
    let database = getDatabase();

    for (let movie of results) {
        database.cached_movies[movie.id] = movie;
    }

    database.cached_results[JSON.stringify(query)] = {
        age: Date.now(),
        results: results.map((movie) => movie.id)
    };
    storeDatabase(database);
}

/**
 * @param { Object } query 
 * @returns 
 */
export function getCachedResults(query) {
    let database = getDatabase();
    let results = database.cached_results[JSON.stringify(query)];
    if (results) {
        results = results.results.map((id) => database.cached_movies[id]);
    }
    return results;
}

export function clearCache() {
    let database = getDatabase();
    database.cached_results = {};
    database.cached_movies = {};
    storeDatabase(database);
}

/**
 * 
 * @param { number } id 
 * @returns { { id: number, baseName: String, image: String, url: String, title?: String, language?: String, resolution?: String, season?: String, episode?: String, quality?: String, year?: String} }
 */
export function getCachedMovieById(id) {
    let database = getDatabase();
    return database.cached_movies[id];
}

