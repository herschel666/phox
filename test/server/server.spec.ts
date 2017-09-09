import * as request from 'request-promise';
import { html, json, url, ignoreThingies } from '../util';

describe('Server HTML', async () => {
  await Promise.all(
    html.map((pathName: string) =>
      test(`Renders ${pathName}`, async () => {
        const result = await request(url(pathName));
        expect(ignoreThingies(result)).toMatchSnapshot();
      })
    )
  );
});

describe('Server JSON', async () => {
  await Promise.all(
    json.map((pathName: string) =>
      test(`Renders ${pathName}`, async () => {
        const result = await request(url(pathName));
        expect(ignoreThingies(result)).toMatchSnapshot();
      })
    )
  );
});
