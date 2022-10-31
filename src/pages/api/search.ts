import { APIRoute } from "astro"
import { YggTorrent, Categories, SubCategories, SortBy, SortOrder } from "node-yggtorrent";
import axios from "axios";
import cheerio from 'cheerio';
import tnp from 'torrent-name-parser';
import probe from 'probe-image-size';
import { cacheResults, getCachedResults } from '../../model/database';

const DEBUG = false;
function debug(msg: string) {
  if (DEBUG) console.log(msg);
}

async function getImage(torrent_url: string) {
  const response = await axios.get(torrent_url).catch((err) => {
    console.log("Failed to get torrent page : ", torrent_url);
  });
  if (!response) return null;
  const $ = cheerio.load(response.data);
  const container = $(".default");
  let image = "false";
  debug("Finding image for " + torrent_url);
  while (image=="false" || image.endsWith(".gif")) {
    const img = container.find("img");
    if (!img.length) {
      debug("\tNo image found for : " + torrent_url); 
      break;
    }
    image = img.attr("src") || "false";
    debug("\tChecking image : " + image);

    if (image!== "false") {
      let result = await probe(image).catch((err) => {debug("\tFailed to get image : " + image)});

      if (result) {
        const width = result?.width || 0;
        const height = result?.height || 0;
      
        const ratio = width / height;
        if (width < 100 || height < 100 || ratio >= 2) {
          debug("\tImage too small or bad ratio, trying next one... : " + image);
          image = "false";
        }
      }
    }
    
    img.remove();
  }

  debug("\tImage found : " + image);
  return image==="false" ? null : image;
}

export const post: APIRoute = async ({ request }) => {
    const query = (await request.json()).query;
    const out =  getCachedResults(query) || [];

    console.log("Searching for : ", query);
    if (!out.length) {
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
      /*
      for (let result of results) {
        let index = i;
        i++;
        out.push({
          ...tnp(result.name),
          baseName: result.name,
          image: await getImage(result.url),
          index,
          url: result.url,
        });
      }
      */
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

      cacheResults(query, out);
    } else {
      console.log("\t -> Using cached results");
    }

    return new Response(JSON.stringify({
      results: out
    }), {
      status: 200
    })
}