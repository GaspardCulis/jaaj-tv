import { APIRoute } from "astro"
import { YggTorrent, Categories, SubCategories, SortBy, SortOrder } from "node-yggtorrent";
import axios from "axios";
import cheerio from 'cheerio';
import tnp from 'torrent-name-parser';

async function getImage(torrent_url: string) {
  const response = await axios.get(torrent_url);
  const $ = cheerio.load(response.data);
  const container = $(".default");
  const image = container.find("img").attr("src");

  return image;
}

export const post: APIRoute = async ({ request }) => {
    const query = (await request.json()).query;
    const out = [];
    
    const ygg = new YggTorrent();
    await ygg.initializeBrowser();
    const results = await ygg.search({
        name: query.search,
        category: Categories.FILM_VIDEO,
        subCategory: SubCategories.FILM_VIDEO[query.category],
        sort: SortBy.COMPLETED,
        order: SortOrder.DESC
    });
    
    ygg.closeBrowser();

    // Scraping the result images and parsing names
    let i = 0; // For ordering
    await Promise.all(results.map(async (result) => {
      let index = i;
      i++;
      out.push({
        ...tnp(result.name),
        baseName: result.name,
        image: await getImage(result.url),
        index
      });
    }));
    // Reordering the results
    out.sort((a, b) => a.index - b.index);

    return new Response(JSON.stringify({
        results: out
      }), {
        status: 200
      })
}