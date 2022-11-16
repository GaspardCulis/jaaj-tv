import { APIRoute } from "astro";
import fs from "fs";
import path from "path";
import UserManager from "../../../model/usermanager";
import { isAuthorized } from "../../../model/utils";

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

    const range = request.headers.get("range");
    if (!range) {
        return {status: 400, body: "Requires Range header"};
    }
    const videoPath = path.join(user.getLibrary().getMovieDownloadPath(movie_id), file_path);
    const videoSize = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const videoStream = fs.createReadStream(videoPath, { start, end });
    const headers = new Headers();
    headers.set("Content-Range", `bytes ${start}-${end}/${videoSize}`);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Content-Length", contentLength.toString());
    headers.set("Content-Type", "video/mp4");
    return new Response(videoStream as unknown as BodyInit, { headers, status: 206 });
}

