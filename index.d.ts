import { Server, ExportPathMap } from './lib/definitions/global';

declare module 'phox/server' {
  export default function server(): Promise<Server>;
}

declare module 'phox/export' {
  export default function(): Promise<ExportPathMap>;
}
