import fs from 'fs';
import shajs from 'sha.js';

const DB_PATH = './data/database.json';

/**
 * @returns { {users: Object, sessions: Object} }
 */
function getDatabase() {
    return JSON.parse(fs.readFileSync(DB_PATH));
}

/**
 * @param { {users: Object, sessions: Object} } database
 */
function storeDatabase(database) {
    fs.writeFileSync(DB_PATH, JSON.stringify(database));
}

/**
 * @param { String } username
 * @returns { { token: String, maxAge: number } }
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
    return {token: token, maxAge: maxAge};
}


/**
 * @param { String } cookie
 * @returns { boolean } 
 */
export function isLoggedIn(cookie) {
    const database = getDatabase();
    let logged = false;
    if (cookie) {
        if (database.sessions[cookie]) {
            if (database.sessions[cookie].birth + database.sessions[cookie].maxAge > Date.now()) {
                logged = true;
            } else {
                delete database.sessions[cookie];
                storeDatabase(database);
            }
        }
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

