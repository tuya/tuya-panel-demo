/* eslint-disable max-len */
import React, { Component } from 'react';
import { Toast } from 'tuya-panel-kit';
import { View, StyleSheet, Text, InteractionManager, Dimensions, Animated } from 'react-native';
import LoadingView from './loading';
import Strings from './i18n';
import Topbar from '../top-bar';
import Timer from './timer';

const { width, height } = Dimensions.get('screen');

class AnimatedTopbar extends Component {
  state = {
    opacityValue: new Animated.Value(0),
  };

  componentDidMount() {
    this.fadeAnimation();
  }

  componentWillUnmount() {
    this.fadeAnimation(false);
  }

  fadeAnimation = (start = true) => {
    Animated.spring(this.state.opacityValue, {
      toValue: start ? 1 : 0,
      duration: 200,
    }).start();
  };

  render() {
    return (
      <Animated.View style={{ opacity: this.state.opacityValue }}>
        <Topbar {...this.props} />
      </Animated.View>
    );
  }
}

export default class LazyLoadView extends Component {
  static displayName = 'lazyLoadView';
  constructor(props) {
    super(props);

    this.state = {
      // loading: false, 加载动画是否执行
      loading: false,
      // isError: false 是否保存
      isError: false,
      // receiveData: true 是否获取到数据
      receiveData: true,
      // overTime: false 是否超时
      overTime: false,
      // isComponentInitialized: true 是否初始化完
      isComponentInitialized: true,
    };

    this.errorText = Strings.getLang('view_error');
    this.emptyText = Strings.getLang('view_noData');
    this.overTimeText = Strings.getLang('view_overtime');
    this.hideEmptyView = false;
    this.hideToast = false;
    this.disableInterAction = false;
    this.__overTime = 25000;
    this._timer = null;
    this._error = null;
  }

  componentDidMount() {
    if (this.disableInterAction) {
      this.onReady();
    } else {
      InteractionManager.runAfterInteractions(this.onReady);
    }
  }

  componentWillUnmount() {
    Timer.destroy();
  }

  onReady = () => {
    this.setState({ loading: true, receiveData: false }, () => {
      this.setOverTime();
      // 确保一些操作在路由跳转过渡完后执行，防止跳转卡顿
      this.runActionsAfterRouteTransition();
    });
  };

  onDataReached = (isError = false, receiveData = true, callback) => {
    Timer.clearTimeout('timer');
    this.setState({ loading: false, isError, receiveData }, () => {
      isError && this.clearErrorState();
      callback && typeof callback === 'function' && callback();
    });
  };

  onDataReachedButEmpty = (callback = null) => {
    this.onReached(true, callback);
  };

  onDataReachedWithoutCallBack = () => {
    this.onReached();
  };

  onDataReachedWithCallBack = (callback = null) => {
    this.onReached(false, callback);
  };

  onReached = (isEmpty = false, callback) => this.onDataReached(false, !isEmpty, callback);

  onError = callback => this.onDataReached(true, false, callback);

  setOverTime = () => {
    Timer.setTimeout(
      'timer',
      () => {
        this.setState({ overTime: true, loading: false });
      },
      this.__overTime
    );
  };

  clearErrorState = () => {
    Timer.setTimeout(
      'error',
      () => {
        this.setState({ isError: false });
      },
      2000
    );
  };

  mergeStyle = () => ({});

  mergeTopBar = () => ({});

  runActionsAfterRouteTransition = () => {};

  renderDataEmptyView = () => <Text style={styles.tip}>{this.emptyText}</Text>;

  renderEmptyView = () => {
    const { loading, isError, receiveData, overTime } = this.state;
    if (!loading && receiveData) return <View />;
    const { emptyContainer, emptyContent } = this.mergeStyle();
    const { hideTopbar = false } = this.mergeTopBar();
    const containerCommonStyle = [
      styles.emptyContainer,
      (isError || overTime) && styles.errorContainer,
      !hideTopbar && { height: height - Topbar.height },
    ];
    return (
      <View style={[...containerCommonStyle, emptyContainer]}>
        {this.renderEmptyTopContainer()}
        <View style={[...containerCommonStyle, emptyContent]}>
          {loading && (
            <LoadingView
              itemNum={3}
              value={loading}
              showComplete={false}
              completeColor="#FA9601"
              sequenceColor="#FA9601"
              style={styles.loading}
            />
          )}
          {!loading &&
            (overTime ? (
              <Text style={styles.tip}>{overTime ? this.overTimeText : this.emptyText}</Text>
            ) : (
              this.renderDataEmptyView()
            ))}
        </View>
      </View>
    );
  };

  renderBody = () => <View />;

  renderEmptyTopContainer = () => <View />;

  renderTopBar = () => {
    const { hideTopbar = false, renderTopbar, ...others } = this.mergeTopBar();
    if (hideTopbar) return;
    typeof renderTopbar === 'function' && renderTopbar();
    if (typeof renderTopbar === 'function') {
      return renderTopbar();
    }
    return <AnimatedTopbar {...others} />;
  };

  render() {
    const { receiveData, loading, isError, isComponentInitialized } = this.state;
    const { hideEmptyView } = this;
    const { containerStyle, contentStyle } = this.mergeStyle();
    const componentInit =
      hideEmptyView || (receiveData && !loading && !isError && isComponentInitialized);
    return (
      <View style={[styles.container, containerStyle]}>
        {this.renderTopBar()}
        <View style={[styles.content, contentStyle]}>
          {!hideEmptyView && this.renderEmptyView()}
          {componentInit && this.renderBody()}
        </View>
        {!this.hideToast && <Toast show={isError} text={this.errorText} onFinish={() => {}} />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width,
  },

  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    width,
    height,
  },

  errorContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  tip: {
    fontSize: 16,
    color: '#22242C',
    backgroundColor: 'transparent',
  },
});
