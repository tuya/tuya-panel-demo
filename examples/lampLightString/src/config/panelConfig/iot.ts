// eslint-disable-next-line import/no-unresolved
import { DeepPartial } from '@utils';

/**
 * 放置 IoT 公版面板 UI 配置
 */
export default {
  default: {
    theme: 'default' as const,
    global: {
      fontColor: '#fff',
      themeColor: '#fff',
      background: '#303030',
    },
  },

  light: {
    theme: 'light' as const,
    global: {
      fontColor: '#626982',
      themeColor: '#626982',
      background: '#fff',
    },
  },
} as {
  default: DeepPartial<any>;
  light: DeepPartial<any>;
};
