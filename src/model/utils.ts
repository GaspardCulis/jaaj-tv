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

export async function moveFilesOutOfDirectory(directory: string) {
    const files = await fs.promises.readdir(directory);
    for (const file of files) {
        await fs.promises.rename(path.join(directory, file), path.join(directory, "..", file)).catch(() => null);
    };
    await fs.promises.rmdir(directory);
}

export async function getDirectorySize(directory: string): Promise<number> {
    let size = 0;
    const files = await fs.promises.readdir(directory);
    for (const file of files) {
        const type = await fs.promises.lstat(path.join(directory, file)).catch((e) => null);
        if (type && type.isDirectory()) {
            size += await getDirectorySize(path.join(directory, file));
        } else {
            size += type.size;
        }
    }
    return size;
}

export function humanFileSize(size: number): string {
    var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1000));
    const c = (size / Math.pow(1000, i)).toFixed(2)
    return  c + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}