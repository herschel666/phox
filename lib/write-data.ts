import { promisify } from 'util';
import { writeFile } from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as got from 'got';
import getConfig from './config';
import { ExportPathMap } from './definitions/global';

interface DataItem {
  source: string;
  destination: string;
  contents?: string;
}

const pWriteFile = promisify(writeFile);
const pMkdirp = promisify(mkdirp);

const getDataPaths = (
  paths: ExportPathMap,
  baseUrl: string,
  albumsDir: string,
  outDir: string
): DataItem[] =>
  Object.keys(paths)
    .filter((x: string) => x !== '/')
    .map((x: string) => x.replace(/(\/|\b)$/, '.json'))
    .map((x: string) => ({
      source: `${baseUrl}${x}`,
      destination: path.join(outDir, 'data', x),
    }))
    .concat({
      source: `${baseUrl}/index.json`,
      destination: path.join(outDir, 'data', 'index.json'),
    });

const fetchData = async (dataItem: DataItem): Promise<DataItem> => {
  const { body } = await got(dataItem.source);
  return {
    ...dataItem,
    contents: body || '{}',
  };
};

// tslint:disable-next-line
//TODO: sort out how to do this without `[].slice.call`
const fetchSequentially = async (items: DataItem[]): Promise<DataItem[]> =>
  Promise.all<DataItem>(
    [].slice.call(
      items.reduce(
        async (accPromise: Promise<DataItem[]>, dataItem: DataItem) => {
          const acc = await accPromise;
          const result = await fetchData(dataItem);
          return acc.concat(result);
        },
        Promise.resolve([] as DataItem[])
      )
    )
  );

const createAlbumFolders = (albumsDir: string) => async (
  dataItem: DataItem
): Promise<void> => {
  if (!dataItem.destination.includes(`/${albumsDir}/`)) {
    return;
  }
  const isAlbum = new RegExp(`/${albumsDir}/[^/]+\.json$`);
  if (isAlbum.test(dataItem.destination)) {
    return;
  }
  const albumFolderPath = dataItem.destination.replace(/[^/]+\.json$/, '');
  await pMkdirp(albumFolderPath);
};

const writeData = async (dataItem: DataItem): Promise<void> => {
  await pWriteFile(dataItem.destination, dataItem.contents, 'utf8');
};

export default async (paths: ExportPathMap): Promise<void> => {
  const conf = getConfig();
  const baseUrl = `http://${conf.hostname}:${conf.port}/data`;
  await pMkdirp(`${conf.outDir}/data/${conf.albumsDir}`);
  const dataPaths = getDataPaths(paths, baseUrl, conf.albumsDir, conf.outDir);
  const dataItems = await fetchSequentially(dataPaths);
  await Promise.all(dataPaths.map(createAlbumFolders(conf.albumsDir)));
  await Promise.all(dataItems.map(writeData));
};
