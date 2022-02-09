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

export class MissingAppIdError extends Error {
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
