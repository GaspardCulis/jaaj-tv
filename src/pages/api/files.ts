import { APIRoute } from "astro";
import UserManager from "../../model/usermanager";
import { isAuthorized } from "../../model/utils";

export const post: APIRoute = async ({ request }) => {
    const authorized = isAuthorized(request);
    if (!authorized) return { status: 401, body: "Unauthorized" };
    
    const query = (await request.json());

    const user = await UserManager.getUser(authorized as string);
    const files = await user.getDownloader().getTorrentFiles(parseInt(query.id));

    return new Response(JSON.stringify({
        files: files
    }), {
        status: 200
    });
}

