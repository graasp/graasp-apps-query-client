import { Request } from 'miragejs';

export type ExternalUrls = (((req: Request) => unknown) | string)[];
