import { APIRoute } from "astro";
import User from "../../../model/user";
import UserManager from "../../../model/usermanager";
import { isAuthorized } from "../../../model/utils";

export const post: APIRoute = async ({ request }) => {
    const authorized = isAuthorized(request);
    if (!authorized) return { status: 401, body: "Unauthorized" };
    
    const query = (await request.json());
    const torrent_id = parseInt(query.movie_id);

    if (isNaN(torrent_id)) return { status: 417, body: "Invalid torrent id" };

    const user = await UserManager.getUser(authorized as string);

    const exists = user.getLibrary().exists(torrent_id);

    if (!exists) return { status: 404, body: "Movie not found" };

    const downloaded = user.getLibrary().isMovieDownloaded(torrent_id);
    const progress = user.getDownloader().getTorrentProgress(torrent_id);

    return new Response(JSON.stringify({
        progress: progress,
        downloaded: downloaded
    }), {
        status: 200
    });
}

