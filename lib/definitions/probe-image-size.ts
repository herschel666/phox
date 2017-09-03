declare module 'probe-image-size' {
  interface Dimensions {
    width: number;
    height: number;
  }

  function getImageSize(input: any): Promise<Dimensions>;

  export = getImageSize;
}
