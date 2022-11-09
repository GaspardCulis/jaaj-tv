jaaj-TV
=======
A streaming website using YggTorrent files to get the video files.
Designed for people having a terrible internet connection.

Features
--------
- Search for movies and TV series with a wide range of filters
- Get a preview of the torrent files and choose the ones you want
- Network optimized video player which can loads and cache the video files in chunks while you do other things

Installation
------------
```bash
git clone https://github.com/GaspardCulis/jaaj-tv
cd jaaj-tv
npm i
npm run build
```

Usage
-----
```bash
npx astro preview --host --port 8080
```

Configuration
-------------
You can configure the website by editing the `jaajtv.config.json` file. Check the `jaajtv.config.example.json` file for more information.

You also need to create the `data/database.json` file. You can use the `data/database.example.json` file as a template.
