import { APIRoute } from "astro";
import UserManager from "../../model/usermanager";
import { isAuthorized } from "../../model/utils";

export const post: APIRoute = async ({ request }) => {
    const authorized = isAuthorized(request);
    if (!authorized) return { status: 401, body: "Unauthorized" };
    let status = 417;
    
    const query = (await request.json());
    query.torrent_id = parseInt(query.torrent_id);

    const user = await UserManager.getUser(authorized as string);
    if (!isNaN(query.torrent_id) && user.getDownloader().isTorrentFileDownloaded(query.torrent_id)) {
        const files = await user.getDownloader().getTorrentFiles(query.torrent_id);
        if (Array.isArray(query.files) && query.files.length > 0 && query.files.filter((file) => files.map(local_file => local_file.path.replace(/\\/g, "/")).includes(file)).length === query.files.length) {
            user.getLibrary().addTorrent(query.torrent_id, query.files);
            status = 200;
        }
    }
    

    return new Response("", {
        status: status
    });
}

