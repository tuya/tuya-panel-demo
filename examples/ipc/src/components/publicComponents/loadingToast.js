import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Config from '../../config';
import Strings from '../../i18n';
import Res from '../../res';

const { cx, topBarHeight, statusBarHeight } = Config;

class LoadingToast extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <View style={styles.loadingToastPage}>
        <Image source={Res.publicImage.prevLoading} style={styles.loadingGif} />
        <TYText style={styles.loadingText}>{Strings.getLang('panel_loading_txt')}</TYText>
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
    backgroundColor: 'rgba(0,0,0,1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGif: {
    width: cx(70),
    height: cx(70),
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
