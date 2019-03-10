import { createReadStream } from 'fs';
import { ExifImage, TYPE_NO_EXIF_SEGMENT, Exif, ExifError } from 'exif';
import * as marked from 'marked';
import * as slug from 'slug';
import * as debug from 'debug';
import nodeIptc = require('node-iptc');
import getImageSize = require('probe-image-size');
import * as utf8 from 'utf8';
import { pReadFile, sortAlphabetically } from './util';
import {
  GPS,
  LatLng,
  Dimensions,
  Orientation,
  Meta,
  PhotoMeta,
  Tag,
} from './definitions/global';

const ORIENTATION_SQUARE = 'square';
const ORIENTATION_LANDSCAPE = 'landscape';
const ORIENTATION_PORTRAIT = 'portrait';
const NO_EXIF_SEGMENT: TYPE_NO_EXIF_SEGMENT = 'NO_EXIF_SEGMENT';

const log = debug('phox:getimage-meta');

const isError = (err: ExifError) => err && err.code !== NO_EXIF_SEGMENT;

const hasNoExifData = (err: ExifError) => err && err.code === NO_EXIF_SEGMENT;

const toTagData = (tag: string): Tag => ({
  slug: slug(tag),
  title: tag,
});

const decodeUtf8 = (str: string) => utf8.decode(utf8.encode(str));

const getExifData = async (filePath: string): Promise<Meta> =>
  new Promise((resolve, reject) => {
    const args = { image: filePath };
    const extractor: ExifImage = new ExifImage(
      args,
      (err: any, data?: Exif) => {
        if (isError(err)) {
          reject({});
          return;
        }
        const exif = hasNoExifData(err) ? extractor.exifData : data;
        resolve(exif);
      }
    );
  });

const getIptcData = async (filePath: string): Promise<Meta> => {
  try {
    const data = await pReadFile(filePath);
    return nodeIptc(data) || {};
  } catch (e) {
    return {};
  }
};

const getDimensions = async (filePath: string): Promise<Dimensions> => {
  const input = createReadStream(filePath);
  let orientation: Orientation;
  let size;
  try {
    size = await getImageSize(input);
    const { width, height } = size;
    if (width === height) {
      orientation = ORIENTATION_SQUARE;
    }
    if (width > height) {
      orientation = ORIENTATION_LANDSCAPE;
    } else {
      orientation = ORIENTATION_PORTRAIT;
    }
  } catch (e) {} // tslint:disable-line:no-empty
  input.destroy();
  return {
    width: size.width,
    height: size.height,
    orientation,
  };
};

const getCreationDateFromString = (date: string): string => {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const day = date.slice(6);
  return new Date(`${year}-${month}-${day}`)
    .toUTCString()
    .replace(/GMT.*$/, 'GMT');
};

const coordToDecimal = (gps: GPS): LatLng => {
  const latArr = gps.GPSLatitude;
  const lngArr = gps.GPSLongitude;
  if (!latArr || !lngArr) {
    return {};
  }
  const latRef = gps.GPSLatitudeRef || 'N';
  const lngRef = gps.GPSLongitudeRef || 'W';
  const lat =
    (latArr[0] + latArr[1] / 60 + latArr[2] / 3600) * (latRef === 'N' ? 1 : -1);
  const lng =
    (lngArr[0] + lngArr[1] / 60 + lngArr[2] / 3600) * (lngRef === 'W' ? -1 : 1);
  return { lat, lng };
};

const getDetailsFromMeta = (
  exif: Meta,
  iptc: Meta,
  dimensions: Dimensions
): PhotoMeta => ({
  ...dimensions,
  title: decodeUtf8(iptc.object_name || ''),
  tags: (iptc.keywords || [])
    .map(decodeUtf8)
    .filter(Boolean)
    .sort(sortAlphabetically)
    .map(toTagData),
  description: marked(decodeUtf8(iptc.caption || '')),
  createdAt: iptc.date_created
    ? getCreationDateFromString(iptc.date_created)
    : undefined,
  camera: exif.image.Model || '',
  lens: exif.exif.LensModel || '',
  iso: exif.exif.ISO ? Number(exif.exif.ISO) : undefined,
  aperture: exif.exif.FNumber ? exif.exif.FNumber.toFixed(1) : undefined,
  focalLength: exif.exif.FocalLength
    ? exif.exif.FocalLength.toFixed(1)
    : undefined,
  exposureTime: exif.exif.ExposureTime
    ? Number(exif.exif.ExposureTime)
    : undefined,
  flash: Boolean(exif.exif.Flash),
  gps: coordToDecimal(exif.gps),
});

export default async (filePath: string): Promise<PhotoMeta> => {
  log('Get image met for file "%s".', filePath);

  const [exif, iptc, dimensions] = await Promise.all([
    getExifData(filePath),
    getIptcData(filePath),
    getDimensions(filePath),
  ]);

  return getDetailsFromMeta(exif, iptc, dimensions);
};
