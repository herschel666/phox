declare module 'exif' {
  export type TYPE_NO_EXIF_SEGMENT = 'NO_EXIF_SEGMENT';

  interface ExifImageArgs {
    image: string;
  }

  interface Exif {
    [x: string]: any;
  }

  export interface ExifError extends Error {
    code: TYPE_NO_EXIF_SEGMENT | string;
  }

  type callback = (err: ExifError | null, exif: Exif) => void;

  export class ExifImage {
    public exifData: Exif;
    constructor(args: ExifImageArgs, cb: callback);
  }
}
