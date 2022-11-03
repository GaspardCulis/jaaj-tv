import axios from "axios";
import cheerio, { CheerioAPI, Element } from 'cheerio';
import { FinalResult, GOOGLE_IMG_SCRAP } from "google-img-scrap";
import probe from 'probe-image-size';
import { Torrent } from "node-yggtorrent";


abstract class ImageProvider { // BOIIIILLERRRPLATTE USELESS but makes me look like a pro
    abstract init(): Promise<void>;

    abstract next(): Promise<string>;

    abstract hasNext(): Promise<boolean>;
}

export class YggTorrentImageProvider extends ImageProvider {
    private torrent_url: string;
    private dom: CheerioAPI;
    private index = 0;
    private images: Element[];

    constructor(torrent_url: string) {
        super();
        this.torrent_url = torrent_url;
    }

    async init(): Promise<void> {
        const response = await axios.get(this.torrent_url).catch((err) => {
            console.log("Failed to get torrent page : ", this.torrent_url);
        });
        if (response) {
            this.dom = cheerio.load(response.data);
            const container = this.dom(".default");
            this.images = container.find("img").toArray();
        };
    }

    async next(): Promise<string> {
        return this.images[this.index++].attribs.src;
    }

    async hasNext(): Promise<boolean> {
        return this.images && this.index < this.images.length;
    }
}

export class GoogleImageProvider extends ImageProvider {
    private query: string;
    private images: FinalResult[];
    private index = 0;

    constructor(query: string) {
        super();
        this.query = query;
    }

    async init(): Promise<void> {
        this.images = (await GOOGLE_IMG_SCRAP({search: this.query})).result;
    }

    async next(): Promise<string> {
        return this.images[this.index++].url;
    }

    async hasNext(): Promise<boolean> {
        return this.images && this.index < this.images.length;
    }
}


export async function isImageValid(image_url: string): Promise<boolean> {
    if (image_url.endsWith(".gif")) return false;
    let result = await probe(image_url).catch((err) => {console.log("\tFailed to get image : " + image_url);});
    if (!result) return false;
    const ratio = result.width / result.height;
    if(ratio < 0.5 || ratio > 0.9 || result.width < 300 || result.height < 300) return false;

    return true;
}


export async function getImage(torrent: Torrent, torrent_name: string) {
    const image_providers = [
        new YggTorrentImageProvider(torrent.url),
        new GoogleImageProvider(torrent_name || torrent.name),
    ];
    for (const provider of image_providers) {
        await provider.init();
        while (await provider.hasNext()) {
            const image_url = await provider.next();
            if (await isImageValid(image_url)) {
                return image_url;
            }
        }
    }

    return null;
}