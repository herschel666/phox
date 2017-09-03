import * as path from 'path';
import fm = require('front-matter');
import * as marked from 'marked';
import * as globby from 'globby';
import * as util from './util';
import getImageMeta from './get-image-meta';
import {
  Album,
  Config,
  Content,
  Data,
  FrontMatter,
  Image,
  Pages,
} from './definitions/global';

const getDirName = (pathName: string): string =>
  path
    .dirname(pathName)
    .split(path.sep)
    .pop();

const getDataForImage = (albumsDir: string, albumName: string) => (
  file: string
): Image => ({
  filePath: file,
  detailLinkProps: util.getDetailLinkProps(albumsDir, albumName, file),
  fileName: path.basename(file),
});

const getMetaFromImage = async (image: Image): Promise<Image> => {
  const meta = await getImageMeta(image.filePath);
  return { ...image, meta };
};

const getImages = async (
  albumsDir: string,
  albumName: string
): Promise<Image[]> => {
  const pattern = path.join('static', albumsDir, albumName, '*.jpg');
  const files = await globby(pattern);
  const images = files.map(getDataForImage(albumsDir, albumName));
  return await Promise.all(images.map(getMetaFromImage));
};

const getAlbumContent = async (
  albumsDir: string,
  albumPath: string
): Promise<Content> => {
  const content = await util.pReadFile(albumPath);
  const { attributes, body }: FrontMatter = fm(String(content));
  const name = getDirName(albumPath);
  return {
    meta: attributes,
    path: `/${albumsDir}/${name}/`,
    body: marked(body),
    name,
  };
};

const gatherAlbumData = (albumsDir: string) => async (
  file: string
): Promise<Album> => {
  const albumName = file
    .split(path.sep)
    .splice(-2)
    .shift();
  const [content, images] = await Promise.all([
    getAlbumContent(albumsDir, file),
    getImages(albumsDir, albumName),
  ]);
  return {
    content,
    images,
  };
};

const getPageContent = (contentDir: string) => async (
  filePath: string
): Promise<Pages> => {
  const content = await util.pReadFile(filePath);
  const { attributes, body } = fm(String(content));
  const regExp = new RegExp(
    `^.*${contentDir}${path.sep}|${path.sep}?index.md$`,
    'g'
  );
  return {
    [filePath.replace(regExp, '') || 'index']: {
      meta: attributes,
      name: getDirName(filePath),
      body: marked(body),
    },
  };
};

const getPages = async (
  pagesGlob: string,
  albumsGlob: string,
  contentDir: string
): Promise<Pages> => {
  const files = await globby(pagesGlob, { ignore: albumsGlob });
  const pages = await Promise.all(files.map(getPageContent(contentDir)));
  return pages.reduce((a, b) => Object.assign(a, b), {});
};

export default async (config: Config): Promise<Data | void> => {
  const patterns = util.getGlobPatterns(config);
  const albumFiles = await globby(patterns.albums);
  const albums = await Promise.all(
    albumFiles.map(gatherAlbumData(config.albumsDir))
  );
  const pages = await getPages(
    patterns.pages,
    patterns.albums,
    config.contentDir
  );
  return { albums, pages };
};
