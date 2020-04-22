declare module 'imagemin-jpegtran' {
  interface Options {
    progressive?: boolean;
    arithmetic?: boolean;
  }

  function imageminJpegtran(options?: Options): {};

  export = imageminJpegtran;
}
