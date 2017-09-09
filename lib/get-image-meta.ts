import { createReadStream } from 'fs';
import { ExifImage, TYPE_NO_EXIF_SEGMENT, ExifError } from 'exif';
import * as marked from 'marked';
import nodeIptc = require('node-iptc');
import getImageSize = require('probe-image-size');
import { decode } from 'utf8';
import * as format from 'date-fns/format';
import { pReadFile } from './util';
import {
  GPS,
  LatLng,
  Orientation,
  Meta,
  PhotoMeta,
} from './definitions/global';

const ORIENTATION_SQUARE = 'square';
const ORIENTATION_LANDSCAPE = 'landscape';
const ORIENTATION_PORTRAIT = 'portrait';
const NO_EXIF_SEGMENT: TYPE_NO_EXIF_SEGMENT = 'NO_EXIF_SEGMENT';

const isError = (err: ExifError) => err && err.code !== NO_EXIF_SEGMENT;

const hasNoExifData = (err: ExifError) => err && err.code === NO_EXIF_SEGMENT;

const getExifData = async (filePath: string): Promise<Meta> =>
  new Promise((resolve, reject) => {
    const args = { image: filePath };
    const extractor: ExifImage = new ExifImage(args, (err, data) => {
      if (isError(err)) {
        reject({});
        return;
      }
      const exif = hasNoExifData(err) ? extractor.exifData : data;
      resolve(exif);
    });
  });

const getIptcData = async (filePath: string): Promise<Meta> => {
  try {
    const data = await pReadFile(filePath);
    return nodeIptc(data) || {};
  } catch (e) {
    return {};
  }
};

const getOrientation = async (filePath: string): Promise<Orientation> => {
  const input = createReadStream(filePath);
  let orientation: Orientation = null;
  try {
    const { width, height } = await getImageSize(input);
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
  return orientation;
};

const getCreationDateFromString = (date: string): string => {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const day = date.slice(6);
  return format(new Date(`${year}-${month}-${day}`), 'YYYY-MM-DDTHH:mm:ss');
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

const getDetailsFromMeta = (exif: Meta, iptc: Meta): PhotoMeta => ({
  title: decode(iptc.object_name || ''),
  description: marked(decode(iptc.caption || '')),
  createdAt: iptc.date_created
    ? getCreationDateFromString(iptc.date_created)
    : null,
  camera: exif.image.Model || '',
  lens: exif.exif.LensModel || '',
  iso: exif.exif.ISO ? Number(exif.exif.ISO) : null,
  aperture: exif.exif.FNumber ? exif.exif.FNumber.toFixed(1) : null,
  focalLength: exif.exif.FocalLength ? exif.exif.FocalLength.toFixed(1) : null,
  exposureTime: exif.exif.ExposureTime ? Number(exif.exif.ExposureTime) : null,
  flash: Boolean(exif.exif.Flash),
  gps: coordToDecimal(exif.gps),
  orientation: null,
});

export default async (filePath: string): Promise<PhotoMeta> => {
  const [exif, iptc, orientation] = await Promise.all([
    getExifData(filePath),
    getIptcData(filePath),
    getOrientation(filePath),
  ]);
  const meta = getDetailsFromMeta(exif, iptc);
  return { ...meta, orientation };
};
