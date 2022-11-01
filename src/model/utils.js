import fs from 'fs';
import { isLoggedIn } from './database';

/**
 * @param { Request } request 
 * @returns { Object }
 */
export function getCookies(request) {

}

/**
 * @param { Headers } headers 
 * @param { Object } cookie
 * @param { String } cookie.name
 * @param { String } cookie.value
 * @param { number } [cookie.expires]
 * @param { boolean } [cookie.secure]
 * @param { String } [cookie.path]
 * @returns { void }
 */
export function addCookie(headers, cookie) {
    let val = `${cookie.name}=${cookie.value};`
    val += cookie.expires ? ` Expires=${cookie.expires};` : '';
    val += cookie.secure ? ` Secure;` : '';
    val += cookie.path ? ` Path=${cookie.path};` : '';
    headers.append('Set-Cookie', val);
}

/**
 * @param { String } directory 
 * @returns { String }
 */
export function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
    return directory;
}

export function isAuthorized(request) {
    const cookie = request.headers.get("cookie") || "";
    const token = (cookie.endsWith(";") ? cookie : cookie + ";").match(
        /token=([^;]*);/
    );

    return token && isLoggedIn(token[1]);
}