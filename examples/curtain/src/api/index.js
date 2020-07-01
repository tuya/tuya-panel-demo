import { TYSdk } from 'tuya-panel-kit';

const TYNative = {
  ...TYSdk,
  ...TYSdk.native,
  ...TYSdk.device,
};

export default TYNative;
