/* eslint-disable max-len */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TYText, TYSdk } from 'tuya-panel-kit';
import { showCutScreen } from '../../redux/modules/ipcCommon';
import PanelClick from '../../config/panelClick';
import Res from '../../res';
import Config from '../../config';
import Strings from '../../i18n';

const { cx, cy } = Config;

const TYEvent = TYSdk.event;

class CutScreen extends React.Component {
  static propTypes = {
    isFullScreen: PropTypes.bool.isRequired,
    cutBase64Img: PropTypes.string.isRequired,
    showCutScreen: PropTypes.func.isRequired,
    isVideoCut: PropTypes.bool.isRequired,
    panelItemActiveColor: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {};
    this.startShowCutTimeout = null;
  }
  componentDidMount() {
    TYEvent.on('readyCloseCutScreen', this.readyCloseCutScreen);
  }
  componentWillUnmount() {
    TYEvent.off('readyCloseCutScreen');
    this.startShowCutTimeout = null;
  }
  readyCloseCutScreen = () => {
    this.startShowCutTimeout = setTimeout(() => {
      this.props.showCutScreen({ showCutScreen: false });
    }, 5000);
  };
  enterAlbum = () => {
    PanelClick.enterGeneralAlbum();
    this.props.showCutScreen({ showCutScreen: false });
  };
  hideCutScreen = () => {
    this.props.showCutScreen({ showCutScreen: false });
    clearTimeout(this.startShowCutTimeout);
  };

  render() {
    const { isFullScreen, cutBase64Img, isVideoCut, panelItemActiveColor } = this.props;
    const baseImg =
      Platform.OS === 'ios' ? `data:image/png;base64,${cutBase64Img}` : `file://${cutBase64Img}`;
    return (
      <TouchableOpacity
        style={styles.cutScreenContainer}
        activeOpacity={1}
        onPress={this.hideCutScreen}
      >
        <TouchableOpacity
          style={[isFullScreen ? styles.cutFullScreenPage : styles.cutScreenPage]}
          activeOpacity={1}
          onPress={() => false}
        >
          <View style={styles.cutImgBox}>
            <Image source={{ uri: baseImg }} style={styles.cutImg} />
            {isVideoCut && (
              <Image style={styles.playRecordIcon} source={Res.publicImage.cutScreenIcon} />
            )}
          </View>
          <TYText numberOfLines={1} style={styles.cutTip}>
            {isVideoCut ? Strings.getLang('recordSave') : Strings.getLang('screenShotText')}
          </TYText>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.albumBox, { backgroundColor: panelItemActiveColor }]}
            onPress={this.enterAlbum}
          >
            <TYText numberOfLines={1} style={styles.enterAlbum}>
              {Strings.getLang('enterAlbum')}
            </TYText>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
}
const styles = StyleSheet.create({
  cutScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  cutFullScreenPage: {
    flex: 1,
    left: '50%',
    marginLeft: -cx(210),
    width: cx(420),
    position: 'absolute',
    bottom: cy(25),
    height: cy(60),
    padding: cx(15),
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cutScreenPage: {
    position: 'absolute',
    left: cx(10),
    right: cx(10),
    bottom: cy(10),
    height: cy(60),
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: cx(15),
    alignItems: 'center',
  },
  cutImgBox: {
    borderRadius: Math.ceil(cx(2)),
    overflow: 'hidden',
    width: cx(80),
    height: cx(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cutImg: {
    width: cx(80),
    height: cx(40),
  },
  playRecordIcon: {
    position: 'absolute',
    width: cx(25),
    height: cx(25),
  },
  cutTip: {
    flex: 1,
    color: '#333',
    fontSize: cx(12),
    paddingLeft: cx(15),
  },
  albumBox: {
    borderRadius: Math.ceil(cx(20)),
    overflow: 'hidden',
  },
  enterAlbum: {
    color: '#fff',
    paddingHorizontal: cx(15),
    paddingVertical: cx(10),
    fontSize: cx(12),
  },
});
const mapStateToProps = state => {
  const { isFullScreen, cutBase64Img, isVideoCut, panelItemActiveColor } = state.ipcCommonState;
  return {
    isFullScreen,
    cutBase64Img,
    isVideoCut,
    panelItemActiveColor,
  };
};

const mapToDisPatch = dispatch => {
  return bindActionCreators({ showCutScreen }, dispatch);
};

export default connect(mapStateToProps, mapToDisPatch)(CutScreen);
