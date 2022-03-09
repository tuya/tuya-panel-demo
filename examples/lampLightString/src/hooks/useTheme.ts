// eslint-disable-next-line import/no-unresolved
import { useSelector } from '@models';
import { GlobalTheme } from 'tuya-panel-kit';

interface ITheme extends GlobalTheme {
  global: GlobalTheme['global'] & {
    isDefaultTheme: boolean;
    background: string;
    themeColor: string;
    fontColor: string;
    backgroundColor: string;
  };
}

/** 获取theme */
export default function useTheme() {
  return useSelector(state => state.theme) as ITheme;
}
