import { APIRoute } from "astro"
import { YggTorrent, Categories, SubCategories } from "node-yggtorrent";

export const post: APIRoute = async ({ request }) => {
    const query = (await request.json()).query;
    
    const ygg = new YggTorrent();
    await ygg.initializeBrowser();
    const results = await ygg.search({
        name: query.search,
        category: Categories.FILM_VIDEO,
        subCategory: SubCategories.FILM_VIDEO[query.category],
    });

    console.log(results);

    return new Response(JSON.stringify({
        results: results
      }), {
        status: 200
      })
}