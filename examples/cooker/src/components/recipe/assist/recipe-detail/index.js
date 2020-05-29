/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */
import { Dimensions, StyleSheet } from 'react-native';
import { Utils, TopBar } from 'tuya-panel-kit';
// eslint-disable-next-line import/no-named-as-default
import Config from '../../config';
import Strings from '../../i18n';

const { DetailBaseHeight } = Config;
const { RatioUtils } = Utils;
const { width, height } = Dimensions.get('window');
export const { convertX: cx, convertY: cy, convert } = RatioUtils;

export const Res = {
  startBtn: require('../../res/start-btn.png'),
  circle: require('../../res/yellow-circle.png'),
  options: require('../../res/options.png'),
  timer: require('../../res/timer.png'),
  videoImg: require('../../res/video.png'),
  mask: require('../../res/mask.png'),
  star: require('../../res/star.png'),
  btnWrap: require('../../res/button_icon_wrap.png'),
  setting: require('../../res/setting_icon.png'),
  appoint: require('../../res/appiont_icon.png'),
};

export const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {},
  circle: {
    width: convert(48),
    height: convert(60),
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerWrap: {
    resizeMode: 'stretch',
    position: 'absolute',
  },
  initImageStyle: {
    position: 'absolute',
  },
  innerImg: {
    marginBottom: convert(12),
    resizeMode: 'stretch',
  },
  topbar: {
    position: 'absolute',
    top: 0,
    height: TopBar.height,
    width: RatioUtils.width,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderColor: 'transparent',
    zIndex: 999,
  },
  topContentWrap: {
    position: 'absolute',
    top: 0,
    width: Dimensions.get('window').width,
    height: DetailBaseHeight,
  },
  topContentView: {
    position: 'absolute',
    top: 0,
    width: Dimensions.get('window').width,
    height: DetailBaseHeight,
    backgroundColor: 'rgba(51,54,73,1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonImageStyle: {
    position: 'absolute',
    bottom: 38,
    left: cx(16),
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoModeStarContainer: {
    position: 'absolute',
    top: cy(150),
    right: cx(16),
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomContentView: {
    position: 'absolute',
    top: DetailBaseHeight,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - DetailBaseHeight,
    backgroundColor: '#fff',
  },
  startText: {
    color: '#fff',
    fontSize: convert(18),
    fontWeight: '500',
    marginBottom: convert(14),
  },
  scrollViewStyle: {
    width: window.width,
    height: cy(340),
    backgroundColor: 'transparent',
  },
  detailTextStyle: {
    flex: 1,
    marginTop: cx(18),
    color: '#666666',
    fontSize: 15,
    textAlign: 'left',
    marginBottom: cx(40),
    position: 'relative',
  },
  titleTextStyle: {
    marginTop: cx(18),
    fontSize: 17,
    color: '#4A4A4A',
  },
  textTitleStyle: {
    color: '#fff',
    fontSize: cx(20),
    fontWeight: '500',
    backgroundColor: 'transparent',
    maxWidth: cx(350),
  },
  touchStyle: {
    position: 'absolute',
    bottom: 8,
    width,
    flexDirection: 'row',
    height: cy(60),
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnWrap: {
    width: convert(176),
    height: convert(60),
    marginHorizontal: convert(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: 'stretch',
    position: 'absolute',
  },
  banner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playImg: {
    width: convert(48),
    height: convert(48),
  },
  publicWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: cy(71),
    borderBottomWidth: cy(7),
    borderBottomColor: '#EAEAEA',
    backgroundColor: '#fff',
  },
  publicContainer: {
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  publicTip: {
    fontSize: cx(16),
    color: '#666666',
    fontFamily: 'PingFang SC',
    fontWeight: '500',
  },
  publicDec: {
    fontSize: cx(12),
    color: '#9b9b9b',
    fontFamily: 'PingFang SC',
  },
  emptyContainer: {
    width,
    height: height - TopBar.height,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commonStyle: {
    height: DetailBaseHeight,
    width,
  },
  collectImageStyle: {
    width: cx(20),
    height: cx(20),
    marginLeft: cx(30),
  },
  isCollectImageStyle: {
    width: cx(20),
    height: cx(20),
    marginLeft: cx(30),
    opacity: 0.4,
  },
  titleContainer: {
    flexDirection: 'row',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  leftTitle: {
    fontSize: cx(14),
    color: '#666666',
    backgroundColor: 'transparent',
  },
  rightTitle: {
    fontSize: cx(14),
    color: '#666666',
    backgroundColor: 'transparent',
  },
  appointTip: {
    fontSize: cx(14),
    color: '#F85A00',
    backgroundColor: 'transparent',
    fontWeight: '500',
  },
});

export default {
  mainStyles,
  Res,
  cx,
  cy,
  Strings,
};
