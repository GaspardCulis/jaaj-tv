import { APIRoute } from "astro";
import UserManager from "../../../model/usermanager";
import { isAuthorized } from "../../../model/utils";

export const post: APIRoute = async ({ request }) => {
    const authorized = isAuthorized(request);
    if (!authorized) return { status: 401, body: "Unauthorized" };
    
    const query = (await request.json());
    const torrent_id = parseInt(query.torrent_id);

    if (isNaN(torrent_id)) return { status: 417, body: "Invalid torrent id" };

    const user = await UserManager.getUser(authorized as string);
    const exists = user.getLibrary().exists(torrent_id);

    return new Response(JSON.stringify({
        exists: exists
    }), {
        status: 200
    });
}

