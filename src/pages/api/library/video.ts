import { APIRoute } from "astro";
import fs from "fs";
import path from "path";
import UserManager from "../../../model/usermanager";
import { isAuthorized } from "../../../model/utils";
import Transcoder from 'stream-transcoder';

export const get: APIRoute = async ({ request }) => {
    const authorized = isAuthorized(request);
    if (!authorized) return { status: 401, body: "Unauthorized" };

    const movie_id = parseInt(new URL(request.url).searchParams.get("movie_id"));
    if (!movie_id) return { status: 400, body: "Invalid request" };
    const file_path = new URL(request.url).searchParams.get("file_path");
    if (!file_path) return { status: 400, body: "Invalid request" };

    const user = await UserManager.getUser(authorized as string);
    const movie = user.getLibrary().getMovies().get(movie_id);
    if (!movie) return { status: 417, body: "Invalid movie id" };
    if (!fs.existsSync(path.join(user.getLibrary().getMovieDownloadPath(movie_id), file_path))) return { status: 417, body: "Invalid file path" };

    const videoPath = path.join(user.getLibrary().getMovieDownloadPath(movie_id), file_path);
    const videoSize = fs.statSync(videoPath).size;
    const videoStream = fs.createReadStream(videoPath);
    //let body = new Transcoder(videoStream).videoCodec('libx264').format('mp4').stream();
    
    const headers = new Headers();
    headers.set("Content-Range", `bytes */${videoSize}`);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Content-Type", "video/mp4");
    return new Response(videoStream as unknown as BodyInit, { headers, status: 206 });
}

