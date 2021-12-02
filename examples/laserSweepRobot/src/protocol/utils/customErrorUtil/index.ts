import logger from '../loggerUtil';

type ICustomErrorType = 'system' | 'ui';

export default class CustomError extends Error {
  type: ICustomErrorType;

  info?: any;

  constructor(message: string, type: ICustomErrorType, info?: any) {
    super(message);
    this.type = type;
    this.info = info;
  }

  static mixinError(error: Error, type: ICustomErrorType): CustomError {
    return Object.assign(error, { type });
  }

  static handleError(error: CustomError) {
    if (!__DEV__) return;
    if (error.type === 'ui') {
      logger.error(error.message, error);
    } else {
      logger.error('system error', error.message);
    }
  }
}
