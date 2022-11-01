import { APIRoute } from "astro"
import { YggTorrent, Categories, SubCategories, SortBy, SortOrder, Torrent } from "node-yggtorrent";
import axios from "axios";
import cheerio, { Cheerio, CheerioAPI, Element } from 'cheerio';
import tnp from 'torrent-name-parser';
import probe from 'probe-image-size';
import { cacheResults, getCachedResults } from '../../model/database';
import { FinalResult, GOOGLE_IMG_SCRAP } from 'google-img-scrap';

const DEBUG = false;
function debug(msg: string) {
  if (DEBUG) console.log(msg);
}

abstract class ImageProvider {
  abstract next(): Promise<string>;

  abstract hasNext(): Promise<boolean>;
}

class YggTorrentImageProvider extends ImageProvider {
  private torrent_url: string;
  private dom: CheerioAPI;
  private index = 0;
  private images: Element[];
  
  constructor(torrent_url: string) {
    super();
    this.torrent_url = torrent_url;
  }

  private async ensureDom(): Promise<boolean> {
    if (!this.dom) {
      const response = await axios.get(this.torrent_url).catch((err) => {
        console.log("Failed to get torrent page : ", this.torrent_url);
      });
      if (response) {
        this.dom = cheerio.load(response.data);
        const container = this.dom(".default");
        this.images = container.find("img").toArray();
      };
    }

    return !!this.dom;
  }

  async next(): Promise<string> {
    if (!await this.ensureDom()) return null;
    
    return this.images[this.index++].attribs.src;
  }

  async hasNext(): Promise<boolean> {
    if (!await this.ensureDom()) return false;

    return this.images && this.index < this.images.length;
  }
}

class GoogleImageProvider extends ImageProvider {
  private query: string;
  private images: FinalResult[];
  private index = 0;

  constructor(query: string) {
    super();
    this.query = query;
  }

  async ensureImages(): Promise<boolean> {
    if (!this.images) {
      this.images = (await GOOGLE_IMG_SCRAP({search: this.query})).result;
    }

    return !!this.images;
  }

  async next(): Promise<string> {
    if (!await this.ensureImages()) return null;
    return this.images[this.index++].url;
  }

  async hasNext(): Promise<boolean> {
    if (!await this.ensureImages()) return false;
    return this.images && this.index < this.images.length;
  }
}

async function isImageValid(image_url: string): Promise<boolean> {
  if (image_url.endsWith(".gif")) return false;
  let result = await probe(image_url).catch((err) => {debug("\tFailed to get image : " + image_url);});
  if (!result) return false;
  const ratio = result.width / result.height;
  if(ratio < 0.5 || ratio > 0.9 || result.width < 300 || result.height < 300) return false;

  return true;
}

async function getImage(torrent: Torrent, torrent_name: string) {
  const image_providers = [
    new YggTorrentImageProvider(torrent.url),
    new GoogleImageProvider(torrent_name || torrent.name),
  ];
  for (const provider of image_providers) {
    while (await provider.hasNext()) {
      const image_url = await provider.next();
      if (await isImageValid(image_url)) {
        return image_url;
      }
    }
  }

  return null;
}

export const post: APIRoute = async ({ request }) => {
    const query = (await request.json());
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

      await Promise.all(results.map(async (result) => {
        let index = i;
        i++;
        const parsed_torrent = tnp(result.name);
        out.push({
          id: result.id,
          ...parsed_torrent,
          baseName: result.name,
          image: await getImage(result, parsed_torrent.title),
          index
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