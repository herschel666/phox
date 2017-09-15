import * as next from 'next';
import * as express from 'express';

export interface SomeObject {
  [x: string]: any;
}

export type RequestHandler = (
  req: express.Request,
  res: express.Response
) => void;

export type Meta = SomeObject;

export type Orientation = 'landscape' | 'portrait' | 'square' | null;

export interface GPS {
  GPSVersionID?: number[];
  GPSLatitudeRef?: 'N' | 'S';
  GPSLatitude?: number[];
  GPSLongitudeRef?: 'E' | 'W';
  GPSLongitude?: number[];
  GPSAltitude?: number;
}

export interface LatLng {
  lat?: number;
  lng?: number;
}

export interface Dimensions {
  width: number;
  height: number;
  orientation: Orientation;
}

export interface PhotoMeta {
  aperture: string | null;
  camera: string;
  createdAt: string | null;
  description: string;
  exposureTime: number | null;
  flash: boolean;
  focalLength: string | null;
  gps: LatLng;
  height: number;
  iso: number | null;
  lens: string;
  orientation: Orientation;
  title: string;
  width: number;
}

export interface Coords {
  lat?: number;
  lng?: number;
}

export type App = next.Server;

export interface Server {
  app: App;
  server: express.Application;
}

export interface ImageOptimization {
  progressive?: boolean;
  quality?: string;
}

export interface Config {
  contentDir?: string;
  albumsDir?: string;
  outDir?: string;
  port?: number;
  hostname?: string;
  server?: string;
  imageOptimization?: ImageOptimization;
}

export interface FrontMatter {
  attributes: SomeObject;
  body: string;
}

export interface LinkProps {
  href: {
    pathname: string;
    query: { [x: string]: string };
  };
  // tslint:disable-next-line:no-reserved-keywords
  as: {
    pathname: string;
  };
}

export interface PageRef {
  title: string;
  linkProps: LinkProps;
}

export interface Page {
  meta: SomeObject;
  name: string;
  path: string;
  body: string;
}

export interface Image {
  filePath: string;
  detailLinkProps?: LinkProps;
  fileName: string;
  meta?: PhotoMeta;
}

export interface Album {
  content: Page;
  images: Image[];
}

export interface FrontpageAlbum {
  meta: SomeObject;
  linkProps: LinkProps;
}

export interface Data {
  albums: Album[];
  pages: Page[];
}

export interface FrontpageApiData {
  albums: FrontpageAlbum[];
  content: Page;
}

export interface ImageApiData {
  image: Image;
  next: PageRef;
  prev: PageRef;
  back: PageRef;
}

export type AlbumApiData = Album;

export type PageApiData = Page;

export interface ExportPathMap {
  [x: string]: {
    page: string;
    query?: SomeObject;
  };
}
