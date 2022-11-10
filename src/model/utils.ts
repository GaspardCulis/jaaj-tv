import fs from 'fs';
import { isLoggedIn } from './database';
import path from 'path';

/**
 * @param { Headers } headers 
 * @param { Object } cookie
 * @param { String } cookie.name
 * @param { String } cookie.value
 * @param { number } [cookie.maxAge]
 * @param { boolean } [cookie.secure]
 * @param { String } [cookie.path]
 * @returns { void }
 */
export function addCookie(headers, cookie) {
    let val = `${cookie.name}=${cookie.value};`
    val += cookie.maxAge ? ` Max-Age=${cookie.maxAge};` : '';
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

export function filterUnwantedFiles(files: { name: string, path: string, length: number, offset: 0 }[]) {
    const unwantedFileExtensions = [
        ".nfo",
        ".txt",
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".bmp",
    ];
    return files.filter(file => {
        const extension = path.extname(file.name);
        return !unwantedFileExtensions.includes(extension);
    });
}