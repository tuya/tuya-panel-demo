import { Observable } from 'rxjs';
import { pluck, filter, distinctUntilChanged } from 'rxjs/operators';

import { TYSdk } from 'tuya-panel-kit';

/**
 * 创建 dpValue 的Observable
 *
 * @returns
 */
export function createDpValue$<T>(code: string, initial = true, options?: { distinct: boolean }) {
  let isExist = false;
  try {
    isExist = TYSdk.device.checkDpExist(code);
  } catch (error) {
    isExist = false;
  }
  if (!isExist) {
    console.warn(`${code} dp is not exist!!!!`);
    return Observable.empty<T>();
  }
  const initial$ = initial ? Observable.of(TYSdk.devInfo.state) : Observable.empty();

  const value$ = Observable.fromEventPattern<T>(
    handle => TYSdk.event.on('deviceDataChange', data => handle(data.payload)),
    handle => TYSdk.event.remove('deviceDataChange', data => handle(data.payload))
  );

  if (options && options.distinct) {
    return Observable.concat<T>(initial$, value$).pipe(
      pluck(code),
      distinctUntilChanged<T>(),
      filter(value => value !== undefined)
    );
  }

  return Observable.concat<T>(initial$, value$).pipe(
    pluck(code),
    filter<T>(value => value !== undefined)
  );
}

export default {
  createDpValue$,
};
