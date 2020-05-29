import { Utils } from 'tuya-panel-kit';

const { RatioUtils } = Utils;
export const { convertX: cx, convertY: cy, convert } = RatioUtils;

export const listConfig = {
  header: {
    height: cy(24),
    marginTop: cx(18),
  },
  cell: {
    height: convert(180),
  },
};
