
🦊 Phox
====

> Create a photo blog powered by Next. 🖼

[![Build Status](https://travis-ci.org/herschel666/phox.svg?branch=master)](https://travis-ci.org/herschel666/phox)

**phox**  let's you create a static photo blog with automatic detail pages for every image and EXIF-/IPTC-extraction. Maintain your contents in Markdown and write your views with React.

**Warning**: **phox** is still a release-candidate, breaking changes may occur.

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
const createServer = require('phox/server');
const next = require('next');

const quiet = true;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, quiet });
const handle = app.getRequestHandler();

app.prepare()
    .then(() => createServer(app, handle))
    .then(server =>
        server.listen(3000, (err) => {
            if (err) throw err;
        }));
```

Create content and pages. The folder structure should look like this:

```
content/
├── albums/
│   ├── my-awesome-album/
│   │   └── index.md
│   └── my-other-awesome-album/
│       └── index.md
├── a-random-page/
│   └── index.md
└── index.md
pages/
├── album.js
├── default.js
├── image.js
└── index.js
static/
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
const getPathMap = require('phox/export');

module.exports = {
    async exportPathMap() {
        return await getPathMap();
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
iptc.date_created      => createdAt
exif.image.Model       => camera
exif.exif.LensModel    => lens
exif.exif.ISO          => iso
exif.exif.FNumber      => aperture
exif.exif.FocalLength  => focalLength
exif.exif.ExposureTime => exposureTime
exif.exif.Flash        => flash
exif.gps               => gps (transformed to { lat, lng })
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
```

Inside their `getInitialProps`-method they can their contents from the respective **phox**-HTTP-API.

## Configuration

Configuration is optional in **phox**. But if you want to change the default settings, set up a `./phox.config.js` and in there export your configuration object.

```js
module.exports = {
    // my settings ...
};
```

There are the following options.

| Name | Type | Default | Description |
| :--- | :---: | :--- | :--- |
| contentDir | string | 'content'   | Location of your Markdown contents. |
| albumsDir  | string | 'albums'    | Location of your album folders — Markdown contents & images|
| outDir     | string | 'out'       | Location of the exported, static site. |
| port       | number | 3000        | Port of the **phox**-HTTP-API |
| hostname   | string | 'localhost' | Hostname of the **phox**-HTTP-API |
| server     | string | 'server.js' | Filename of the server file |

The config inside `./phox.config.js` is also respected by `bin/phox`.

## **phox**-HTTP-API

`phox/server` provides you with all the data you need in your views.

### `/data/index.json`

Returns the frontpage's contents and al list of all the albums with title & `<Link />`-props.

### `/data/albums/(:album).json`

Returns the contents of the album & a list of all photos, including metadata and `<Link />`-props for the detail pages.

### `/data/albums/(:album)/(:image).json`

Returns all the metadata of an image. Additionally there are the title & the `<Link />`-props of the previous and the next image, (if available).

### `/data/(:page).json`

Returns the contents of arbitrary pages.

_Note: if you set a custom value for `albumsDir` in the configuration, the HTTP-endpoint for albums & images will change accordingly._

## Contributing

If you have a question or found a bug, feel free [to open an issue](https://github.com/herschel666/phox/issues). If you have an idea, what is wrong, you're highly encouraged, to open a pull request.

## Author

Emanuel Kluge ([@Herschel_R](https://twitter.com/Herschel_R))

## LICENSE

Copyright 2017 Emanuel Kluge

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
