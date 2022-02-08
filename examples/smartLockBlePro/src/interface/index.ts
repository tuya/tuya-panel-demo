/**
 * home
 */
export type Battery = 'low' | 'poweroff' | 'medium' | 'high';
export type IsOpening =
  | 'none'
  | 'opening'
  | 'closing'
  | 'lockClose'
  | 'lockOpen'
  | 'openTimeOut'
  | 'operateSuccess'
  | 'operateFailed';
export type MoveDire = 'right' | 'left';

export interface StatusData {
  key: boolean;
  text: string;
  image: string | undefined;
  showEle?: boolean;
}
