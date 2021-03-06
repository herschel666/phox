import { promisify } from 'util';
import { writeFile } from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as debug from 'debug';
import getData, { getFrontpageApiData } from './get-data';
import { getImageSibling } from './handlers/image-data';
import { getAlbumLinkProps } from './util';
import {
  Config,
  Album,
  Image,
  Page,
  FrontpageApiData,
  ImageApiData,
  TagApiData,
} from './definitions/global';

const log = debug('phox:write-api-data');

const pWriteFile = promisify(writeFile);
const pMkdirp = promisify(mkdirp);

const stripFileSuffix = (filePath: string): string =>
  filePath.split('.').shift();

const createFolder = async (folder: string): Promise<void> => {
  await pMkdirp(folder);
};

const writeData = async <T>(
  destination: string,
  dataItem: T
): Promise<void> => {
  try {
    await pWriteFile(destination, JSON.stringify(dataItem), 'utf8');
  } catch (err) {
    log('Error: %s', err.message || err);
    throw err;
  }
};

const writeFrontpageData = async (
  outDir: string,
  data: FrontpageApiData
): Promise<void> => {
  await writeData<FrontpageApiData>(path.join(outDir, 'data/index.json'), data);
};

const writePagesData = (outDir: string) => async (
  page: Page
): Promise<void> => {
  await writeData<Page>(path.join(outDir, 'data', `${page.name}.json`), page);
};

const writeImageData = (
  config: Config,
  album: Album,
  images: Image[],
  albumFileName: string
) => async (image: Image): Promise<void> => {
  const destination = path.join(
    stripFileSuffix(albumFileName),
    `${stripFileSuffix(image.fileName)}.json`
  );
  const imageIndex = images.indexOf(image);
  const prev = getImageSibling(
    config.albumsDir,
    album.content.name,
    images,
    imageIndex,
    -1
  );
  const next = getImageSibling(
    config.albumsDir,
    album.content.name,
    images,
    imageIndex,
    1
  );
  const back = {
    title: album.content.meta.title,
    linkProps: getAlbumLinkProps(config.albumsDir, album.content.name),
  };
  const data = { image, next, prev, back };
  await writeData<ImageApiData>(destination, data);
};

const writeAlbumsData = (config: Config) => async (
  album: Album
): Promise<void> => {
  const destination = path.join(
    config.outDir,
    'data',
    config.albumsDir,
    `${album.content.name}.json`
  );
  await writeData<Album>(destination, album);
  await Promise.all(
    album.images.map(writeImageData(config, album, album.images, destination))
  );
};

const writeTagsData = async (
  tagFolder: string,
  tags: TagApiData[]
): Promise<void[]> =>
  Promise.all(
    tags.map(
      async (tag: TagApiData): Promise<void> => {
        const destination = path.join(tagFolder, `${tag.slug}.json`);
        await writeData<TagApiData>(destination, tag);
      }
    )
  );

export default async (config: Config): Promise<void> => {
  log('Write API data.');

  const { albums, pages, tags } = await getData(config);
  const albumFolders = albums.map(({ content }: Album) =>
    path.join(config.outDir, 'data', config.albumsDir, content.name)
  );
  const tagFolder = path.join(config.outDir, 'data', 'tag');
  const frontpageApiData = await getFrontpageApiData(config);
  await pMkdirp(tagFolder);
  await Promise.all(albumFolders.map(createFolder));
  await Promise.all([
    writeFrontpageData(config.outDir, frontpageApiData),
    Promise.all(
      pages
        .filter(({ name }: Page) => name !== 'frontpage')
        .map(writePagesData(config.outDir))
    ),
    Promise.all(albums.map(writeAlbumsData(config))),
    writeTagsData(tagFolder, tags),
  ]);
};
