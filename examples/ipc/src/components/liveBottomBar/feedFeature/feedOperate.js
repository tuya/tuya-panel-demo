/* eslint-disable max-len */
/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableWithoutFeedback, Image } from 'react-native';
import color from 'color';
import { connect } from 'react-redux';
import { TYText, TYSdk } from 'tuya-panel-kit';
import CameraManager from '../../nativeComponents/cameraManager';
import Config from '../../../config';
import Strings from '../../../i18n';
import Res from '../../../res';
import { cancelRequestTimeOut, requestTimeout } from '../../../utils';

const { cx } = Config;
const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;
const TYNative = TYSdk.native;

class FeedOperate extends React.Component {
  static propTypes = {
    panelItemActiveColor: PropTypes.string.isRequired,
    feedMax: PropTypes.number.isRequired,
    feedStep: PropTypes.number.isRequired,
    food_weight: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      feedValue: 1,
      weightUnit: Strings.getLang('ipc_pet_weight_unit'),
    };
    this._interval = null;
  }
  componentDidMount() {
    TYEvent.on('deviceDataChange', data => {
      const changedp = data.payload;
      if (changedp.feed_num !== undefined) {
        TYNative.hideLoading();
        cancelRequestTimeOut();
        if (changedp.feed_num === -2000) {
          CameraManager.showTip(Strings.getLang('ipc_pet_feed_error'));
        } else if (Number(changedp.feed_num === 0)) {
          CameraManager.showTip(Strings.getLang('ipc_pet_feed_no_food'));
        } else if (Number(changedp.feed_num) > 0) {
          CameraManager.showTip(Strings.getLang('ipc_pet_feed_success'));
        }
      }
    });
  }
  componentWillUnmount() {
    TYEvent.off('deviceDataChange');
  }

  handlePressIn = isAdd => {
    const runner = () => {
      if (isAdd) {
        this.handleAdd();
      } else {
        this.handleReduce();
      }
    };
    runner();
    this._interval = setInterval(() => {
      runner();
    }, 200);
  };

  handleAdd = () => {
    const { feedValue } = this.state;
    const { feedMax, feedStep } = this.props;
    const num = feedValue + feedStep;
    if (num > feedMax) {
      return false;
    }
    this.setState({
      feedValue: num,
    });
  };

  handleReduce = () => {
    const { feedValue } = this.state;
    const { feedStep } = this.props;
    const num = feedValue - feedStep;
    if (num < 1) {
      return false;
    }
    this.setState({
      feedValue: num,
    });
  };

  handlePressOut = () => {
    clearInterval(this._interval);
  };
  // 下发dp点进行喂食
  feedPressNum = () => {
    const { feedValue } = this.state;
    TYDevice.putDeviceData({
      feed_num: feedValue,
    });
    TYNative.showLoading({ title: '' });
    requestTimeout();
  };

  render() {
    const { panelItemActiveColor, feedMax, food_weight } = this.props;
    const { feedValue, weightUnit } = this.state;
    return (
      <View style={styles.feedOperatePage}>
        <View style={styles.feedNumContain}>
          <View style={styles.feedIconBox}>
            <TouchableWithoutFeedback
              onPressIn={() => this.handlePressIn(false)}
              onPressOut={this.handlePressOut}
              disabled={feedValue <= 1}
            >
              <Image source={Res.tabFeed.cutNum} style={styles.feedIcon} />
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.feedvalueBox}>
            <TYText style={styles.feedvalue}>{feedValue}</TYText>
            <TYText style={styles.feedUnit}>
              {`${Strings.getLang('ipc_pet_num')}(${feedValue * food_weight}${weightUnit})`}
            </TYText>
          </View>
          <View style={styles.feedIconBox}>
            <TouchableWithoutFeedback
              onPressIn={() => this.handlePressIn(true)}
              onPressOut={this.handlePressOut}
              disabled={feedValue >= feedMax}
            >
              <Image source={Res.tabFeed.addNum} style={styles.feedIcon} />
            </TouchableWithoutFeedback>
          </View>
        </View>
        <View style={[styles.feedBtn, { backgroundColor: panelItemActiveColor }]}>
          <TouchableWithoutFeedback onPress={this.feedPressNum}>
            <TYText style={styles.feedText}>{Strings.getLang('ipc_pet_feed')}</TYText>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  feedOperatePage: {
    width: '100%',
    height: cx(48),
    flexDirection: 'row',
    marginBottom: cx(15),
  },
  feedNumContain: {
    flex: 1,
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedIconBox: {
    width: cx(50),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedIcon: {
    width: cx(26),
    resizeMode: 'contain',
  },
  feedvalueBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  feedvalue: {
    color: '#000000',
    fontSize: cx(22),
    fontWeight: '600',
  },
  feedUnit: {
    top: -Math.ceil(cx(3)),
    fontSize: cx(14),
    marginLeft: cx(3),
    color: color('#000000')
      .alpha(0.5)
      .rgbString(),
  },
  feedBtn: {
    marginLeft: cx(10),
    height: '100%',
    minWidth: cx(108),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  feedText: {
    color: '#ffffff',
  },
});

const mapStateToProps = state => {
  const { feed_num, food_weight } = state.dpState;
  const { schema } = state.devInfo;
  const { max: feedMax, step: feedStep } = schema.feed_num;
  return {
    feed_num,
    food_weight,
    feedMax,
    feedStep,
  };
};

export default connect(mapStateToProps, null)(FeedOperate);
