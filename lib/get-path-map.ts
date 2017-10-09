import { join, basename, dirname } from 'path';
import * as globby from 'globby';
import getConfig from './config';
import { getGlobPatterns } from './util';
import getData from './get-data';
import { Tags, ExportPathMap } from './definitions/global';

const removeSlashes = (str: string): string => str.replace(/^\/|\/$/g, '');

const getPaths = async (prefix: string, pattern: string, ignore?: string) => {
  const paths = await globby(pattern, ignore ? { ignore } : null);
  return (
    paths
      .map(dirname)
      // tslint:disable-next-line:no-unnecessary-callback-wrapper
      .map((x: string) => basename(x))
      .map((x: string) => `/${x}/`)
  );
};

const getImagePaths = async (
  pattern: string,
  albumsDir: string
): Promise<string[]> => {
  const images = await globby(pattern);
  return images.map((filePath: string) => {
    const regExp = new RegExp(`^.*static/${albumsDir}`);
    return filePath.replace(regExp, '').replace(/\.(jpe?g|png|gif)$/, '/');
  });
};

const getAlbums = (albumsDir: string, albums: string[]): ExportPathMap =>
  albums.reduce(
    (acc: ExportPathMap, album: string) => ({
      ...acc,
      [`/${albumsDir}${album}`]: {
        query: {
          album: removeSlashes(album),
        },
        page: '/album',
      },
    }),
    {}
  );

const getPages = (pages: string[]): ExportPathMap =>
  pages.reduce(
    (acc: ExportPathMap, page: string) => ({
      ...acc,
      [page]: {
        query: {
          page: removeSlashes(page),
        },
        page: '/default',
      },
    }),
    {}
  );

const getTags = (tags: Tags): ExportPathMap =>
  Object.keys(tags).reduce(
    (acc: ExportPathMap, tag: string): ExportPathMap => ({
      ...acc,
      [`/tag/${tag}/`]: {
        query: { tag },
        page: '/tag',
      },
    }),
    {}
  );

const getImageQueryFromPath = (image: string) => {
  const parts = image.split('/').filter(Boolean);
  return {
    album: parts.shift(),
    image: parts.shift(),
  };
};

const getImages = (albumsDir: string, images: string[]): ExportPathMap =>
  images.reduce(
    (acc: ExportPathMap, image: string) => ({
      ...acc,
      [`/${albumsDir}${image}`]: {
        query: getImageQueryFromPath(image),
        page: '/image',
      },
    }),
    {}
  );

export default async (): Promise<ExportPathMap> => {
  const conf = getConfig();
  const { tags } = await getData(conf);
  const imagesPattern = join('static', conf.albumsDir, '**/*.{jpg,png,gif}');
  const patterns = getGlobPatterns(conf);
  const albumPaths = await getPaths(
    join(conf.contentDir, conf.albumsDir),
    patterns.albums
  );
  const imagePaths = await getImagePaths(imagesPattern, conf.albumsDir);
  const pagePaths = await getPaths(
    conf.contentDir,
    patterns.pages,
    patterns.albums
  );
  const pagePathsExceptIndex = pagePaths.filter(
    (x: string) => x !== `/${conf.contentDir}/`
  );
  const [index] = await globby(join(conf.contentDir, 'index.md'));

  if (!index) {
    throw Error('Please define a frontpage.');
  }

  return Object.assign(
    {
      '/': { page: '/' },
    },
    getAlbums(conf.albumsDir, albumPaths),
    getPages(pagePathsExceptIndex),
    getImages(conf.albumsDir, imagePaths),
    getTags(tags)
  );
};
