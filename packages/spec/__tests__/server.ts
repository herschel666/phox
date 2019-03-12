import fetch from 'node-fetch';
import { html, json, url, ignoreThingies } from '../util';

describe('Server HTML', () => {
  test.each(html)('Renders %s', async (pathName: string) => {
    const response = await fetch(url(pathName));
    const result = await response.text();
    expect(ignoreThingies(result)).toMatchSnapshot();
  });
});

describe('Server JSON', () => {
  test.each(json)('Renders %s', async (pathName: string) => {
    const response = await fetch(url(pathName));
    const result = await response.json();
    expect(ignoreThingies(JSON.stringify(result))).toMatchSnapshot();
  });
});

describe('Custom route', () => {
  test('/api/hello%2world/', async () => {
    const response = await fetch(url('/api/hello%20world/'));
    const { text } = await response.json();

    expect(text).toBe('hello world');
  });
});
