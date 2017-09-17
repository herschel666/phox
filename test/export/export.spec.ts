import * as request from 'request-promise';
import { html, json, url, ignoreThingies } from '../util';

describe('Export HTML', async () => {
  await Promise.all(
    html.map((pathName: string) =>
      test(`Renders ${pathName}`, async () => {
        const result = await request(url(pathName));
        expect(ignoreThingies(result)).toMatchSnapshot();
      })
    )
  );
});

describe('Export JSON', async () => {
  await Promise.all(
    json.map((pathName: string) =>
      test(`Renders ${pathName}`, async () => {
        const result = await request(url(pathName));
        expect(ignoreThingies(result)).toMatchSnapshot();
      })
    )
  );
});

describe('Misc', async () =>
  test('Favicon.ico', async () => {
    const options = {
      uri: url('/favicon.ico'),
      simple: false,
    };
    const result = await request(options);
    expect(ignoreThingies(result)).toMatchSnapshot();
  }));
