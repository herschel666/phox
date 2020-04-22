import fetch from 'node-fetch';
import { html, json, url, ignoreThingies } from '../util';

describe('Export HTML', () => {
  test.each(html)('Renders %s', async (pathName: string) => {
    const response = await fetch(url(pathName));
    const result = await response.text();
    expect(ignoreThingies(result)).toMatchSnapshot();
  });
});

describe('Export JSON', () => {
  test.each(json)('Renders %s', async (pathName: string) => {
    const response = await fetch(url(pathName));
    const result = await response.json();
    expect(ignoreThingies(JSON.stringify(result))).toMatchSnapshot();
  });
});
