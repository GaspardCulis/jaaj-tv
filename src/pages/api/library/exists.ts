import { APIRoute } from "astro";
import UserManager from "../../../model/usermanager";
import { isAuthorized } from "../../../model/utils";

export const post: APIRoute = async ({ request }) => {
    const authorized = isAuthorized(request);
    if (!authorized) return { status: 401, body: "Unauthorized" };
    
    const query = (await request.json());
    const movie_id = parseInt(query.movie_id);

    if (isNaN(movie_id)) return { status: 417, body: "Invalid torrent id" };

    const user = UserManager.getUserSync(authorized as string);
    const exists = user.getLibrary().exists(movie_id);
    const torrent = exists ? user.getLibrary().getTorrentInfo(movie_id) : null;

    return new Response(JSON.stringify({
        exists: exists,
        files: torrent ? torrent.files : null,
        folder_name: torrent ? user.getLibrary().getFolders().get(movie_id).name : null
    }), {
        status: 200
    });
}

