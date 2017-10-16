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
  Tag,
  TagApiData,
} from './definitions/global';

interface PageCache {
  [pagePath: string]: Page;
}

interface ImageCache {
  [filePath: string]: Image;
}

type TagCache = TagApiData[];

let pageCache: PageCache = {};
let imageCache: ImageCache = {};
let tagCache: TagCache = [];

const getDirName = (pathName: string): string =>
  path
    .dirname(pathName)
    .split(path.sep)
    .pop();

const sortTagsByTitle = (a: TagApiData, b: TagApiData): number =>
  a.title.localeCompare(b.title);

const sortImagesByTitle = (a: Image, b: Image): number =>
  a.meta.title.localeCompare(b.meta.title);

const sortTagCacheAlphabetically = (t: TagCache): TagCache =>
  t.sort(sortTagsByTitle).map((tag: TagApiData) => ({
    ...tag,
    images: tag.images.sort(sortImagesByTitle),
  }));

const getIndexOfTagInCache = (slug: string, t: TagCache): number =>
  t.findIndex((item: TagApiData) => item.slug === slug);

const getIndexOfImageInTagCache = (
  t: TagCache,
  tagIndex: number,
  filePath: string
): number =>
  t[tagIndex].images.findIndex(
    (img: Image): boolean => img.filePath === filePath
  );

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

const addImageToTagCache = (image: Image): TagCache =>
  image.meta.tags.reduce(
    (acc: TagCache, tag: Tag): TagCache => {
      const tagIndex = getIndexOfTagInCache(tag.slug, acc);

      if (tagIndex === -1) {
        const tagCacheItem = {
          ...tag,
          images: [image],
        };
        return acc.concat(tagCacheItem);
      }

      const imageIndex = getIndexOfImageInTagCache(
        acc,
        tagIndex,
        image.filePath
      );

      if (imageIndex === -1) {
        acc[tagIndex].images = acc[tagIndex].images.concat(image);
      } else {
        acc[tagIndex].images = acc[tagIndex].images
          .slice(0, imageIndex)
          .concat([image].concat(acc[tagIndex].images.slice(imageIndex + 1)));
      }
      return acc;
    },
    [...tagCache]
  );

const removeImageFromTagCache = (filePath: string): void => {
  if (!filePath.endsWith('.jpg')) {
    return;
  }
  const relativeFilePath = util.stripSlashes(
    filePath.replace(process.cwd(), '')
  );

  tagCache = sortTagCacheAlphabetically(
    tagCache.reduce(
      (acc: TagCache, tag: TagApiData, i: number): TagCache => {
        const imageIndex = getIndexOfImageInTagCache(acc, i, relativeFilePath);

        if (imageIndex === -1) {
          return acc;
        }

        if (tag.images.length === 1) {
          acc[i].images = [];
          return acc;
        }

        acc[i].images = tag.images
          .slice(0, imageIndex)
          .concat(tag.images.slice(imageIndex + 1));

        return acc;
      },
      [...tagCache]
    )
  );
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
  const imageWithMeta = { ...image, meta };
  imageCache = Object.assign({}, imageCache, {
    [strippedImagePath]: imageWithMeta,
  });
  tagCache = sortTagCacheAlphabetically(addImageToTagCache(imageWithMeta));
  return imageWithMeta;
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
  imagesMonitor.on('change', removeImageFromTagCache);
  imagesMonitor.on('unlink', removeImageFromTagCache);
};

export const getDataforTag = async (
  config: Config,
  tagSlug: string
): Promise<TagApiData> => {
  const tagIndex = getIndexOfTagInCache(tagSlug, tagCache);

  if (tagIndex === -1) {
    return;
  }

  return tagCache[tagIndex];
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
  const tags = tagCache;
  return { albums, pages, tags };
};
