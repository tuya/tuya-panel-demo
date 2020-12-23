import React, { useState } from 'react';
import { StatusBar, View, StyleSheet, LayoutAnimation, UIManager } from 'react-native';
import { connect } from 'react-redux';
import { commonConfig } from '@config';
import { LiveControlBasic, LiveGrid } from '@components';

const { isIphoneX, smallScreen, middlleScreen, is7Plus, isIOS } = commonConfig;

let defaultBaseHeight = 370;

smallScreen && (defaultBaseHeight = 275);
middlleScreen && is7Plus && (defaultBaseHeight = 350);
middlleScreen && !is7Plus && (defaultBaseHeight = 310);

const initAnimScrollBoxHeight = isIphoneX ? 92 : 72;

if (!isIOS && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface LiveControlViewProps {
  isFullScreen?: boolean;
  // showLoadingToast?: boolean;
  // hasRight?: boolean;
  // rightPress?: () => void;
  // contentTitle?: string;
  // leftPress?: () => void;
  // themeBarStyleBg?: any;
  // themeTextColor?: string;
  // themeBgc?: string;
}

const LiveControlView: React.FC<LiveControlViewProps> = (props: LiveControlViewProps) => {
  const [baseHeight, setBaseHeight] = useState(defaultBaseHeight);
  const [animScrollBoxHeight, setAnimScrollBoxHeight] = useState(initAnimScrollBoxHeight);

  const showMoreFeature = (isNeedOpen: boolean) => {
    let boxHeight = baseHeight + (isIphoneX ? 20 : 0);
    !isNeedOpen && (boxHeight = isIphoneX ? 92 : 72);
    controlLiveControlBar(boxHeight);
  };

  const controlLiveControlBar = (boxHeight: number) => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.linear,
        springDamping: 0.6,
        duration: 100,
        initialVelocity: 2,
      },
    });
    setAnimScrollBoxHeight(boxHeight);
  };

  const { isFullScreen } = props;
  return (
    <View style={[styles.liveControlViewPage, { height: isFullScreen ? 0 : animScrollBoxHeight }]}>
      <LiveControlBasic openAnimateHeight={showMoreFeature} />
      <LiveGrid />
    </View>
  );
};

// LiveControlView.defaultProps = {
//   showLoadingToast: true,
//   hasRight: true,
//   isFullScreen: false,
//   contentTitle: 'Title',
//   rightPress: () => false,
//   leftPress: () => false,
//   themeBarStyleBg: 'light-content',
//   themeTextColor: '#000000',
//   themeBgc: '#ffffff',
// };

const styles = StyleSheet.create({
  liveControlViewPage: {},
});

const mapStateToProps = (state: any) => {
  const { type, customTheme } = state.theme;
  const themeTextColor = customTheme[type].textColor;
  const themeBgc = customTheme[type].background;
  const themeBarStyleBg = customTheme[type].barStyleBg;
  return {
    themeTextColor,
    themeBgc,
    themeBarStyleBg,
  };
};

export default connect(mapStateToProps, null)(LiveControlView);
