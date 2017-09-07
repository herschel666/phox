declare module 'imagemin' {
  function imagemin(
    source: string[],
    destination: string,
    options?: {}
  ): Promise<void>;

  export = imagemin;
}
