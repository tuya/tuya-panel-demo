/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, LayoutAnimation, View, UIManager } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import LiveControlConfig from '../../components/liveBottomBar/liveControlConfig';
import LiveControlBasic from '../../components/liveBottomBar/liveControlBasic';
import Config from '../../config';

const { isIphoneX, smallScreen, middlleScreen, is7Plus, isIOS } = Config;

let defaultBaseHeight = 370;
if (smallScreen) {
  defaultBaseHeight = 275;
} else if (middlleScreen) {
  if (is7Plus) {
    defaultBaseHeight = 350;
  } else {
    defaultBaseHeight = 310;
  }
}

if (!isIOS && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

class LiveControlView extends React.Component {
  static propTypes = {
    isFullScreen: PropTypes.bool.isRequired,
    isAndriodFullScreenNavMode: PropTypes.bool.isRequired,
    devInfo: PropTypes.object.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      baseHeight: defaultBaseHeight,
      animScrollBoxHeight: isIphoneX ? 92 : 72,
    };
  }
  componentDidMount() {
    const { devInfo } = this.props;
    const defaultShowTabs = _.get(devInfo, 'panelConfig.fun.defaultShowTabs');
    if (defaultShowTabs) {
      const { baseHeight } = this.state;
      this.setState({
        animScrollBoxHeight: baseHeight + (isIphoneX ? 20 : 0),
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (
      !_.isEqual(this.props.isAndriodFullScreenNavMode, nextProps.isAndriodFullScreenNavMode) &&
      !nextProps.isAndriodFullScreenNavMode
    ) {
      const { defaultShowTabs } = this.state;
      if (!middlleScreen && !smallScreen && !isIOS) {
        const baseHeight = 310;
        let animScrollBoxHeight = 72;
        if (defaultShowTabs) {
          animScrollBoxHeight = 310;
        }
        this.setState({
          baseHeight,
          animScrollBoxHeight,
        });
      }
    }
  }
  openLiveControlBar = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      // create: {
      //   type: LayoutAnimation.Types.linear,
      //   //property: LayoutAnimation.Properties.scaleXY,
      // },
      update: {
        type: LayoutAnimation.Types.linear,
        springDamping: 0.6,
        duration: 100,
        initialVelocity: 2,
      },
    });
    const { baseHeight } = this.state;
    this.setState({ animScrollBoxHeight: baseHeight + (isIphoneX ? 20 : 0) });
  };
  closeLiveControlBar = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      // create: {
      //   type: LayoutAnimation.Types.linear,
      //   // property: LayoutAnimation.Properties.scaleXY,
      // },
      update: {
        type: LayoutAnimation.Types.linear,
        springDamping: 0.6,
        duration: 100,
        initialVelocity: 2,
      },
    });
    this.setState({ animScrollBoxHeight: isIphoneX ? 92 : 72 });
  };
  showMoreFeature = val => {
    if (val) {
      this.openLiveControlBar();
    } else {
      this.closeLiveControlBar();
    }
  };
  render() {
    const { animScrollBoxHeight, baseHeight } = this.state;
    const { isFullScreen, devInfo } = this.props;
    const defaultShowTabs = _.get(devInfo, 'panelConfig.fun.defaultShowTabs');
    const defaultTable = _.get(devInfo, 'panelConfig.fun.defaultTable');
    return (
      <View style={[styles.liveControlPage, { height: isFullScreen ? 0 : animScrollBoxHeight }]}>
        <LiveControlBasic
          openAnimateHeight={this.showMoreFeature}
          // 这个参数控制是否默认展开tab
          defaultShowTabs={defaultShowTabs}
        />
        {/* defaultTable为默认选中哪个Tab */}
        <LiveControlConfig defaultTable={defaultTable} baseHeight={baseHeight} />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  liveControlPage: {
    backgroundColor: '#ffffff',
  },
});

const mapStateToProps = state => {
  const { devInfo } = state;
  return {
    devInfo,
  };
};

export default connect(mapStateToProps, null)(LiveControlView);
