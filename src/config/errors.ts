import { UUID } from '../types';

export class MissingTokenError extends Error {
  constructor() {
    super('Auth token is missing!');
  }
}

export class MissingItemIdError extends Error {
  constructor() {
    super('Item id is missing!');
  }
}

export class MissingFileIdError extends Error {
  constructor() {
    super('File id is missing!');
  }
}

export class MissingAppIdError extends Error {
  constructor() {
    super('App data id is missing!');
  }
}

export class MissingAppDataIdError extends Error {
  constructor() {
    super('App id is missing!');
  }
}

export class MissingAppOriginError extends Error {
  constructor() {
    super('App origin is missing!');
  }
}

export class MissingMessageChannelPortError extends Error {
  constructor() {
    super('Message channel port is missing!');
  }
}

export class MissingNecessaryDataError extends Error {
  constructor({ itemId, memberId, token }: { itemId?: UUID; memberId?: UUID; token?: string }) {
    super(
      `itemId '${itemId}', memberId '${memberId}', token of length ${token?.length} are necessary data, but some are missing!`,
    );
  }
}
