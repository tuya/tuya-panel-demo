import React from 'react';
import { View, StyleSheet, Image, Animated, Easing } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Config from '../../config';
import Strings from '../../i18n';
import Res from '../../res';

const { cx, topBarHeight, statusBarHeight, isIOS } = Config;

class LoadingToast extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rotateValue: new Animated.Value(0),
    };
  }
  componentDidMount() {
    this.startAnimation();
  }
  startAnimation = () => {
    this.state.rotateValue.setValue(0);
    Animated.timing(this.state.rotateValue, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
    }).start(() => this.startAnimation());
  };

  render() {
    const { rotateValue } = this.state;
    return (
      <View style={styles.loadingToastPage}>
        <Animated.Image
          source={Res.publicImage.prevLoading}
          style={[
            styles.loadingNormal,
            {
              width: isIOS ? cx(14) : cx(28),
              top: isIOS ? 0 : statusBarHeight / 2,
              transform: [
                {
                  rotate: rotateValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
        {/* <Image source={Res.publicImage.prevLoading} style={styles.loadingGif} />
        <TYText style={styles.loadingText}>{Strings.getLang('panel_loading_txt')}</TYText> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loadingToastPage: {
    paddingHorizontal: 50,
    position: 'absolute',
    top: -(topBarHeight + statusBarHeight),
    left: 0,
    right: 0,
    bottom: -(topBarHeight + statusBarHeight),
    // backgroundColor: 'rgba(0,0,0,1)',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // loadingGif: {
  //   width: cx(70),
  //   height: cx(70),
  //   resizeMode: 'contain',
  // },
  loadingNormal: {
    width: cx(28),
    resizeMode: 'contain',
  },
  loadingText: {
    marginTop: cx(10),
    color: '#fff',
    fontSize: cx(14),
    textAlign: 'center',
  },
});

export default LoadingToast;
