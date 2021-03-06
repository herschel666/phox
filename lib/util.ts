import { promisify } from 'util';
import { readFile } from 'fs';
import * as path from 'path';
import { LinkProps, Config } from './definitions/global';

export const pReadFile = promisify(readFile);

export const stripSlashes = (s: string): string => s.replace(/^\/*|\/*$/g, '');

export const sortAlphabetically = (a: string, b: string): number =>
  a.localeCompare(b);

export const log = (...args: any[]) => {
  const first = [`🦊  ${args.shift()}`];
  // tslint:disable-next-line:no-console
  console.log(...first.concat(args));
};

export const getDetailLinkProps = (
  albumsDir: string,
  albumName: string,
  filePath: string
): LinkProps => {
  const baseFileName = path.basename(filePath, '.jpg');
  const href = {
    pathname: '/image',
    query: {
      album: albumName,
      image: baseFileName,
    },
  };
  // tslint:disable-next-line:no-reserved-keywords
  const as = {
    pathname: `/${albumsDir}/${albumName}/${baseFileName}/`,
  };

  // tslint:disable-next-line:no-reserved-keywords
  return { href, as };
};

export const getAlbumLinkProps = (
  albumsDir: string,
  albumName: string
): LinkProps => ({
  href: {
    pathname: '/album',
    query: {
      album: albumName,
    },
  },
  // tslint:disable-next-line:no-reserved-keywords
  as: {
    pathname: `/${albumsDir}/${albumName}/`,
  },
});

export const getGlobPatterns = (config: Config) => {
  const albums = path.join(
    config.contentDir,
    config.albumsDir,
    '**',
    'index.md'
  );
  const pages = path.join(config.contentDir, '**', 'index.md');

  return { albums, pages };
};
