import React, { useState } from 'react';
import { View, StyleSheet, LayoutAnimation, UIManager } from 'react-native';
import { commonConfig } from '@config';
import { LiveControlBasic, LiveGrid } from '@components';

const { isIphoneX, smallScreen, middleScreen, is7Plus, isIOS } = commonConfig;

let defaultBaseHeight = 370;

smallScreen && (defaultBaseHeight = 275);
middleScreen && is7Plus && (defaultBaseHeight = 350);
middleScreen && !is7Plus && (defaultBaseHeight = 310);

const initAnimScrollBoxHeight = isIphoneX ? 92 : 72;

if (!isIOS && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface LiveControlViewProps {
  isFullScreen: boolean;
}

const LiveControlView: React.FC<LiveControlViewProps> = (props: LiveControlViewProps) => {
  const [baseHeight] = useState(defaultBaseHeight);
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

const styles = StyleSheet.create({
  liveControlViewPage: {},
});

export default LiveControlView;
