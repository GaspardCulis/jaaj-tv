import { APIRoute } from "astro";
import UserManager from "../../model/usermanager";
import { isAuthorized } from "../../model/utils";

export const post: APIRoute = async ({ request }) => {
    const authorized = isAuthorized(request);
    if (!authorized) return { status: 401, body: "Unauthorized" };
    let status = 417;
    
    const query = (await request.json());
    query.torrent_id = parseInt(query.movie_id);

    const user = await UserManager.getUser(authorized as string);
    // Check if torrent id and folder name are valid and if the torrent file exists
    if (!isNaN(query.torrent_id) && user.getDownloader().isTorrentFileDownloaded(query.torrent_id) && query.folder_name) {
        // Check if the movie isn't already downloading and if the folder name is unique
        if (!(user.getDownloader().getTorrent(query.torrent_id) || [...user.getLibrary().getFolders().values()].includes(query.folder_name))) {
            const files = await user.getDownloader().getTorrentFiles(query.torrent_id);
            // Check if the torrent has requested files
            if (Array.isArray(query.files) && query.files.filter((file) => files.map(local_file => local_file.path.replace(/\\/g, "/")).includes(file)).length === query.files.length) {
                // Remove already downloaded files if movie is already in library
                if (user.getLibrary().exists(query.torrent_id)) {
                    const torrent = user.getLibrary().getTorrentInfo(query.torrent_id);
                    const to_delete = torrent.files.filter((file) => !query.files.includes(file.replace(/\\/g, "/")));
                    if (to_delete.length > 0) {
                        await user.getLibrary().deleteFiles(query.torrent_id, to_delete);
                    }
                    query.files = query.files.filter((file) => !torrent.files.map(local_file => local_file.replace(/\\/g, "/")).includes(file));
                }
                if (query.files.length > 0) {
                    user.getLibrary().addTorrent(query.torrent_id, query.files, query.folder_name);
                }
                status = 200;
            }
        }
    }
    

    return new Response("", {
        status: status
    });
}

