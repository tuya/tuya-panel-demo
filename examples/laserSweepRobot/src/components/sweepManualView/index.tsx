import React, { Component } from 'react';
import {
  ImageBackground,
  StyleSheet,
  ViewStyle,
  Dimensions,
  TouchableOpacity,
  Image,
  StyleProp,
} from 'react-native';
import { TYSdk, Utils } from 'tuya-panel-kit';
import { observer, inject } from 'mobx-react';
import { DPCodes } from '../../config';
import res from '../../res';

const Width = Dimensions.get('window').width;
const { convertX: cx, convertY: cy } = Utils.RatioUtils;

const directionControlCode = DPCodes.moveCtrl;

// 路径太长，导致打包，ios 图片被截断。
const Res = {
  ...res,
  leftBg: require('./res/left_bg.png'),
  rightBg: require('./res/right_bg.png'),
  backBg: require('./res/bottom_bg.png'),
  frontBg: require('./res/top_bg.png'),
  contentBg: require('./res/display.png'),
};
interface IProps {
  style: StyleProp<ViewStyle>;
}

interface IState {
  onPressDir: string;
}

@inject((state: any) => {
  const { devInfo, dpState } = state;
  return {
    devInfo: devInfo.data,
    dpState: dpState.data,
    directioncontrol: dpState[directionControlCode],
  };
})
@observer
export default class ManualView extends Component<IProps, IState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    style: {},
  };

  dirRange: any;

  dirMap: { front: any; back: any; left: any; right: any; suspend: any };

  constructor(props) {
    super(props);
    this.dirRange = TYSdk.device.getDpSchema(DPCodes.moveCtrl).range;
    const front = this.dirRange.find(
      (itm: string) => itm.includes('forward') || itm.includes('foward')
    );
    const back = this.dirRange.find((itm: string) => itm.includes('back'));
    const left = this.dirRange.find((itm: string) => itm.includes('left'));
    const right = this.dirRange.find((itm: string) => itm.includes('right'));
    const suspend = this.dirRange.find((itm: string) => itm.includes('stop'));
    this.dirMap = {
      front,
      back,
      left,
      right,
      suspend,
    };

    this.getDatas = this.getDatas.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.pasueChangeDirection = this.pasueChangeDirection.bind(this);
    this.state = {
      onPressDir: 'none',
    };
  }

  getDatas() {
    const data: Array<any> = [
      { key: 'front', style: { top: 0, left: cx(97) } },
      { key: 'left', style: { left: 0 } },
      { key: 'right', style: { right: 0 } },
    ];

    const hasBack = this.dirRange.find((itm: string) => itm.includes('back'));
    if (hasBack) {
      data.push({ key: 'back', style: { bottom: 0, left: cx(97) } });
    }

    return data;
  }

  putDirection(key) {
    TYSdk.device.putDeviceData({
      [DPCodes.moveCtrl]: this.dirMap[key],
    });
    this.setState({
      onPressDir: key,
    });
  }

  pasueChangeDirection() {
    TYSdk.device.putDeviceData({
      [directionControlCode]: this.dirMap.suspend,
    });
    this.setState({
      onPressDir: 'none',
    });
  }

  renderItem(data) {
    const { key, style } = data;
    return (
      <TouchableOpacity
        style={[styles.item, style]}
        key={key}
        // eslint-disable-next-line react/jsx-no-bind
        onPressIn={this.putDirection.bind(this, key)}
        onPressOut={this.pasueChangeDirection}
      >
        <Image style={styles.icon} source={Res[key]} />
      </TouchableOpacity>
    );
  }

  render() {
    const { style } = this.props;
    const { onPressDir } = this.state;
    let curStyle = {};
    switch (onPressDir) {
      case 'left':
        curStyle = { left: cx(17), width: cx(72), height: cx(167) };
        break;
      case 'right':
        curStyle = { right: cx(17), width: cx(72), height: cx(167) };
        break;
      case 'front':
        curStyle = { top: cy(16), left: cx(55), width: cx(167), height: cx(72) };
        break;
      case 'back':
        curStyle = {
          bottom: cy(20),
          left: cx(55),
          width: cx(167),
          height: cx(72),
        };
        break;
      default:
        break;
    }
    return (
      <ImageBackground source={Res.contentBg} style={[styles.bg, style]}>
        {onPressDir !== 'none' && (
          <Image
            source={Res[`${onPressDir}Bg`]}
            style={[{ position: 'absolute', resizeMode: 'stretch' }, curStyle]}
          />
        )}
        {this.getDatas().map(d => this.renderItem(d))}
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  bg: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: (Width - cx(260)) / 2,
    width: cx(277),
    height: cx(277),
  },
  icon: {
    width: cx(22),
    height: cy(22),
  },

  item: {
    position: 'absolute',
    width: cx(80),
    height: cy(80),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
