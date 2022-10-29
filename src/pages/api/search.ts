import { APIRoute } from "astro"
import { YggTorrent, Categories, SubCategories, SortBy, SortOrder } from "node-yggtorrent";
import axios from "axios";
import cheerio from 'cheerio';
import tnp from 'torrent-name-parser';
import probe from 'probe-image-size';



async function getImage(torrent_url: string) {
  const response = await axios.get(torrent_url).catch((err) => {
    console.log("Failed to get torrent page : ", torrent_url);
  });
  if (!response) return null;
  const $ = cheerio.load(response.data);
  const container = $(".default");
  let image = "false";
  while (image==="false" || image.endsWith(".gif")) {
    const img = container.find("img");
    if (!img) break;
    image = img.attr("src") || "false";

    if (image!== "false") {
      let result = await probe(image).catch((err) => console.log("Failed to get image : ", image, " on torrent : ", torrent_url));

      if (result) {
        const width = result?.width || 0;
        const height = result?.height || 0;
      
        const ratio = width / height;
        if (width < 100 || height < 100 || ratio > 1.5) {
          image = "false";
        }
      }
    }

    container.find("img").remove();
  }

  return image==="false" ? null : image;
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
        index,
        url: result.url,
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