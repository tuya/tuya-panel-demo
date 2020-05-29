import React, { Component } from 'react';
/* eslint-disable */
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
  Text,
  WebView,
  ViewPropTypes,
} from 'react-native';
import HeaderView from '../top-bar';
import { Utils } from 'tuya-panel-kit';
import video from './h5-video';
import Strings from './i18n';

const { RatioUtils } = Utils;
const { width, height } = Dimensions.get('window');
const { convertX: cx, convertY: cy } = RatioUtils;
const Res = {
  playImg: require('./res/video.png'),
  mask: require('./res/mask.png'),
};
const FORMAT = ['.mp4', '.MP4'];
export default class H5VideoPlayer extends Component {
  static propTypes = {
    style: ViewPropTypes.style,
    uri: PropTypes.string,
    navigator: PropTypes.object.isRequired,
    initImage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    allowUniversalAccessFromFileURLs: PropTypes.bool,
    onPlay: PropTypes.func,
    mainTitle: PropTypes.string,
    ...WebView.propTypes,
  };

  static defaultProps = {
    style: {},
    uri: '',
    mainTitle: '',
    isVideo: true,
    initImage: null,
    onPlay: null,
    allowUniversalAccessFromFileURLs: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      isPlay: false,
    };

    this._webView = null;
  }

  _connectRef = localRef => {
    const { ref } = this.props;
    this._webView = localRef;
    ref && ref(localRef);
  };

  _onMessage = ({ nativeEvent }) => {
    // do someting
  };

  _handleVideoPlay = () => {
    this._onMessagePost('play', true);
  };

  _handleVideoHide = () => {
    this._onMessagePost('stop');
  };

  _onMessagePost = (message = 'play', status = false) => {
    const { onPlay } = this.props;
    this.setState({ isPlay: status }, () => {
      onPlay && onPlay(status);
      this._webView && this._webView.postMessage(message);
    });
  };

  renderVideoPlayerView = () => {
    const { uri, initImage, webViewStyle, isVideo, ...webViewProps } = this.props;
    let source = { html: video(uri, initImage) };
    if (!FORMAT.some(s => uri.indexOf(s) !== -1)) {
      source = { uri };
    }
    const { isPlay } = this.state;
    // 安卓postMessage无效不知道为啥
    if (Platform.OS === 'android' && !isPlay) source = {};
    // 宽高为1为了初始拿ref
    const initStyle = {
      height: 1,
      width: 1,
    };
    const displayStyle = {
      width,
      height: height - cy(20),
    };
    const style = !isPlay ? initStyle : displayStyle;
    return (
      <View style={[styles.webView, webViewStyle, style]}>
        <WebView
          ref={ref => this._connectRef(ref)}
          style={[styles.webView, webViewStyle, { flex: 1 }]}
          javaScriptEnabled={true}
          scalesPageToFit={true}
          thirdPartyCookiesEnabled={true}
          onMessage={this._onMessage}
          mediaPlaybackRequiresUserAction={false}
          source={source}
          renderError={this.renderError}
          {...webViewProps}
        />
      </View>
    );
  };

  renderError = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.errorText}>{Strings.getLang('webview-error')}</Text>
      </View>
    );
  };

  renderInitPage = () => {
    const { initImage, mainTitle, stepTitle } = this.props;
    const image = typeof initImage === 'string' ? { uri: initImage } : initImage;
    const DisplayImage = ({ img }) => (
      <Image
        source={img}
        style={[styles.commonStyle, styles.initImageStyle, { resizeMode: 'cover' }]}
      />
    );

    return (
      <View style={[styles.container, styles.initContainer, styles.commonStyle]}>
        <DisplayImage img={image} />
        <DisplayImage img={Res.mask} />
        <View style={styles.tipContainer}>
          <Text style={[styles.textTitleStyle]}>{mainTitle}</Text>
          {stepTitle && <Text style={[styles.textStepTitleStyle]}>{stepTitle}</Text>}
        </View>
        <TouchableOpacity onPress={this._handleVideoPlay}>
          <Image source={Res.playImg} />
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    const { style } = this.props;
    const { isPlay } = this.state;
    return (
      <View
        style={[
          styles.container,
          styles.commonStyle,
          style,
          isPlay && { height, zIndex: 9999, backgroundColor: '#000' },
        ]}
      >
        {!isPlay && this.renderInitPage()}
        {this.renderVideoPlayerView()}
        {isPlay && (
          <View style={{ width, position: 'absolute', top: 0 }}>
            <HeaderView title=" " actions={[]} onBack={this._handleVideoHide} />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  commonStyle: {
    height: cy(225),
    width,
  },
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  webView: {
    height: cy(225),
    width,
    position: 'absolute',
    backgroundColor: '#000',
  },
  initContainer: {
    backgroundColor: '#000',
  },
  modalContainer: {
    width,
    height,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,1)',
  },
  initImageStyle: {
    position: 'absolute',
  },
  textTitleStyle: {
    zIndex: 20,
    color: '#fff',
    fontSize: cx(20),
    fontWeight: '500',
    fontFamily: 'PingFang SC',
    backgroundColor: 'transparent',
  },
  errorText: {
    zIndex: 20,
    color: '#000',
    fontSize: cx(20),
    fontWeight: '500',
    fontFamily: 'PingFang SC',
    backgroundColor: 'transparent',
  },
  textStepTitleStyle: {
    zIndex: 20,
    color: 'rgba(255,255,255,.6)',
    fontSize: cx(15),
    fontWeight: '500',
    fontFamily: 'PingFang SC',
    backgroundColor: 'transparent',
    marginTop: cy(8),
  },
  tipContainer: {
    position: 'absolute',
    bottom: 38,
    left: cx(10),
  },
});
