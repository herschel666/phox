import * as phox from './lib/definitions/global';

export as namespace phox;
export default phox;

export function createServer(): Promise<phox.Server>;
export function getPathMap(): Promise<phox.ExportPathMap>;
