import { mark } from './Descriptor.mjs';

export const GET = mark({ get: true });
export const SET = mark({ set: true });
export const STATIC = mark({ static: true });
export const FUNCTION = mark({ func: true });
