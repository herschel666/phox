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

describe('Custom route', async () => {
  test('/api/hello%2world/', async () => {
    const result = await request(url('/api/hello%20world/'));
    const { text } = JSON.parse(result);

    expect(text).toBe('hello world');
  });
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
