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
];

export const json = ['/data/index.json'].concat(
  html
    .slice(1)
    .map((pathName: string) => `/data${pathName.replace(/\/$/, '.json')}`)
);

export const url = (pathname: string): string =>
  `http://127.0.0.1:9999${pathname}`;

export const unifiyBuildId = (snapshot: string): string =>
  snapshot
    .replace(/_next\/[0-9a-z-]+/g, '_next/snapshot')
    .replace(/"buildId":\d+/g, '"buildId":snapshot')
    .replace(/"buildId":"[^"]+"/g, '"buildId":"snapshot"')
    .replace(/"hash":"[^"]+"/g, '"hash":"snapshot"')
    .replace(/\/\*#\ssourceMappingURL[^*]+\*\//g, '')
    .replace(/\/\*@\sourceURL=[^*]+\*\//g, '');
