declare module 'imagemin-pngquant' {
  interface Options {
    quality: string;
  }

  function imageminPngquant(options?: Options): {};

  export = imageminPngquant;
}
