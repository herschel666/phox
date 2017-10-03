import * as path from 'path';
import { watch } from 'chokidar';
import fm = require('front-matter');
import * as marked from 'marked';
import * as globby from 'globby';
import * as util from './util';
import getImageMeta from './get-image-meta';
import {
  Album,
  Config,
  Data,
  FrontMatter,
  Image,
  Page,
} from './definitions/global';

interface PageCache {
  [pagePath: string]: Page;
}

interface ImageCache {
  [pattern: string]: Image;
}

let pageCache: PageCache = {};
let imageCache: ImageCache = {};

const getDirName = (pathName: string): string =>
  path
    .dirname(pathName)
    .split(path.sep)
    .pop();

const removeFromCache = (cacheType: 'page' | 'image') => (
  filePath: string
): void => {
  if (!filePath.endsWith('.md') && !filePath.endsWith('.jpg')) {
    return;
  }

  const cache = cacheType === 'page' ? pageCache : imageCache;
  const relativeFilePath = util.stripSlashes(
    filePath.replace(process.cwd(), '')
  );

  if (!Boolean(cache[relativeFilePath])) {
    return;
  }

  const newCache = Object.keys(cache)
    .filter((f: string): boolean => f !== relativeFilePath)
    .reduce(
      (acc: PageCache | ImageCache, f: string): PageCache | ImageCache =>
        Object.assign({ [f]: cache[f] }, acc),
      {}
    );

  switch (cacheType) {
    case 'page':
      pageCache = newCache;
      break;
    case 'image':
      imageCache = newCache;
      break;
  }
};

const getDataForImage = (albumsDir: string, albumName: string) => (
  file: string
): Image => ({
  filePath: file,
  detailLinkProps: util.getDetailLinkProps(albumsDir, albumName, file),
  fileName: path.basename(file),
});

const getMetaFromImage = async (image: Image): Promise<Image> => {
  const strippedImagePath = util.stripSlashes(image.filePath);
  if (imageCache[strippedImagePath]) {
    return imageCache[strippedImagePath];
  }

  const meta = await getImageMeta(image.filePath);
  imageCache = Object.assign({}, imageCache, {
    [strippedImagePath]: { ...image, meta },
  });
  return imageCache[strippedImagePath];
};

export const getImages = async (
  albumsDir: string,
  albumName: string
): Promise<Image[]> => {
  const pattern = path.join('static', albumsDir, albumName, '*.jpg');
  const files = await globby(pattern);
  const images = files.map(getDataForImage(albumsDir, albumName));
  return await Promise.all(images.map(getMetaFromImage));
};

export const getPageContent = async (
  pagePath: string,
  pathPrefix: string = ''
): Promise<Page> => {
  const strippedPagePath = util.stripSlashes(pagePath);
  if (pageCache[strippedPagePath]) {
    return pageCache[strippedPagePath];
  }

  const content = await util.pReadFile(pagePath);
  const { attributes, body }: FrontMatter = fm(String(content));
  const name = getDirName(pagePath);
  pageCache = Object.assign({}, pageCache, {
    [strippedPagePath]: {
      meta: attributes,
      path: `/${pathPrefix}${name}/`,
      body: marked(body),
      name: name === 'content' ? 'frontpage' : name,
    },
  });
  return pageCache[strippedPagePath];
};

const getAlbums = (albumsDir: string) => async (
  albumFile: string
): Promise<Album> => {
  const albumName = getDirName(albumFile);
  const [content, images] = await Promise.all([
    getPageContent(albumFile, `${albumsDir}/`),
    getImages(albumsDir, albumName),
  ]);
  return { content, images };
};

const getPages = async (
  pagesGlob: string,
  albumsGlob: string,
  contentDir: string
): Promise<Page[]> => {
  const files = await globby(pagesGlob, { ignore: albumsGlob });
  return await Promise.all(
    files.map(async (file: string) => getPageContent(file))
  );
};

export const initCachePurger = (config: Config): void => {
  const { pages } = util.getGlobPatterns(config);
  const images = path.join('static', config.albumsDir, '**/*.jpg');
  const pagesMonitor = watch(pages);
  const imagesMonitor = watch(images);

  pagesMonitor.on('change', removeFromCache('page'));
  pagesMonitor.on('unlink', removeFromCache('page'));
  imagesMonitor.on('change', removeFromCache('image'));
  imagesMonitor.on('unlink', removeFromCache('image'));
};

export default async (config: Config): Promise<Data> => {
  const patterns = util.getGlobPatterns(config);
  const albumFiles = await globby(patterns.albums);
  const albums = await Promise.all(albumFiles.map(getAlbums(config.albumsDir)));
  const pages = await getPages(
    patterns.pages,
    patterns.albums,
    config.contentDir
  );
  return { albums, pages };
};
