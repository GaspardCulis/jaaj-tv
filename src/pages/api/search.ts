import { APIRoute } from "astro"
import { Categories, SubCategories, SortBy, SortOrder } from "node-yggtorrent";
import tnp from 'torrent-name-parser';
import { cacheResults, getCachedResults } from '../../model/database';
import { isAuthorized } from '../../model/utils';
import { getImage } from "../../model/imageprovider";
import UserManager from "../../model/usermanager";

export const post: APIRoute = async ({ request }) => {
    const authorized = isAuthorized(request);
    if (!authorized) return { status: 401, body: "Unauthorized" };

    const user = await UserManager.getUser(authorized as string);
    
    const query = (await request.json());
    const is_custom = query.is_custom || false;
    delete query.is_custom;
    const out = []// getCachedResults(query) || [];

    console.log("Searching for : ", query);
    if (!out.length && !is_custom) {
      const ygg = user.getClient();
      
      const results = await ygg.search({
          name: query.search,
          category: Categories.FILM_VIDEO,
          subCategory: SubCategories.FILM_VIDEO[query.category],
          sort: SortBy.COMPLETED,
          order: SortOrder.DESC
      });

      // Scraping the result images and parsing names
      let i = 0; // For ordering

      await Promise.all(results.map(async (result) => {
        let index = i;
        i++;
        const parsed_torrent = tnp(result.name);
        out.push({
          id: result.id,
          ...parsed_torrent,
          baseName: result.name,
          image: await getImage(result, parsed_torrent.title) || "/assets/placeholder.jpg",
          index,
          url: result.url,
        });
      }));
      // Reordering the results
      out.sort((a, b) => a.index - b.index);

      cacheResults(query, out);
    } else if(out.length) {
      console.log("\t -> Using cached results");
    }

    return new Response(JSON.stringify({
      results: out
    }), {
      status: 200
    })
}