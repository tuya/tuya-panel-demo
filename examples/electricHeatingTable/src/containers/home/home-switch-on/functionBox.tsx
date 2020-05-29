import React, { PureComponent } from 'react';
import { View, Animated, Dimensions, PanResponder, Image } from 'react-native';
import { LinearGradient } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import { Rect } from 'react-native-svg';
import { createAnimation, cx, cy, difference, leftValue } from '../../../utils';
import styles from '../../../config/styles';
import { updateDp } from '../../../redux/modules/common';
import { ReduxType } from '../../../redux/combine';
import { DpState, BicItem } from '../../../config/interface';
import boxConfigs, { defaultThemeColor, standardDp } from '../../../config/boxConfig';
import imgs from '../../../res';
import { MoreFunction, Heating, DesktopHeight, Cooking, KeepWarm } from '../../../components';
const { width } = Dimensions.get('window');
const dimension = { width: leftValue(cx(252)), height: cy(460) };
const allBoxList = ['moreFunction', 'heating', 'desktopHeight', 'cooking', 'keepWarm'];
const initLessLeft = -(dimension.width - (width - dimension.width) / 2);
const initMoreLeft = dimension.width + (width - dimension.width) / 2;
const initCenterLeft = (width - dimension.width) / 2;

interface State {
  activeIndex: number;
  [key: string]: any;
}
interface MainProps {
  dpState: DpState;
  devInfo: { [key: string]: any };
  updateDp: (obj: { [key: string]: any }) => void;
  navigator: { push: (obj: { [key: string]: any }) => void };
}
class FunctionBox extends PureComponent<MainProps, any> {
  state: State = {
    activeIndex: 1,
  };
  boxList: string[] = [];
  moveDirection: string = '';
  startSetState: boolean;
  endOnceBoxCut: boolean = true;
  realmoreFunction: any[] = [];
  realheating: string[] = [];
  realdesktopHeight: string[] = [];
  realcooking: string[] = [];
  realkeepWarm: string[] = [];

  _panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => false,
    onPanResponderGrant: () => {
      this.startSetState = true;
    }, // 开始
    onPanResponderMove: this._handleMove.bind(this), // 移动
  });
  componentWillMount = () => {
    this._getBoxContent();
  };
  _handleMove(__: any, { dx }: { dx: number }) {
    if (!this.startSetState) return;
    if (dx > 0) {
      this._boxCutOver('left');
    } else if (dx < 0) {
      this._boxCutOver('right');
    }
  }
  _getCustomDp = () => {
    const allDp = Object.keys(this.props.devInfo.schema);
    const customDp = difference(allDp, standardDp);
    const type = ['value', 'bool', 'enum'];
    customDp.map((dp: string) => {
      if (type.includes(this.props.devInfo.schema[dp]?.type)) {
        const schema = this.props.devInfo.schema[dp];
        this.realmoreFunction.push(schema);
      }
    });
    const bic = this.props.devInfo.panelConfig.bic;
    const tjList = bic.map((item: BicItem) => item.code);
    if (tjList.includes('timer') && bic[tjList.indexOf('timer')].selected) {
      this.realmoreFunction.push('timing');
    }
    if (tjList.includes('jump_url') && bic[tjList.indexOf('jump_url')].selected) {
      const urlData = bic[tjList.indexOf('jump_url')].value;
      if (!urlData) return;
      const urlDataList = JSON.parse(urlData);
      for (let i = 0; i < urlDataList.length; i++) {
        this.realmoreFunction.push({
          name: urlDataList[i].name,
          url: urlDataList[i].value,
        });
      }
    }
  };
  [key: string]: any;
  _getBoxContent = () => {
    const schema = Object.keys(this.props.devInfo.schema);
    allBoxList.map((__: string, i: number) => {
      const boxName = allBoxList[i];
      const childList = `all${boxName}`;
      boxConfigs[childList].map((child: string) => {
        if (schema.includes(child)) {
          this[`real${boxName}`].push(child);
          !this.boxList.includes(boxName) && this.boxList.push(boxName);
        }
      });
    });
    {
      this._getCustomDp();
    }
    this.setState({ activeIndex: this.boxList.length === 1 ? 0 : this.state.activeIndex }, () => {
      const { activeIndex } = this.state;
      for (let i = 0; i < this.boxList.length; i++) {
        const lessLeft = leftValue(initLessLeft + -dimension.width * (activeIndex - i - 1));
        const moreLeft = leftValue(initMoreLeft + dimension.width * (i - activeIndex - 1));
        const centerLeft = leftValue(initCenterLeft);
        const boxLeft = activeIndex > i ? lessLeft : activeIndex < i ? moreLeft : centerLeft;
        const boxTop = activeIndex === i ? 0 : cx(20);
        const opacity = activeIndex === i ? 1 : 0.5;
        const iconOpacity = activeIndex === i ? 0 : 1;
        this.setState({
          [`left${i}`]: new Animated.Value(boxLeft),
          [`top${i}`]: new Animated.Value(boxTop),
          [`opacity${i}`]: new Animated.Value(opacity),
          [`iconOpacity${i}`]: new Animated.Value(iconOpacity),
        });
      }
    });
  };
  _boxCutOver = (direction: string) => {
    if (!this.startSetState) return;
    this.startSetState = false;
    if (!this.endOnceBoxCut) return;
    if (
      (direction === 'left' && this.state.activeIndex === 0) ||
      (direction === 'right' && this.state.activeIndex === this.boxList.length - 1)
    ) {
      return;
    }
    const { activeIndex } = this.state;
    const animatedList: any[] = [];
    this.setState(
      {
        activeIndex: direction === 'right' ? activeIndex + 1 : activeIndex - 1,
      },
      () => {
        this.endOnceBoxCut = false;
        const newactiveIndex = this.state.activeIndex;
        for (let i = 0; i < this.boxList.length; i++) {
          animatedList.push(
            createAnimation(
              this.state[`left${i}`],
              direction === 'right'
                ? leftValue(this.state[`left${i}`]._value - dimension.width)
                : leftValue(this.state[`left${i}`]._value + dimension.width)
            ),
            createAnimation(this.state[`top${i}`], i === newactiveIndex ? 0 : cx(20)),
            createAnimation(this.state[`opacity${i}`], i === newactiveIndex ? 1 : 0.5),
            createAnimation(this.state[`iconOpacity${i}`], i === newactiveIndex ? 0 : 1)
          );
        }
        Animated.parallel(animatedList).start(() => {
          this.endOnceBoxCut = true;
        });
      }
    );
  };

  render() {
    if (this.boxList.length === 0) return null;
    const { activeIndex } = this.state;
    return (
      <View
        style={{
          width: this.boxList.length * dimension.width,
          height: dimension.height,
        }}
        {...this._panResponder.panHandlers}
      >
        {this.boxList.map((item: string, index: number) => {
          return (
            <Animated.View
              key={item}
              style={[
                dimension,
                { position: 'absolute' },
                { left: this.state[`left${index}`] },
                { top: this.state[`top${index}`] },
                { opacity: this.state[`opacity${index}`] },
              ]}
            >
              <LinearGradient
                style={[dimension]}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
                stops={{
                  '0%': 'rgba(255,255,255,0.2)',
                  '100%': 'rgba(255,255,255,0)',
                }}
              >
                <Rect {...dimension} rx={cx(8)} />
              </LinearGradient>
              <View
                style={[styles.setBackground, dimension, { backgroundColor: defaultThemeColor }]}
              >
                <Animated.Image
                  source={imgs[`${item}`]}
                  style={[
                    styles.bigIcon,
                    { position: 'absolute', top: 12 },
                    index > activeIndex ? { left: 8 } : { right: 8 },
                    { opacity: this.state[`iconOpacity${index}`] },
                  ]}
                  resizeMode="stretch"
                />
                {item === 'moreFunction' && (
                  <MoreFunction
                    navigator={this.props.navigator}
                    moreFunction={this.realmoreFunction}
                    ifShowContent={index === activeIndex}
                  />
                )}
                {item === 'heating' && (
                  <Heating heating={this.realheating} ifShowContent={index === activeIndex} />
                )}
                {item === 'desktopHeight' && (
                  <DesktopHeight
                    desktopHeight={this.realdesktopHeight}
                    ifShowContent={index === activeIndex}
                  />
                )}
                {item === 'cooking' && (
                  <Cooking cooking={this.realcooking} ifShowContent={index === activeIndex} />
                )}
                {item === 'keepWarm' && (
                  <KeepWarm keepWarm={this.realkeepWarm} ifShowContent={index === activeIndex} />
                )}
              </View>
            </Animated.View>
          );
        })}
        <View
          style={[
            styles.bottomImage,
            {
              width: cx(this.boxList.length * 24),
              left: cx(180 - (this.boxList.length - 1) * 12.5),
            },
          ]}
        >
          {this.boxList.map((item: string, index: number) =>
            activeIndex === index ? (
              <Image
                source={imgs[`${item}`]}
                key={`icon${item}`}
                style={[styles.smallIcon, { tintColor: '#fff' }]}
                resizeMode="stretch"
              />
            ) : (
              <View key={`icon${item}`} style={[styles.dot]} />
            )
          )}
        </View>
      </View>
    );
  }
}

export default connect(
  ({ dpState, devInfo }: ReduxType) => ({
    dpState,
    devInfo,
  }),
  {
    updateDp,
  }
)(FunctionBox);
