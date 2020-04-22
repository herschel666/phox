export const html = [
  '/',
  '/about/',
  '/contact/',
  '/albums/minimal/',
  '/albums/mountains/',
  '/albums/minimal/1-khara-woods-316552/',
  '/albums/minimal/2-joanna-kosinska-288950/',
  '/albums/minimal/3-shashank-sahay-272113/',
  '/albums/mountains/1-facundo-loza-2194/',
  '/albums/mountains/2-arthur-105596/',
  '/albums/mountains/3-raul-taciu-203095/',
  '/tag/forest/',
  '/tag/mountain/',
  '/tag/windows/',
  '/tag/white-space/',
];

export const json = ['/data/index.json'].concat(
  html
    .slice(1)
    .map((pathName: string) => `/data${pathName.replace(/\/$/, '.json')}`)
);

export const url = (pathname: string): string =>
  `http://127.0.0.1:9999${pathname}`;

export const ignoreThingies = (snapshot: string): string =>
  snapshot
    .replace(/\?ts=\d+/g, '?ts=now')
    .replace(/\/dll_[^ .]+/g, '/dll_some-hash')
    .replace(/\/main-[^ .]+/g, '/main-some-hash')
    .replace(/\/webpack-[^ .]+/g, '/webpack-some-hash')
    .replace(/\/commons\.[^ .]+/g, '/commons.some-hash')
    .replace(/\/\*#\ssourceMappingURL[^*]+\*\//g, '')
    .replace(/\/\*@\s?sourceURL=[^*]+\*\//g, '');
