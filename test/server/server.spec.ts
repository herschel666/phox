import fetch from 'node-fetch';
import { html, json, url, ignoreThingies } from '../util';

describe('Server HTML', async () => {
  await Promise.all(
    html.map((pathName: string) =>
      test(`Renders ${pathName}`, async () => {
        const response = await fetch(url(pathName));
        const result = await response.text();
        expect(ignoreThingies(result)).toMatchSnapshot();
      })
    )
  );
});

describe('Server JSON', async () => {
  await Promise.all(
    json.map((pathName: string) =>
      test(`Renders ${pathName}`, async () => {
        const response = await fetch(url(pathName));
        const result = await response.json();
        expect(ignoreThingies(JSON.stringify(result))).toMatchSnapshot();
      })
    )
  );
});

describe('Custom route', async () => {
  test('/api/hello%2world/', async () => {
    const response = await fetch(url('/api/hello%20world/'));
    const { text } = await response.json();

    expect(text).toBe('hello world');
  });
});
