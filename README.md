
🦊 Phox
====

> Create a static photo site powered by Next.js 🖼

[![Build Status](https://travis-ci.org/herschel666/phox.svg?branch=master)](https://travis-ci.org/herschel666/phox)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Current package version](https://img.shields.io/npm/v/phox.svg)](https://npm.im/phoxg)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Features

- Automatic detail pages for every photo with contents from EXIF & IPTC metadata
- Overview pages for every keyword
- Manage your contents with Markdown files like in Gatsby or Jekyll
- Server-side rendered HTML for maximum performance
- Client-side routing for ease of use
- Image compression during build step

## Idea

[Next.js](https://npm.im/next) is great when it comes to building web applications. But setting up the above mentioned features for a (static) online gallery is a rather tedious task. Here **phox** comes into play: it enables you to manage your contents in Markdown files and inside the image metadata, so you can focus on building the site.

To achieve this **phox** relies on an opinionated set of views, which it provides the generated data for via an HTTP-API. Additionally **phox** provides a function for gathering all the pages of your photo site for a static export.

What **phox** doesn't provide is any kind of React views. It equips you with a way to fetch the data — you then build your Next.js site on top of it. To get and idea of how this might look like, have a look at the code of the [Simple Example](https://github.com/herschel666/phox/tree/master/examples/simple).

## Built with phox 🚀

 - [ek|photos](https://photos.klg.bz/) — [[source](https://github.com/herschel666/photoblog/)]
 - [Simple Example](https://phox.netlify.com/) — [[source](https://github.com/herschel666/phox/tree/master/examples/simple)]

## How to use

### Setup

Install the requirements:

```shell
$ npm install phox next react react-dom --save
```

Add a `scripts`-block to your `package.json`, like …

```json
{
  "scripts": {
    "dev": "node server.js",
    "export": "phox"
  }
}
```

Set up a `server.js` in your project-root.

```js
const { createServer } = require('phox');

createServer().then(({ server }) =>
    // phox uses port 3000 by default; see section
    // "Configuration" to learn how to change that
    server.listen(3000, (err) => {
        if (err) throw err;
        console.log('Server running on port 3000 ...');
    }));
```

Create content and pages. The folder structure should look like this:

```
./
├── content/
│   ├── albums/
│   │   ├── my-awesome-album/
│   │   │   └── index.md
│   │   └── my-other-awesome-album/
│   │       └── index.md
│   ├── a-random-page/
│   │   └── index.md
│   └── index.md
├── pages/
│   ├── album.js
│   ├── default.js
│   ├── image.js
│   ├── index.js
│   └── tag.js
└── static/
    └── albums/
        ├── my-awesome-album/
        │   ├── image-1.jpg
        │   └── image-2.jpg
        └── my-other-awesome-album/
            ├── image-1.jpg
            └── image-2.jpg
```

Start the dev-server:

```shell
$ npm run dev
```

The site is now available on http://localhost:3000/.

When everything is up and running and ready to be released, set up a `next.config.js` in the project's root:

```js
const { getPathMap } = require('phox');

module.exports = {
    async exportPathMap() {
        return getPathMap();
    },
};
```

Now run …

```shell
$ npm run export
```

That's it. The static site will be in the `./out`-folder.

## Albums

Albums are represented by folders inside `./content/albums/`. They just contain an `index.md`, that holds the text contents of the album page. Frontmatter — like in Jekyll — is supported. 

**Example**

```markdown
---
title: My awesome ride
created: 2017-09-03
---

Lorem **ipsum** dolot [look ma I am a link](http://example.org).
```

To populate the album page with photos, create an album-folder in `./static/albums/` with the same name as your album and put all images in there. The **phox**-HTTP-API will provide you with a list of all the images of an album and their metadata.

Each image will also get a detail page. The content of these detail pages will be fetched directly from the metadata. This means title, description, etc. are managed in e.g. Lightroom or any other application, that let's you manage metadata.

The following list shows, which data is currently derived from [EXIF](https://npm.im/exif)/[IPTC](https://npm.im/node-iptc) and how it is exposed to the application:

```
iptc.object_name       => title
iptc.caption           => description
iptc.keywords          => tags
iptc.date_created      => createdAt
exif.image.Model       => camera
exif.exif.LensModel    => lens
exif.exif.ISO          => iso
exif.exif.FNumber      => aperture
exif.exif.FocalLength  => focalLength
exif.exif.ExposureTime => exposureTime
exif.exif.Flash        => flash
exif.gps               => gps (transformed to { lat, lng })
 --                    => orientation ('portrait', 'landscape' or 'square')
 --                    => width (in px)
 --                    => height (in px)
```

The `description` can hold Markdown! All the metadata for an image is provided by the **phox**-HTTP-API.

## Frontpage & other pages

Besides the albums there's a frontpage (`./content/index.md`) required for your site to work.

You also have the possibility to add additional static pages, e.g. `./content/about/index.md`. Because linking in static static Next sites is not trivial, it is not possible to nest static pages.

## Views

Views are located in the `./pages/`-folder. There are four of them to represent the different kind of pages.

```
─ album.js   // For the album view
─ default.js // For arbitrary pages
─ image.js   // For the detail pages of images
─ index.js   // For the frontpage
─ tag.js     // For the overview page of a keyword
```

Inside their `getInitialProps`-method they can fetch their contents from the respective **phox**-HTTP-API.

## Configuration

Configuration is optional in **phox**. But if you want to change the default settings, set up a `./phox.config.js` and in there export your configuration object.

```js
module.exports = {
    // my settings ...
};
```

There are the following options.

| Name                | Type      | Default       | Description |
| :-----------------  | :-------: | :------------ | :---------- |
| `contentDir`        | `string`  | `'content'`   | Location of your Markdown contents. |
| `albumsDir`         | `string`  | `'albums'`    | Location of your album folders — Markdown contents & images |
| `outDir`            | `string`  | `'out'`       | Location of the exported, static site. |
| `port`              | `number`  | `3000`        | Port of the **phox**-HTTP-API |
| `hostname`          | `string`  | `'localhost'` | Hostname of the **phox**-HTTP-API |
| `server`            | `string`  | `'server.js'` | Filename of the server file |
| `imageOptimization` | `object`  |               | Holds configuration for the image optimization during the export |
| `imageOptimization.progressive`     | `boolean` | `true`        | Lossless conversion to progressive JPGs. |
| `imageOptimization.quality`         | `string`  | `'65-80'`     | Quality of PNG-compression ([more infos](https://www.npmjs.com/package/imagemin-pngquant#quality)) |

The config inside `./phox.config.js` is also respected by `bin/phox`.

## **phox**-HTTP-API

`phox/server` provides you with all the data you need in your views.

### `/data/index.json`

Returns the frontpage's contents and a list of all the albums with metadata & `<Link />`-props.

### `/data/albums/(:album).json`

Returns the contents of the album & a list of all photos, including metadata and `<Link />`-props for the detail pages.

### `/data/albums/(:album)/(:image).json`

Returns all the metadata of an image. Additionally there are the title & the `<Link />`-props of the previous and the next image, (if available).

### `/data/tag/(:tag).json`

Returns the contents of the overview page of a given keyword.

### `/data/(:page).json`

Returns the contents of arbitrary pages.

_Note: if you set a custom value for `albumsDir` in the configuration, the HTTP-endpoint for albums & images will change accordingly._

## Adding custom routes to the server

In the `server.js` import the `Router`, define your custom routes and pass the router into the `createServer`-function.

```js
const { createServer, Router } = require('phox');
const router = Router();

router.get('/api/say/:text/', (req, res) => res.json({
  text: decodeURIComponent(req.params.text),
}));

createServer(router).then(({ server }) => server.listen(…);
```

The `Router` exported by **phox** is the one from [Express](http://expressjs.com/). So you can refer to [their documentation](http://expressjs.com/en/guide/routing.html#express-router) to learn more about its usage.

Have in mind that you can only use these custom routes during development. They won't be available after you'va statically built your site with **phox**.

## Contributing

If you have a question or found a bug, feel free [to open an issue](https://github.com/herschel666/phox/issues). If you have an idea, what is wrong, you're highly encouraged, to open a pull request.

## Author

Emanuel Kluge ([@Herschel_R](https://twitter.com/Herschel_R))

## LICENSE

Copyright 2018 Emanuel Kluge

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
