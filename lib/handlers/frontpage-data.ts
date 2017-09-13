import * as globby from 'globby';
import { getGlobPatterns, getAlbumLinkProps } from '../util';
import { getPageContent } from '../get-data';
import {
  Config,
  RequestHandler,
  FrontpageApiData,
  Page,
} from '../definitions/global';

export const getFrontpageApiData = async (
  config: Config
): Promise<FrontpageApiData> => {
  const albumList = await globby(getGlobPatterns(config).albums);
  const albumData = await Promise.all(
    albumList.map(async (albumPath: string) =>
      getPageContent(albumPath, config.albumsDir)
    )
  );
  const albums = albumData.map(({ meta, name }: Page) => ({
    linkProps: getAlbumLinkProps(config.albumsDir, name),
    meta: {
      ...meta,
      name,
    },
  }));
  const content = await getPageContent(`${config.contentDir}/index.md`);
  return { albums, content };
};

export default (config: Config): RequestHandler => async (_, res) => {
  const data = await getFrontpageApiData(config);
  res.json(data);
};
