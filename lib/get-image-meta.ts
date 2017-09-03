import { createReadStream } from 'fs';
import { ExifImage, TYPE_NO_EXIF_SEGMENT, ExifError } from 'exif';
import * as marked from 'marked';
import nodeIptc = require('node-iptc');
import getImageSize = require('probe-image-size');
import { decode } from 'utf8';
import { pReadFile } from './util';
import { GPS, Orientation, Meta } from './definitions/global';

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
  return String(new Date(`${year}-${month}-${day}`));
};

const coordToDecimal = (gps: GPS) => {
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

const getDetailsFromMeta = (exif: Meta, iptc: Meta) => ({
  title: decode(iptc.object_name),
  description: marked(decode(iptc.caption || '')),
  createdAt: getCreationDateFromString(iptc.date_created),
  camera: exif.image.Model,
  lens: exif.exif.LensModel,
  iso: Number(exif.exif.ISO),
  aperture: exif.exif.FNumber.toFixed(1),
  focalLength: exif.exif.FocalLength.toFixed(1),
  exposureTime: Number(exif.exif.ExposureTime),
  flash: Boolean(exif.exif.Flash),
  gps: coordToDecimal(exif.gps),
});

export default async (filePath: string): Promise<Meta> => {
  const exif = await getExifData(filePath);
  const iptc = await getIptcData(filePath);
  const orientation = await getOrientation(filePath);
  const meta = getDetailsFromMeta(exif, iptc);
  return { ...meta, orientation };
};
