import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import gateway from 'gateway';
import { Utils } from 'tuya-panel-kit';
import Strings from 'i18n/index';
import { getDpCodesByType } from 'utils/index';
import Lamp from './Lamp';
import TotalControl from './TotalControl';
import ItemButton from './ItemButton';

const { convertX: cx, width: winWidth, height: winHeight, isIphoneX } = Utils.RatioUtils;

interface IProps {
  dpState: any;
  dimmers: any[];
  supportMax: number;
  navigator: any;
  schema: any;
}

interface IState {
  scrollEnabled: boolean;
  allBrightEnalbed: boolean; // 总控是否可以调度亮度
  power: boolean;
  bright: number;
  minBright: number;
  maxBright: number;
}

class BrightAll extends React.Component<IProps, IState> {
  isAllPowerOperation: boolean = false; // 是否做了总开关操作
  constructor(props: IProps) {
    super(props);
    this.state = {
      scrollEnabled: true,
      ...this.initData(this.props),
    };
  }
  componentWillReceiveProps(nextProps: IProps) {
    this.setState(this.initData(nextProps));
  }
  tipLayout = { x: 0, y: 0, width: 100, height: 100 };
  initData(props: IProps) {
    const { dpState, supportMax, schema } = props;
    let bright = 0;
    let minBright = 0;
    let maxBright = 1000;
    let power = false;
    let total = 0;
    let allBrightEnalbed = true;
    let powerOnCount = 0;

    // 总开是否开启，只要有一路开启就开启
    for (let i = 1; i <= supportMax; i++) {
      const { powerCode } = getDpCodesByType(i, schema);
      if (dpState[powerCode] === true) {
        power = true;
        powerOnCount++;
      }
    }

    // 当前为全开或全关操作，等待中
    if (this.isAllPowerOperation) {
      if (powerOnCount !== 0 && powerOnCount !== supportMax) {
        // 未全开或全关状态，不处理输入的数据
        return;
      }
    }

    this.isAllPowerOperation = false;
    //
    for (let i = 1; i <= supportMax; i++) {
      const { powerCode, brightCode, minBrightCode, maxBrightCode } = getDpCodesByType(i, schema);
      // 统计开启（或全关）的数据状态，总控制只控制开状态的路
      if (dpState[powerCode] === true || !power) {
        total++;
        bright += dpState[brightCode] || 500;
        const minBrightTemp = dpState[minBrightCode] || 10;
        const maxBrightTemp = dpState[maxBrightCode] || 1000;
        minBright = Math.max(minBright, minBrightTemp);
        maxBright = Math.min(maxBright, maxBrightTemp);
      }
    }
    if (total > 0) {
      bright = Math.round(bright / total);
    }
    // 无交集情况下，总控不可调亮度
    if (minBright >= maxBright) {
      maxBright = 1000;
      allBrightEnalbed = false;
    }
    return {
      power,
      bright,
      minBright,
      maxBright,
      allBrightEnalbed,
    };
  }
  /**
   * 总控调节亮度时，会同时发下多个亮度dp，但设备上报时是一个一个上报回来的
   * 而总亮度是取平均值，这就有可能造成滑块的抖动
   * 所以此处上滑动结束时，dp数据直接生效到面板
   */
  handleChangeBright = (isEnd: boolean) => (v: number) => {
    const { dimmers, schema } = this.props;
    const data: any = {};
    dimmers.forEach(item => {
      if (item.power) {
        const { brightCode } = getDpCodesByType(item.controllType, schema);
        data[brightCode] = v;
      }
    });
    gateway.putDpData(data, {
      useThrottle: !isEnd,
      clearThrottle: isEnd,
      updateValidTime: isEnd ? 'syncs' : 'reply',
    });
  };
  handlePowerAll = () => {
    const { supportMax, schema } = this.props;
    const { power } = this.state;
    const data: any = {};
    for (let i = 1; i <= supportMax; i++) {
      const { powerCode } = getDpCodesByType(i, schema);
      data[powerCode] = !power;
    }
    // 等待中上报数据返回中...
    this.isAllPowerOperation = true;
    gateway.putDpData(data);
  };
  render() {
    const { dimmers, navigator } = this.props;
    const { bright, minBright, maxBright, power, allBrightEnalbed } = this.state;
    return (
      <View style={styles.container}>
        <Lamp power={power} />
        <View style={styles.control}>
          <TotalControl
            style={styles.item}
            bright={bright}
            minBright={minBright}
            maxBright={maxBright}
            brightEnabled={power && allBrightEnalbed}
            power={power}
            onPower={this.handlePowerAll}
            onChangeBright={this.handleChangeBright(false)}
            onCompleteBright={this.handleChangeBright(true)}
          />
          {dimmers.map(item => (
            <ItemButton
              {...item}
              key={item.key}
              navigator={navigator}
              powerAll={power}
              style={styles.item}
            />
          ))}
        </View>
      </View>
    );
  }
}

export default connect(({ dpState, cloudState, devInfo }: any) => {
  const dimmers = [];
  const { supportMax, schema } = devInfo;
  for (let i = 1; i <= supportMax; i++) {
    const { powerCode, brightCode, ledTypeCode } = getDpCodesByType(i, schema);
    dimmers.push({
      key: i,
      controllType: i,
      power: dpState[powerCode],
      bright: dpState[brightCode],
      ledType: dpState[ledTypeCode],
      name: cloudState[`dimmerName${i}`] || Strings.formatValue('dimmer_name', i),
    });
  }
  return {
    schema: devInfo.schema,
    supportMax,
    dpState,
    dimmers,
  };
})(BrightAll);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  control: {
    paddingHorizontal: cx(12),
    paddingBottom: isIphoneX ? 20 : 0,
  },
  item: {
    marginBottom: 10,
  },
});
