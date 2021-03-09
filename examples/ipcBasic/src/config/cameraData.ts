import Strings from '@i18n';
import NormalFeatureTopLeft from '../components/livePlayComponents/normalFeatureTopLeft';
import NormalFeatureTopRight from '../components/livePlayComponents/normalFeatureTopRight';
import FullFeatureTopLeft from '../components/livePlayComponents/fullFeatureTopLeft';
import FullFeatureTopRight from '../components/livePlayComponents/fullFeatureTopRight';
import FullFeatureBottomLeft from '../components/livePlayComponents/fullFeatureBottomLeft';
import FullFeatureBottomRight from '../components/livePlayComponents/fullFeatureBottomRight';
import FullClarityChange from '../components/livePlayComponents/fullClarityChange';

const normalArr = [{ component: NormalFeatureTopLeft }, { component: NormalFeatureTopRight }];

const decodeClarityStatusString = {
  SS: Strings.getLang('video_mode_ss'), // 省流量
  SD: Strings.getLang('video_mode_sd'), // 标清
  HD: Strings.getLang('video_mode_hd'), // 高清
  UD: Strings.getLang('video_mode_ud'), // 超清
  SSP: Strings.getLang('video_mode_ssp'), // 超超清
  AUDIO: Strings.getLang('video_mode_audio'), // 音频模式
};

const fullComArr = [
  { component: FullFeatureTopLeft },
  { component: FullFeatureTopRight },
  {
    component: FullFeatureBottomLeft,
  },
  {
    component: FullFeatureBottomRight,
  },
  {
    component: FullClarityChange,
  },
];

const fullClarityType: any = [
  {
    typeName: Strings.getLang('video_mode_hd'),
    type: 'HD',
  },
  {
    typeName: Strings.getLang('video_mode_sd'),
    type: 'SD',
  },
];

export default {
  decodeClarityStatusString,
  normalArr,
  fullComArr,
  fullClarityType,
};
