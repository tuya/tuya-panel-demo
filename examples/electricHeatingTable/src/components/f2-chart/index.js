import PropTypes from "prop-types";
import React, { Component } from "react";
import {
  View,
  Text,
  WebView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Platform,
  PixelRatio,
  ViewPropTypes
} from "react-native";
import throttle from "./throttle";

const window = Dimensions.get("window");

const source = require("./index.html");

export default class F2Chart extends Component {
  static propTypes = {
    style: ViewPropTypes.style,
    width: PropTypes.number,
    height: PropTypes.number,
    type: PropTypes.oneOf(["dark", "light"]),
    data: PropTypes.array,
    loading: PropTypes.bool,
    updateThreshold: PropTypes.number,
    loadingTimeout: PropTypes.number,
    renderer: PropTypes.func.isRequired,
    onMessage: PropTypes.func,
    onError: PropTypes.func,
    placeholder: PropTypes.string,
    renderPlaceHolder: PropTypes.func,
    renderLoading: PropTypes.func
  };

  static defaultProps = {
    style: null,
    width: window.width,
    height: 400,
    type: "dark",
    data: [],
    loading: false, // 数据是否正在加载，可用于某些需要数据加载完毕后再装载图表的场景
    updateThreshold: 375, // 图标数据刷新阈值
    loadingTimeout: 275, // 渲染图表超过多少毫秒后开始显示loading
    onMessage: null,
    onError: null,
    placeholder: "暂无数据",
    renderPlaceHolder: null,
    renderLoading: null
  };

  constructor(props) {
    super(props);
    this._hasInitChart = false;
    this._loadingTimerId = null;
    this.throttledUpdateChart = throttle(
      this._updateChart,
      props.updateThreshold
    );
    this.state = {
      initializing: true // 图表是否正在初始化中
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data) {
      this.throttledUpdateChart(nextProps.data);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.initializing !== nextState.initializing ||
      this.shouldUpdateWebView(nextProps) ||
      this.props.width !== nextProps.width ||
      this.props.height !== nextProps.height ||
      this.props.style !== nextProps.style
    );
  }

  componentWillUnmount() {
    this._clearLoadingTimeout();
  }

  get isLoading() {
    return this.props.loading || this.state.initializing;
  }

  get color() {
    return this.props.type === "dark" ? "#000" : "#fff";
  }

  // 数据从无变有或者从有变化时需要重新渲染
  shouldUpdateWebView(nextProps) {
    return (
      (!this.props.data.length && nextProps.data.length) ||
      (this.props.data.length && !nextProps.data.length)
    );
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
    const { data, renderer } = this.props;
    if (typeof renderer !== "function") {
      return;
    }
    const pixelRatio = PixelRatio.get();
    return `
      try {
        var chart = new F2.Chart({
          id: 'main',
          pixelRatio: ${pixelRatio}
        });
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
    const { data } = event.nativeEvent;
    const parsedData = JSON.parse(data);
    if (parsedData.type === "error") {
      console.warn(
        "F2Chart renderer Error: ",
        parsedData.message,
        parsedData.error
      );
      this.props.onError && this.props.onError(parsedData.error);
    }
    this.props.onMessage && this.props.onMessage(parsedData);
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
    this._time = null;
    this._clearLoadingTimeout();
  };

  renderPlaceHolder() {
    const { style, width, height, placeholder, renderPlaceHolder } = this.props;
    if (renderPlaceHolder) return renderPlaceHolder();
    const placeHolderStyle = [
      style,
      styles.center,
      {
        width,
        height,
        backgroundColor: "transparent"
      }
    ];
    return (
      <View style={placeHolderStyle}>
        <Text style={{ fontSize: 14, color: this.color }}>{placeholder}</Text>
      </View>
    );
  }

  renderLoading() {
    const { renderLoading } = this.props;
    if (!this.isLoading) return;
    if (typeof renderLoading === "function") renderLoading(this.isLoading);
    return (
      <ActivityIndicator
        style={styles.loading}
        animating={true}
        size='small'
        color={this.color}
      />
    );
  }

  render() {
    const { style, width, height, loading, data } = this.props;
    const containerStyle = [
      style,
      {
        width,
        height,
        backgroundColor: "transparent"
      }
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
          scrollEnabled={false}
          injectedJavaScript={this._renderChart()}
          scalesPageToFit={Platform.OS !== "ios"}
          source={source}
          onMessage={this._handleMessage}
          onLoadStart={this._handleLoadStart}
          onLoadEnd={this._handleLoadEnd}
          onError={this.props.onError}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },

  center: {
    alignItems: "center",
    justifyContent: "center"
  }
});
