import { APIRoute } from "astro"
import { YggTorrent, Categories, SubCategories, SortBy, SortOrder } from "node-yggtorrent";
import axios from "axios";
import cheerio from 'cheerio';
import tnp from 'torrent-name-parser';

async function getImage(torrent_url: string) {
  const response = await axios.get(torrent_url);
  const $ = cheerio.load(response.data);
  const container = $(".default");
  let image = "false";
  while (image==="false" || image.endsWith(".gif")) {
    const img = container.find("img");
    if (!img) break;
    image = img.attr("src") || "";

    const width = img.attr("width") || "0";
    const height = img.attr("height") || "0";
    const ratio = parseInt(width) / parseInt(height);
    if ((parseInt(width) < 100 || parseInt(height) < 100 || ratio > 1) && (width !== "0" && height !== "0")) {
      image = "false";
    }

    container.find("img").remove();
  }

  console.log(image);

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