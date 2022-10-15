const fs = require('fs');
const shajs = require('sha.js')

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
function createAuthToken(username) {
    let token = shajs('sha256').update(username + Date.now()).digest('hex');
    let maxAge = 1000 * 60 * 60 * 24 * 7; // 1 week
    let database = getDatabase();
    database.sessions[token] = {
        username: username,
        maxAge: maxAge,
        birth: Date.now()
    };
    storeDatabase(database);
    return [token, maxAge];
}


/**
 * @param { Object } cookie
 * @param { String } cookie.token
 * @returns { boolean } 
 */
function isClientLogged(cookie) {
    const database = getDatabase();
    let logged = false;
    if (cookie.token) {
        if (database.sessions[cookie.token]) {
            if (database.sessions[cookie.token].birth + database.sessions[cookie.token].maxAge > Date.now()) {
                logged = true;
            } else {
                delete database.sessions[cookie.token];
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
function isLoginValid(username, password) {
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
function createUser(username, password) {
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


module.exports = {
    isClientLogged: isClientLogged,
    isLoginValid: isLoginValid,
    createAuthToken: createAuthToken,
    createUser: createUser
}