import { APIRoute } from "astro";
import fs from "fs";

export const get: APIRoute = async ({ request }) => {
    const range = request.headers.get("range");
    if (!range) {
        return {status: 400, body: "Requires Range header"};
    }
    const videoPath = "C:\\Users\\gaspa\\Desktop\\test\\files\\out.webm";
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
    headers.set("Content-Type", "video/webm");
    return new Response(videoStream as unknown as BodyInit, { headers, status: 206 });
}

