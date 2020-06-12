/* eslint-disable camelcase */
/* eslint-disable react/require-default-props */
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Animated } from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import PtzFullScreen from '../publicComponents/ptzFullScreen';
import ZoomFullScreen from '../publicComponents/zoomFullScreen';
import Config from '../../config';

const { cx } = Config;

class FullFeatureBottomLeft extends React.Component {
  static propTypes = {
    hideFullMenu: PropTypes.bool.isRequired,
    changeHideFullMenuState: PropTypes.func.isRequired,
    ptz_control: PropTypes.string,
    absoluteValue: PropTypes.number.isRequired,
    stopFullAnimation: PropTypes.bool.isRequired,
    changeStopAnimateState: PropTypes.func.isRequired,
    showSelfModal: PropTypes.bool.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      btnAnim: new Animated.Value(props.absoluteValue),
    };
    this.timerId = null;
  }
  componentWillReceiveProps(nextProps) {
    const oldProps = this.props;
    if (!_.isEqual(oldProps.hideFullMenu, nextProps.hideFullMenu)) {
      this.animatePlayerFeature(nextProps.hideFullMenu);
    }
    if (!_.isEqual(oldProps.stopFullAnimation, nextProps.stopFullAnimation)) {
      if (nextProps.stopFullAnimation) {
        this.stopAnimateFullScreen();
      }
    }
  }
  componentWillUnmount() {
    clearTimeout(this.timerId);
  }
  /**
   * 隐藏全屏按钮定时器
   */
  hideButtonTimer = () => {
    this.timerId = setTimeout(() => {
      this.hideFullScreenBtn();
    }, 5000);
  };
  hideFullScreenBtn = () => {
    //  const { offsetDistance } = this.state;
    Animated.timing(this.state.btnAnim, {
      toValue: -Math.ceil(cx(180)),
    }).start();
  };

  stopAnimateFullScreen = () => {
    clearTimeout(this.timerId);
    this.showFullScreenBtn();
  };

  showFullScreenBtn() {
    Animated.timing(this.state.btnAnim, {
      toValue: this.props.absoluteValue,
    }).start();
  }
  animatePlayerFeature = showAnimate => {
    clearTimeout(this.timerId);
    if (showAnimate) {
      this.hideFullScreenBtn();
    } else {
      this.showFullScreenBtn();
      this.hideButtonTimer();
      this.props.changeHideFullMenuState(false);
    }
  };

  render() {
    const { btnAnim } = this.state;
    const { ptz_control, showSelfModal } = this.props;
    return (
      <Animated.View style={[styles.fullFeatureBottomLeftPage, { left: btnAnim }]}>
        {ptz_control !== undefined && !showSelfModal && (
          <PtzFullScreen showfullScreen={this.props.changeStopAnimateState} />
        )}
        {!showSelfModal && <ZoomFullScreen showfullScreen={this.props.changeStopAnimateState} />}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  fullFeatureBottomLeftPage: {
    position: 'absolute',
    bottom: cx(30),
    flexDirection: 'row',
  },
});

const mapStateToProps = state => {
  const { ptz_control } = state.dpState;
  return {
    ptz_control,
  };
};

export default connect(mapStateToProps, null)(FullFeatureBottomLeft);
