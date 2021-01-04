import _get from 'lodash/get';
import React, { Component } from 'react';
import {
  View,
  Text,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  WebView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Platform,
  PixelRatio,
} from 'react-native';
import throttle from './throttle';
import { getOssUrl } from './api';

const window = Dimensions.get('window');

const SOURCE_URL = '/smart/connect-scheme/d2e758ad-5e12-51d5-9ee5-57992d5e654c.html';

const defaultProps = {
  style: null,
  width: window.width,
  height: 400,
  type: 'dark',
  data: [],
  loading: false, // 数据是否正在加载，可用于某些需要数据加载完毕后再装载图表的场景
  loadingColor: null,
  updateThreshold: 375, // 图标数据刷新阈值
  loadingTimeout: 275, // 渲染图表超过多少毫秒后开始显示loading
  chartConfig: null as any,
  placeholder: '暂无数据',
  placeHolderTextStyle: null,
};
type Props = Readonly<typeof defaultProps> & {
  renderer?: (data: any) => React.ReactNode;
  renderLoading?: (data: any) => React.ReactNode;
  renderPlaceHolder?: () => React.ReactNode;
  onError?: (data: any) => void;
  onMessage?: (data: any) => void;
};

interface State {
  initializing: boolean;
  remoteUri: string;
}

export default class F2Chart extends Component<Props, State> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = defaultProps;

  _shouldUseRemoteUri = true;

  _hasInitChart = false;

  _loadingTimerId = null as number | null;

  throttledUpdateChart: (...rest) => any;

  chart: any;

  _time = 0;

  constructor(props: Props) {
    super(props);
    this.throttledUpdateChart = throttle(this._updateChart, props.updateThreshold);
    this.state = {
      initializing: true, // 图表是否正在初始化中
      remoteUri: '',
    };
  }

  async componentDidMount() {
    if (this._shouldUseRemoteUri) {
      const ossUrl = await getOssUrl();
      const remoteUri = `${ossUrl}${SOURCE_URL}`;
      this.setState({ remoteUri });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { data } = this.props;
    if (data !== nextProps.data) {
      this.throttledUpdateChart(nextProps.data);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { loading, width, height, style } = this.props;
    const { initializing, remoteUri } = this.state;
    return (
      loading !== nextProps.loading ||
      initializing !== nextState.initializing ||
      remoteUri !== nextState.remoteUri ||
      this.shouldUpdateWebView(nextProps) ||
      width !== nextProps.width ||
      height !== nextProps.height ||
      style !== nextProps.style
    );
  }

  componentWillUnmount() {
    this._clearLoadingTimeout();
  }

  get isLoading() {
    const { loading } = this.props;
    const { initializing } = this.state;
    return loading || initializing;
  }

  get color() {
    const { type } = this.props;
    return type === 'dark' ? '#000' : '#fff';
  }

  // 数据从无变有或者从有变化时需要重新渲染
  shouldUpdateWebView(nextProps) {
    const { data } = this.props;
    return (!data.length && nextProps.data.length) || (data.length && !nextProps.data.length);
  }

  _clearLoadingTimeout() {
    if (this._loadingTimerId) {
      clearTimeout(this._loadingTimerId);
    }
  }

  _updateChart(data) {
    this.chart && this.chart.postMessage(JSON.stringify(data));
  }

  _renderChart() {
    const { data, renderer, chartConfig: config } = this.props;
    if (typeof renderer !== 'function') {
      return;
    }
    const pixelRatio = PixelRatio.get();
    const chartConfig = {
      pixelRatio,
      ...config,
      id: 'main',
    };
    return `
      try {
        var chart = new F2.Chart(${JSON.stringify(chartConfig)});
        ${renderer(data)}
        window.document.addEventListener('message', function(e) {
          var newData = JSON.parse(e.data);
          chart.changeData(newData);
        });
      } catch (error) {
        window.postMessage(JSON.stringify({
          type: 'error',
          error,
          message: error.message
        }));
      }
    `;
  }

  _handleMessage = event => {
    const { onError, onMessage } = this.props;
    const { data } = event.nativeEvent;
    const parsedData = JSON.parse(data);
    if (parsedData.type === 'error') {
      console.warn('F2Chart renderer Error: ', parsedData.message, parsedData.error);
      onError && onError(parsedData.error);
    }
    onMessage && onMessage(parsedData);
  };

  _handleLoadStart = () => {
    if (this._hasInitChart) return;
    const { loadingTimeout } = this.props;
    this._time = Date.now();
    this._loadingTimerId = setTimeout(() => {
      this.setState({ initializing: true });
    }, loadingTimeout);
  };

  _handleLoadEnd = () => {
    if (this._hasInitChart) return;
    this.setState({ initializing: false });
    this._hasInitChart = true;
    this._time = 0;
    this._clearLoadingTimeout();
  };

  renderPlaceHolder() {
    const {
      style,
      width,
      height,
      placeholder,
      placeHolderTextStyle,
      renderPlaceHolder,
    } = this.props;
    if (renderPlaceHolder) return renderPlaceHolder();
    const placeHolderStyle = [
      style,
      styles.center,
      {
        width,
        height,
        backgroundColor: 'transparent',
      },
    ];
    return (
      <View style={placeHolderStyle}>
        <Text style={[{ fontSize: 14, color: this.color }, placeHolderTextStyle]}>
          {placeholder}
        </Text>
      </View>
    );
  }

  renderLoading() {
    const { loadingColor, renderLoading } = this.props;
    if (!this.isLoading) return;
    if (typeof renderLoading === 'function') return renderLoading(this.isLoading);
    return (
      <ActivityIndicator
        style={styles.loading}
        animating={true}
        size="small"
        color={loadingColor || this.color}
      />
    );
  }

  render() {
    const { remoteUri } = this.state;
    if (this._shouldUseRemoteUri && !remoteUri) {
      return null;
    }
    const { style, width, height, loading, data, onError } = this.props;
    const containerStyle = [
      style,
      {
        width,
        height,
        backgroundColor: 'transparent',
      },
    ];
    if (!loading && (!data || !data.length)) {
      return this.renderPlaceHolder();
    }
    return (
      <View style={containerStyle}>
        {this.renderLoading()}
        <WebView
          style={containerStyle}
          ref={ref => {
            this.chart = ref;
          }}
          allowUniversalAccessFromFileURLs={true}
          onShouldStartLoadWithRequest={() => true}
          scrollEnabled={false}
          injectedJavaScript={this._renderChart()}
          scalesPageToFit={Platform.OS !== 'ios'}
          source={{ uri: remoteUri }}
          onMessage={this._handleMessage}
          onLoadStart={this._handleLoadStart}
          onLoadEnd={this._handleLoadEnd}
          onError={onError}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
