declare module 'node-iptc' {
  interface IptcData {
    [x: string]: any;
  }

  function nodeIptc(buffer: Buffer): IptcData | false;

  export = nodeIptc;
}
