import fs from 'fs';
import { isLoggedIn } from './database';

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

export function ensureDirectoryExists(directory: string): string {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
    return directory;
}

/** Returns username if logged in, false otherwise */
export function isAuthorized(request: Request): boolean | string {
    const cookie = request.headers.get("cookie") || "";
    const token = (cookie.endsWith(";") ? cookie : cookie + ";").match(
        /token=([^;]*);/
    );
    if (token) return isLoggedIn(token[1]);
    else return false;
}