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

export interface Coords {
  lat?: number;
  lng?: number;
}

export type App = next.Server;

export interface Config {
  contentDir?: string;
  albumsDir?: string;
  outDir?: string;
  port?: number;
  hostname?: string;
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

export interface Content {
  meta: SomeObject;
  name: string;
  path: string;
  body: string;
}

export interface Image {
  filePath: string;
  detailLinkProps?: LinkProps;
  albumLinkProps: LinkProps;
  fileName: string;
  meta?: any;
}

export interface Album {
  content: Content;
  images: Image[];
}

export interface Page {
  meta: SomeObject;
  name: string;
  body: string;
}

export interface Pages {
  [path: string]: Page;
}

export interface Data {
  albums: Album[];
  pages: Pages;
}

export interface ExportPathMap {
  [x: string]: {
    page: string;
    query?: SomeObject;
  };
}
