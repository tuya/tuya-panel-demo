import React, { Children, cloneElement } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  PanResponderInstance,
  LayoutChangeEvent,
  Animated,
  GestureResponderEvent,
  PanResponderGestureState,
  NativeComponent,
  Easing,
  ViewStyle,
} from 'react-native';
import _ from 'lodash';
import Dots from './Dots';

const defaultProps = {
  width: 0,
  height: 0,
  space: 0,
  selectIndex: 0,
  swipeEnabled: false,
  autoPlay: false,
  autoplayInterval: 3000,
  loop: false,
  showDots: true,
  effect: 'scrollx',
  direction: 'left',
  accessibilityLabel: 'Carousel',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onGrant() {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onMove() {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onRelease() {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange(index: number) {},
};

type IProps = {
  style?: ViewStyle;
  dotStyle?: ViewStyle;
  dotActiveStyle?: ViewStyle;
  dotWrapperStyle?: ViewStyle;
} & Readonly<typeof defaultProps>;

interface IState {
  selectIndex: number;
  total: number;
}

const validSwipeDistance = 15;
const duration = 300;

export default class Carousel extends React.Component<IProps, IState> {
  static Dots = Dots;

  // eslint-disable-next-line react/static-property-placement
  static defaultProps: IProps = defaultProps;

  _panResponder: PanResponderInstance;

  percentRef: NativeComponent;

  locked = false;

  animation: Animated.CompositeAnimation;

  timer: number;

  animateValue: Animated.Value = new Animated.Value(0);

  viewWidth = 0;

  viewHeight = 0;

  pageWidth = 0;

  showPanel = false;

  scrollOffset = 0;

  movePrevValue = 0;

  terminationRequest = true; // 是否可以抢权

  isMove = false; // 是否在移动

  constructor(props: IProps) {
    super(props);

    this._panResponder = PanResponder.create({
      // 要求成为响应者：
      onMoveShouldSetPanResponder: this.handleSetPanResponder,
      onPanResponderMove: this.handleMove,
      onPanResponderRelease: this.handleRelease,
      onPanResponderTerminationRequest: () => {
        // 是否允许抢权
        return this.terminationRequest;
      },
      // 当前有其他的东西成为响应器并且没有释放它。
      onPanResponderReject: this.handleTerminate,
      onPanResponderTerminate: this.handleTerminate,
    });
    const { selectIndex, width, height, children, loop, space } = this.props;
    const total = Children.toArray(children).length; // 使用toArray 将无效子节点去除
    const currentIndex = this.getRealIndex(selectIndex, total, total, loop);
    this.state = {
      selectIndex: currentIndex,
      total,
    };
    // 有设置高宽
    if (width && height) {
      this.viewHeight = height;
      this.viewWidth = width;
      this.pageWidth = width + space;
      this.animateValue.setValue(currentIndex * -this.pageWidth);
      this.showPanel = true;
    }

    // 记录下当前位置
    this.animateValue.addListener(({ value }) => (this.scrollOffset = value));
  }

  componentDidMount() {
    const { autoPlay } = this.props;
    autoPlay && this.autoPlay();
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    if (!this.locked) {
      // eslint-disable-next-line
      // @ts-ignore
      const { selectIndex, children, loop, width, height, space } = nextProps;
      const {
        selectIndex: oldSelectIndex,
        // eslint-disable-next-line
        // @ts-ignore
        children: oldChildren,
        loop: oldLoop,
        width: oldWidth,
        height: oldHeight,
        space: oldSpace,
      } = nextProps;
      const total = Children.toArray(children).length; // 使用toArray 将无效子节点去除
      if (
        selectIndex !== oldSelectIndex ||
        total !== Children.toArray(oldChildren).length ||
        loop !== oldLoop ||
        width !== oldWidth ||
        height !== oldHeight ||
        space !== oldSpace
      ) {
        // 有设置高宽
        if (width && height) {
          this.viewHeight = height;
          this.viewWidth = width;
          this.pageWidth = width + space;
          this.showPanel = true;
        }
        const { selectIndex: currentIndex, total: currentTotal } = this.state;
        let nextIndex = currentIndex;
        if (
          total !== currentTotal ||
          (selectIndex !== oldSelectIndex && selectIndex !== currentIndex)
        ) {
          nextIndex = this.getRealIndex(selectIndex, currentIndex, total, loop);
        }

        if (total !== currentTotal) {
          this.setState(
            {
              total,
            },
            () => {
              if (nextIndex !== currentIndex) {
                this.scrollTo(nextIndex, true);
              }
            }
          );
        } else {
          this.scrollTo(nextIndex, true);
        }
      }
    }
  }

  shouldComponentUpdate() {
    return !this.locked;
  }

  componentWillUnmount() {
    this.stopAnimation();
    clearInterval(this.timer);
  }

  getRealIndex(index: number, current: number, total: number, loop: boolean) {
    let currentIndex = index;
    if (total <= 1) {
      currentIndex = 0;
    } else if (loop) {
      // 取得与当前最近的那个点
      if (Math.abs(current - index) > Math.abs(current - total - index)) {
        currentIndex += total;
      }
    }
    return currentIndex;
  }

  autoPlay() {
    const { autoplayInterval } = this.props;
    this.timer = setInterval(this.handleAutoPlay, autoplayInterval);
  }

  handleAutoPlay = () => {
    const { selectIndex } = this.state;
    const { direction } = this.props;
    const nextIndex: number = selectIndex + (direction === 'left' ? 1 : -1);
    this.scrollTo(nextIndex);
  };

  handleSetPanResponder = (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
    const { swipeEnabled } = this.props;
    const { total } = this.state;
    if (total < 2 || !swipeEnabled) {
      return false;
    }

    // 滑动一定象素后，将不允许其他手势抢权
    if (Math.abs(gesture.dx) < validSwipeDistance) {
      // 小于一定象素不做滑动
      if (this.terminationRequest) {
        return false;
      }
    }
    this.terminationRequest = false;
    return true;
  };

  handleTerminate = () => {
    // 响应器已经从该视图抽离
    this.terminationRequest = true;
    this.locked = false;
  };

  handleMove = (e: GestureResponderEvent) => {
    const { onGrant, onMove } = this.props;
    if (!this.locked) {
      // 开始移动
      this.movePrevValue = e.nativeEvent.pageX;
      this.locked = true;
      this.isMove = true;
      onGrant();
      this.stopAnimation();
      clearInterval(this.timer);
    }
    this.handleUpdateMove(e);
    onMove();
  };

  handleRelease = (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
    this.locked = false;
    const { vx, dx } = gesture;
    this.handleUpdateMove(e);
    const { loop } = this.props;
    const { total, selectIndex } = this.state;
    // 是否要滑到新的块
    let willIndex = selectIndex;
    if (Math.abs(vx) > 0) {
      willIndex = selectIndex + (vx < 0 ? 1 : -1);
    } else if (Math.abs(dx) >= this.viewWidth / 3) {
      // willIndex = Math.round(Math.abs(currentValue) / this.viewWidth);
      willIndex = selectIndex + (dx < 0 ? 1 : -1);
    }
    if (!loop) {
      if (willIndex < 0) {
        willIndex = 0;
      } else if (willIndex >= total) {
        willIndex = total - 1;
      }
    }

    this.terminationRequest = true;

    const { onRelease, autoPlay } = this.props;
    this.scrollTo(willIndex);
    onRelease();

    // 重新开启滚动
    autoPlay && this.autoPlay();
  };

  handleUpdateMove(e: GestureResponderEvent) {
    const currentX = e.nativeEvent.pageX;
    const dx = currentX - this.movePrevValue;
    this.movePrevValue = currentX;
    const { total } = this.state;
    let newX: number = this.scrollOffset + dx;
    const { loop } = this.props;
    if (!loop) {
      if (newX > 0) {
        newX = 0;
      } else if (newX < -this.pageWidth * (total - 1)) {
        newX = -this.pageWidth * (total - 1);
      }
    }
    this.animateValue.setValue(newX);
    return newX;
  }

  handleLayout = (e: LayoutChangeEvent) => {
    const { space } = this.props;
    const { selectIndex } = this.state;
    const { width, height } = e.nativeEvent.layout;
    this.viewWidth = width;
    this.viewHeight = height;
    this.pageWidth = width + space;
    this.showPanel = true;

    if (!this.isMove) {
      this.animateValue.setValue(selectIndex * -this.pageWidth);
      this.forceUpdate();
    }
  };

  getContainerStyle() {
    const { style, width, height } = this.props;
    const containerStyle: any = {};
    if (width > 0 || height > 0) {
      if (width > 0) {
        containerStyle.width = width;
      } else {
        containerStyle.width = '100%';
      }
      if (height > 0) {
        containerStyle.height = height;
      } else {
        containerStyle.height = '100%';
      }
    } else {
      containerStyle.flex = 1;
    }
    return [styles.container, containerStyle, style];
  }

  stopAnimation() {
    this.animateValue.stopAnimation();
  }

  /**
   *
   * @param index 移动到第几个
   * @param isOutControl 是否非组件内部发起的滑动
   */
  scrollTo(index: number, isOutControl = false) {
    const { loop, onChange } = this.props;
    const { total, selectIndex } = this.state;
    let willIndex = index;
    if (!loop) {
      // 边界判断处理
      if (willIndex < 0) {
        willIndex = 0;
      } else if (willIndex >= total) {
        willIndex = total - 1;
      }
    }
    // 如果组件初始渲染未完成，则不做处理
    if (this.pageWidth) {
      this.isMove = true;
      this.stopAnimation();
      Animated.timing(this.animateValue, {
        toValue: -willIndex * this.pageWidth,
        duration,
        easing: Easing.out(Easing.cubic),
      }).start(({ finished }) => {
        if (!finished) {
          return;
        }
        this.isMove = false;
        if (loop) {
          if (willIndex === 0) {
            willIndex = total;
            this.animateValue.setValue(willIndex * -this.pageWidth);
          } else if (willIndex === total * 2 - 1) {
            willIndex = total - 1;
            this.animateValue.setValue(willIndex * -this.pageWidth);
          }
        }
        if (!isOutControl && selectIndex % total !== willIndex % total) {
          onChange(willIndex % total);
        }
        this.setState({ selectIndex: willIndex });
      });
    } else {
      if (loop) {
        if (willIndex === 0) {
          willIndex = total;
        } else if (willIndex === total * 2 - 1) {
          willIndex = total - 1;
        }
      }
      this.setState({ selectIndex: willIndex });
    }
  }

  renderDots() {
    const { showDots, dotStyle, dotWrapperStyle, dotActiveStyle } = this.props;
    const { total, selectIndex } = this.state;
    if (!showDots || total <= 1) {
      return null;
    }
    return (
      <Dots
        total={total}
        current={selectIndex}
        style={dotWrapperStyle}
        dotActiveStyle={dotActiveStyle}
        dotStyle={dotStyle}
      />
    );
  }

  renderPages() {
    const { children, loop, space } = this.props;
    const { viewWidth } = this;
    let panels = Children.toArray(children);
    if (loop) {
      panels = panels.concat(panels.map((x: any) => cloneElement(x)));
    }

    return panels.map((child, index) => (
      <View
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        style={{
          width: viewWidth,
          marginRight: space,
          // height: viewHeight,
          height: '100%',
        }}
      >
        {child}
      </View>
    ));
  }

  render() {
    const { accessibilityLabel } = this.props;
    return (
      <View
        style={this.getContainerStyle()}
        accessibilityLabel={accessibilityLabel || 'Carousel'}
        onLayout={this.handleLayout}
        {...this._panResponder.panHandlers}
      >
        <Animated.View
          removeClippedSubviews={false}
          style={{
            flexDirection: 'row',
            flex: 1,
            alignSelf: 'flex-start', // 使用alignself 确保子内容撑开父容器，避免android下自动overflow: hiddern问题
            transform: [{ translateX: this.animateValue }],
          }}
        >
          {this.showPanel && this.renderPages()}
        </Animated.View>
        {this.renderDots()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    opacity: 1, // 确保安卓下 overflow: 'hidden'
  },
});
