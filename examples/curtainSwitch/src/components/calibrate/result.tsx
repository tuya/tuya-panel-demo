import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { View, StyleSheet, Image } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import CircularPicker from './circularPicker';
import Res from '../../res';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

const LENGTH = 10;

interface ResultViewProps {
  state: string;
}
interface ResultViewStates {
  countdown: number;
}
class ResultView extends Component<ResultViewProps, ResultViewStates> {
  constructor(props) {
    super(props);
    this.state = {
      countdown: 10,
    };
    this.valueTimer = null;
  }

  componentDidMount() {
    clearInterval(this.valueTimer);
    this.valueTimer = setInterval(() => {
      this.handlerCountdown();
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.valueTimer);
  }

  valueTimer: any;

  handlerCountdown = () => {
    const { countdown } = this.state;
    if (countdown > 0) {
      this.setState({
        countdown: countdown - 1,
      });
    } else {
      clearInterval(this.valueTimer);
    }
  };

  renderAnimate = processValue => (
    <CircularPicker
      style={{
        transform: [{ rotate: '180deg' }],
      }}
      degree={processValue}
      radius={cx(29)}
      disabled={true}
      strokeWidth={2}
      startDegree={0}
      endDegree={360}
      strokeColor="rgba(64,166,255,.2)"
      frontStrokeColor="#40A6FF"
      strokeLinecap="round"
    />
  );

  render() {
    const { state } = this.props;
    const { countdown } = this.state;
    return (
      <View style={styles.customContent}>
        {state === 'wait' ? (
          this.renderAnimate((LENGTH - countdown) * 36)
        ) : (
          <Image source={state === 'over' ? Res.failed : Res.ok} />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  customContent: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: cy(30),
    paddingHorizontal: cx(16),
  },
});

export default connect(({ modes }: any) => ({
  state: modes.state,
}))(ResultView);
