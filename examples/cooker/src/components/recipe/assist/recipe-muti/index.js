/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */
import { Dimensions, StyleSheet } from 'react-native';
import { Utils } from 'tuya-panel-kit';
// eslint-disable-next-line import/no-named-as-default
import Config from '../../config';

const { DetailBaseHeight } = Config;
const { RatioUtils } = Utils;
const { width } = Dimensions.get('window');
export const { convertX: cx, convertY: cy, convert } = RatioUtils;
const TopBarHeight = cy(80);

export const Res = {
  mask: require('../../res/mask.png'),
  lastStep: require('../../res/lastStep.png'),
  nextStep: require('../../res/nextStep.png'),
  stop: require('../../res/start-btn.png'),
  stepWrap: require('../../res/step_btn_wrap.png'),
  stepPre: require('../../res/step_pre.png'),
  stepNext: require('../../res/step_next.png'),
};

export const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topContentView: {
    width: Dimensions.get('window').width,
    height: DetailBaseHeight,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(51,54,73,1)',
  },
  commonStyle: {
    height: DetailBaseHeight,
    width,
  },
  initImageStyle: {
    position: 'absolute',
  },
  topbar: {
    position: 'absolute',
    top: 0,
    height: TopBarHeight,
    width: RatioUtils.width,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderColor: 'transparent',
    zIndex: 999,
  },
  BottomButtonGroup: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'absolute',
    bottom: cy(15),
  },
  stepButtonWrapper: {
    opacity: 1,
  },
  stepButtonWrapperDisabled: {
    opacity: 0,
  },
  stepButton: {
    width: cx(82),
    height: cx(82),
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInnerButton: {
    width: cx(12),
    height: cx(14),
    resizeMode: 'contain',
    marginBottom: cx(12),
  },
  stopButton: {
    width: cx(198),
    height: cx(82),
    resizeMode: 'stretch',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopText: {
    fontSize: cx(14),
    color: '#fff',
    backgroundColor: 'transparent',
    fontWeight: '500',
    marginBottom: cx(12),
  },
  desc: {
    fontSize: cx(15),
    color: '#666666',
    backgroundColor: 'transparent',
    marginTop: cx(16),
  },
  stepTitle: {
    fontSize: cx(17),
    color: '#4A4A4A',
    backgroundColor: 'transparent',
    fontWeight: '500',
  },
  stepDescriptionContainer: {
    paddingTop: cx(20),
    paddingHorizontal: cx(16),
  },
  deviceCtrlTip: {
    fontSize: cx(17),
    color: '#4A4A4A',
    fontWeight: '500',
    marginTop: cx(30),
    marginLeft: cx(16),
  },
});

export default {
  mainStyles,
  Res,
  cx,
  cy,
};
