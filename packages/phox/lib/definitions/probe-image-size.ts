declare module 'probe-image-size' {
  interface ImageSize {
    width: number;
    height: number;
    type: string; // tslint:disable-line no-reserved-keywords
    mime: string;
    wUnits: string;
    hUnits: string;
  }

  function getImageSize(input: any): Promise<ImageSize>;

  export = getImageSize;
}
