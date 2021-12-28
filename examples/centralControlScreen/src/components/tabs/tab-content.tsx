/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import {
  Animated,
  ActivityIndicator,
  Easing,
  PanResponder,
  PanResponderInstance,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Utils } from 'tuya-panel-kit';
import { AnimatedView } from './styled';
import { FRICTION_LEVEL } from './constant';
import { getSiblingIndex, getNearestIndexByDeltaX } from './utils';
import TabPanel from './tab-panel';

const { winWidth } = Utils.RatioUtils;

interface IAnimationConfig {
  duration: number;
  easing: () => number;
  delay: number;
  isInteraction: boolean;
  useNativeDriver: boolean;
}

interface ITabContentProps {
  /**
   * 嵌套子元素
   */
  children: any[];
  /**
   * 当前激活所处的索引
   */
  activeIndex: number;
  /**
   * TabContent样式
   */
  style?: StyleProp<ViewStyle>;

  /**
   * 是否禁用 TabContent
   */
  disabled?: boolean;
  /**
   * TabContent 是否需要预加载
   */
  preload?: boolean;
  /**
   * TabContent 预加载延时时间
   */
  preloadTimeout?: number;
  /**
   * TabContent 滑动回调
   */
  onMove?: (gestureState, index, percent) => void;
  /**
   * TabContent 滑动结束时回调
   */
  onRelease?: (gestureState, index, percent) => void;
  /**
   * 自定义渲染预加载中的占位容器
   */
  renderPlaceholder?: (activeIndex: number, child: any) => React.ReactElement;

  /**
   * 动画配置
   */
  animationConfig: IAnimationConfig;
}

interface ITabContentState {
  scrollX: Animated.Value;
  cachedChildren;
}

export default class TabContent extends Component<ITabContentProps, ITabContentState> {
  _bounds: number[];

  _curDeltaX: number;

  _panResponder: PanResponderInstance;

  _timerId;

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    style: null,
    disabled: false,
    preload: true,
    preloadTimeout: 375,
    onMove: undefined,
    onRelease: undefined,
    renderPlaceholder: () => <ActivityIndicator />,
    animationConfig: {
      duration: 200,
      easing: Easing.linear,
      delay: 0,
      isInteraction: true,
      useNativeDriver: true,
    },
  };

  constructor(props) {
    super(props);
    const { activeIndex, children } = props;
    const x = -activeIndex * winWidth;
    const cachedChildren = Array.isArray(children) ? new Array(children.length).fill(0) : [];
    cachedChildren[activeIndex] = children[activeIndex];
    this.state = {
      scrollX: new Animated.Value(x),
      cachedChildren,
    };
    this._bounds = [0, -winWidth * children.length + winWidth]; // x轴左右边界坐标
    this._curDeltaX = x; // 当前的x轴偏移量
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => !this.props.disabled,
      onStartShouldSetPanResponderCapture: () => false, // 不捕获grant，否则内部的点击事件会被截断
      onMoveShouldSetPanResponder: gestureState => {
        if (this.props.disabled) return false;
        return this.isHorizontalSwipe(gestureState);
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        if (this.props.disabled) return false;
        return this.isHorizontalSwipe(gestureState); // 如果是水平滚动则捕获内部手势，用于兼容内部是ScrollView的情况
      },
      onPanResponderTerminationRequest: () => false, // 上层的responder是否能中断当前的responder
      onPanResponderMove: this._handleMove,
      onPanResponderRelease: this._handleRelease,
      // onPanResponderTerminate: this._handleRelease,
    });
  }

  componentDidMount() {
    this.preloadSibling();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.activeIndex !== this.props.activeIndex) {
      this.scrollToIndex(this.props.activeIndex, this.preloadSibling);
    }
  }

  componentWillUnmount() {
    clearTimeout(this._timerId);
    this.state.scrollX.stopAnimation();
  }

  /**
   * @param {Number} index - 滚动到哪个索引的位置
   * @param {Function} cb - 滚动完毕回调
   */
  scrollToIndex = (index, cb?) => {
    const { animationConfig } = this.props;
    const toValue = -winWidth * index;
    this.state.scrollX.stopAnimation();
    this._curDeltaX = toValue;
    Animated.timing(this.state.scrollX, {
      toValue,
      ...animationConfig,
    }).start(cb);
  };

  /**
   * @desc 预加载当前索引邻近的元素
   */
  preloadSibling = () => {
    const { preload, preloadTimeout, activeIndex, children } = this.props;
    if (!preload) {
      return;
    }
    const newCachedChildren = [...this.state.cachedChildren];
    if (newCachedChildren.every(child => React.isValidElement(child))) {
      return;
    }
    this._timerId = setTimeout(() => {
      const siblingIndexes = getSiblingIndex(activeIndex, 0, children.length - 1);
      [activeIndex, ...siblingIndexes].forEach(idx => {
        newCachedChildren[idx] = children[idx];
      });
      this.setState({ cachedChildren: newCachedChildren });
    }, preloadTimeout);
  };

  isHorizontalSwipe = gestureState => {
    return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 3);
  };

  _moveTo(dx) {
    let deltaX = this._curDeltaX + dx;
    const [leftBound, rightBound] = this._bounds;
    if (dx > 0 && deltaX >= leftBound) {
      // console.log('超出左边界');
      deltaX = leftBound + (deltaX - leftBound) * FRICTION_LEVEL;
    } else if (dx < 0 && deltaX <= rightBound) {
      // console.log('超出右边界');
      deltaX = rightBound + (deltaX - rightBound) * FRICTION_LEVEL;
    }
    this.state.scrollX.setValue(deltaX);
    return deltaX;
  }

  _handleMove = (e, gestureState) => {
    const { onMove } = this.props;
    const { dx } = gestureState;
    const deltaX = this._moveTo(dx);
    if (typeof onMove === 'function') {
      const index = getNearestIndexByDeltaX(deltaX, winWidth);
      const ratio = Math.abs(deltaX) / winWidth;
      const percent = ratio - index > 0 ? ratio - index : 1 - (index - ratio);
      onMove(gestureState, index, percent);
    }
  };

  _handleRelease = (e, gestureState) => {
    const { onRelease } = this.props;
    const { dx } = gestureState;
    const deltaX = this._moveTo(dx);
    const index = getNearestIndexByDeltaX(deltaX, winWidth);
    this.scrollToIndex(index);
    if (typeof onRelease === 'function') {
      const ratio = Math.abs(deltaX) / winWidth;
      const percent = ratio - index > 0 ? ratio - index : 1 - (index - ratio);
      onRelease(gestureState, index, percent);
    }
  };

  /**
   * @desc 在对应children未渲染完毕时渲染placeholder
   */
  _renderChildren = () => {
    const { accessibilityLabel, activeIndex, preload, children, renderPlaceholder } = this.props;
    if (!preload) {
      return children;
    }
    return this.state.cachedChildren.map((child, idx) => {
      if (React.isValidElement(child)) return children[idx];
      return (
        <TabPanel key={idx} accessibilityLabel={`${accessibilityLabel}_Placeholder_${idx}`}>
          {renderPlaceholder(activeIndex, children[idx])}
        </TabPanel>
      );
    });
  };

  render() {
    const { style, children } = this.props;
    return (
      <AnimatedView
        style={[
          style,
          {
            width: winWidth * children.length,
            flex: 1,
            transform: [
              {
                translateX: this.state.scrollX,
              },
            ],
          },
        ]}
        {...this._panResponder.panHandlers}
      >
        {this._renderChildren()}
      </AnimatedView>
    );
  }
}
