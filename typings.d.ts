import * as Phox from './lib/definitions/global';

export as namespace Phox;
export default Phox;

export function createServer(): Promise<Phox.Server>;
export function getPathMap(): Promise<Phox.ExportPathMap>;
