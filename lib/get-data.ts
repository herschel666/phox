import * as path from 'path';
import { watch } from 'chokidar';
import fm = require('front-matter');
import * as marked from 'marked';
import * as globby from 'globby';
import * as debug from 'debug';
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

interface Caches {
  [cacheType: string]: PageCache | ImageCache | TagCache;
}

const log = debug('phox:get-data');

const caches: Caches = {
  pageCache: {},
  imageCache: {},
  tagCache: [],
};

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

const removeFromCache = <T>(
  allCaches: Caches,
  cacheType: 'pageCache' | 'imageCache'
) => (filePath: string): void => {
  if (!filePath.endsWith('.md') && !filePath.endsWith('.jpg')) {
    return;
  }

  const relativeFilePath: string = util.stripSlashes(
    filePath.replace(process.cwd(), '')
  );
  const cacheObject: any = allCaches[cacheType];
  const item: Page | Image = cacheObject[relativeFilePath];

  if (!Boolean(item)) {
    return;
  }

  log('Purge cache for file "%s".', filePath);

  allCaches[cacheType] = Object.keys(cacheObject)
    .filter((f: string): boolean => f !== relativeFilePath)
    .reduce(
      (acc: any, f: string): T => ({
        [f]: cacheObject[f],
        ...acc,
      }),
      {}
    );
};

const addImageToTagCache = (image: Image): TagCache => {
  log('Add image "%s" to cache.', image.filePath);

  return image.meta.tags.reduce(
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
    [...(caches.tagCache as TagCache)]
  );
};

const removeImageFromTagCache = (filePath: string): void => {
  if (!filePath.endsWith('.jpg')) {
    return;
  }
  const relativeFilePath = util.stripSlashes(
    filePath.replace(process.cwd(), '')
  );

  log('Remove image "%s" from cache.', filePath);

  caches.tagCache = sortTagCacheAlphabetically(
    (caches.tagCache as TagCache).reduce(
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
      [...(caches.tagCache as TagCache)]
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
  const imageCache = caches.imageCache as ImageCache;
  if (imageCache[strippedImagePath]) {
    return imageCache[strippedImagePath];
  }

  const meta = await getImageMeta(image.filePath);
  const imageWithMeta = { ...image, meta };
  caches.imageCache = {
    ...imageCache,
    [strippedImagePath]: imageWithMeta,
  };
  caches.tagCache = sortTagCacheAlphabetically(
    addImageToTagCache(imageWithMeta)
  );
  return imageWithMeta;
};

export const getImages = async (
  albumsDir: string,
  albumName: string
): Promise<Image[]> => {
  const pattern = path.join('static', albumsDir, albumName, '*.jpg');
  const files = await globby(pattern);
  const images = files.map(getDataForImage(albumsDir, albumName));

  log('Retrieved %d images for pattern "%s".', images.length, pattern);

  return Promise.all(images.map(getMetaFromImage));
};

export const getPageContent = async (
  pagePath: string,
  pathPrefix: string = ''
): Promise<Page> => {
  log('Requesting page "%s"...', pagePath);

  const strippedPagePath = util.stripSlashes(pagePath);
  const pageCache = caches.pageCache as PageCache;
  if (pageCache[strippedPagePath]) {
    log('Serve page from cache.', pagePath);
    return pageCache[strippedPagePath];
  }

  const content = await util.pReadFile(pagePath);
  const { attributes, body }: FrontMatter = fm(String(content));
  const name = getDirName(pagePath);
  caches.pageCache = {
    ...pageCache,
    [strippedPagePath]: {
      meta: attributes,
      path: `/${pathPrefix}${name}/`,
      body: marked(body),
      name: name === 'content' ? 'frontpage' : name,
    },
  };

  log('Freshly fetched page from the file system.');

  return caches.pageCache[strippedPagePath];
};

const getAlbums = (albumsDir: string) => async (
  albumFile: string
): Promise<Album> => {
  log('Requesting album "%s".', albumFile);

  const albumName = getDirName(albumFile);
  const [content, images] = await Promise.all([
    getPageContent(albumFile, `${albumsDir}/`),
    getImages(albumsDir, albumName),
  ]);

  log('Found %d images for album "%s".', images.length, content.meta.title);

  return { content, images };
};

const getPages = async (
  pagesGlob: string,
  albumsGlob: string,
  contentDir: string
): Promise<Page[]> => {
  const files = await globby(pagesGlob, { ignore: albumsGlob });
  return Promise.all(files.map(async (file: string) => getPageContent(file)));
};

export const initCachePurger = (config: Config): void => {
  log('Initialize cache purger.');

  const { pages } = util.getGlobPatterns(config);
  const images = path.join('static', config.albumsDir, '**/*.jpg');
  const pagesMonitor = watch(pages);
  const imagesMonitor = watch(images);

  pagesMonitor.on('change', removeFromCache<PageCache>(caches, 'pageCache'));
  pagesMonitor.on('unlink', removeFromCache<PageCache>(caches, 'pageCache'));
  imagesMonitor.on('change', removeFromCache<ImageCache>(caches, 'imageCache'));
  imagesMonitor.on('unlink', removeFromCache<ImageCache>(caches, 'imageCache'));
  imagesMonitor.on('change', removeImageFromTagCache);
  imagesMonitor.on('unlink', removeImageFromTagCache);
};

export const getDataforTag = async (
  config: Config,
  tagSlug: string
): Promise<TagApiData> => {
  const tagIndex = getIndexOfTagInCache(tagSlug, caches.tagCache as TagCache);

  if (tagIndex === -1) {
    log('No cache data available for tag slug "%s".', tagSlug);
    return;
  }

  log('Found tag "%s" in cache.', cache[tagIndex].title);

  return cache[tagIndex];
};

export default async (config: Config): Promise<Data> => {
  log('Retrieving complete site data.');

  const patterns = util.getGlobPatterns(config);
  const albumFiles = await globby(patterns.albums);
  const albums = await Promise.all(albumFiles.map(getAlbums(config.albumsDir)));
  const pages = await getPages(
    patterns.pages,
    patterns.albums,
    config.contentDir
  );
  const tags = caches.tagCache as TagCache;

  log('Albums: %O', albums);
  log('Pages: %O', pages);
  log('Tags: %O', tags);

  return { albums, pages, tags };
};
