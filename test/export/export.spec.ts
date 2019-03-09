import fetch from 'node-fetch';
import { html, json, url, ignoreThingies } from '../util';

describe('Export HTML', async () => {
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

describe('Export JSON', async () => {
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
