import * as path from 'path';
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

const getPageContent = async (
  contentDir: string,
  pagePath: string,
  pathPrefix: string = ''
): Promise<Page> => {
  const content = await util.pReadFile(pagePath);
  const { attributes, body }: FrontMatter = fm(String(content));
  const name = getDirName(pagePath);
  return {
    meta: attributes,
    path: `/${pathPrefix}${name}/`,
    body: marked(body),
    name: name === 'content' ? 'frontpage' : name,
  };
};

const gatherAlbumData = (albumsDir: string, contentDir: string) => async (
  file: string
): Promise<Album> => {
  const albumName = file
    .split(path.sep)
    .splice(-2)
    .shift();
  const [content, images] = await Promise.all([
    getPageContent(contentDir, file, `${albumsDir}/`),
    getImages(albumsDir, albumName),
  ]);
  return {
    content,
    images,
  };
};

const getPages = async (
  pagesGlob: string,
  albumsGlob: string,
  contentDir: string
): Promise<Page[]> => {
  const files = await globby(pagesGlob, { ignore: albumsGlob });
  return await Promise.all(
    files.map(async (file: string) => getPageContent(contentDir, file))
  );
};

export default async (config: Config): Promise<Data> => {
  const patterns = util.getGlobPatterns(config);
  const albumFiles = await globby(patterns.albums);
  const albums = await Promise.all(
    albumFiles.map(gatherAlbumData(config.albumsDir, config.contentDir))
  );
  const pages = await getPages(
    patterns.pages,
    patterns.albums,
    config.contentDir
  );
  return { albums, pages };
};
