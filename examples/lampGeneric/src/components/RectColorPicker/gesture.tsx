/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Component } from 'react';
import {
  View,
  PanResponder,
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponderGestureState,
} from 'react-native';
import _ from 'lodash';
// import ReactNativeComponentTree from 'react-native/Libraries/Renderer/shims/ReactNativeComponentTree';

let eTargetId = 0;
export interface GestureProps {
  children: any;
  pointerEvents: 'box-none' | 'none' | 'box-only' | 'auto';
  disabled: boolean;
}

export default class Gesture<P, S> extends Component<GestureProps & P, any> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    children: null,
    pointerEvents: 'box-only',
    disabled: false,
  };

  constructor(props: GestureProps & P) {
    super(props);

    this.eTargetId = eTargetId++;
    this.notHandleReceivePropsWhenTouching = false;

    let fixedEvent: any = {};

    const fixEventHandle = (e: GestureResponderEvent, gesture: PanResponderGestureState): any[] => [
      {
        nativeEvent: {
          ...e.nativeEvent,
          ...fixedEvent,
        },
        originEvent: e,
      },
      {
        ...gesture,
        locationX: fixedEvent.locationX + gesture.dx,
        locationY: fixedEvent.locationY + gesture.dy,
        pageX: fixedEvent.pageX + gesture.dx,
        pageY: fixedEvent.pageY + gesture.dy,
      },
    ];

    const responder = PanResponder.create({
      onStartShouldSetPanResponder: (
        e: GestureResponderEvent,
        gesture: PanResponderGestureState
      ) => {
        if (this.props.disabled) return false;
        return this.onStartShouldSetResponder.call(this, e, gesture);
      },
      onMoveShouldSetPanResponder: (
        e: GestureResponderEvent,
        gesture: PanResponderGestureState
      ) => {
        if (this.props.disabled) return false;
        return this.onMoveShouldSetResponder.call(this, e, gesture);
      },
      onPanResponderGrant: (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
        // clearTimeout(this.timerId);
        const { nativeEvent } = e;
        const { locationX, locationY, pageX, pageY } = nativeEvent;

        fixedEvent = { locationX, locationY, pageX, pageY };
        const event = fixEventHandle(e, gesture);
        this.onGrant.call(this, ...event);
      },
      onPanResponderMove: (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
        const event = fixEventHandle(e, gesture);
        if (this._initialMoveDirection === undefined) {
          const [_e, _gesture] = event;
          if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) return;
          const horizontal = Math.abs(gesture.dx) >= Math.abs(gesture.dy);
          const toRight = horizontal && _e.nativeEvent.locationX < _gesture.locationX;
          const toLeft = horizontal && !toRight;
          const toBottom = !horizontal && _e.nativeEvent.locationY < _gesture.locationY;
          const toTop = !horizontal && !toBottom;

          this._initialMoveDirection = {
            horizontal,
            toTop,
            toRight,
            toBottom,
            toLeft,
          };
        } else {
          this.notHandleReceivePropsWhenTouching = true;
          this.onMove.call(this, ...event);
        }
      },

      onPanResponderRelease: (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
        this.notHandleReceivePropsWhenTouching = false;
        const event = fixEventHandle(e, gesture);
        this.onRelease.call(this, ...event);
        // this.timerId = setTimeout(() => {
        //   this.notHandleReceivePropsWhenTouching = false;
        // }, 300);
        this._initialMoveDirection = undefined;
      },

      onPanResponderTerminationRequest: () => false,

      onPanResponderTerminate: (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
        this.notHandleReceivePropsWhenTouching = false;
        const event = fixEventHandle(e, gesture);
        this.onRelease.call(this, ...event);
        // this.timerId = setTimeout(() => {
        //   this.notHandleReceivePropsWhenTouching = false;
        // }, 300);
        this._initialMoveDirection = undefined;
      },

      // onStartShouldSetResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: () => false,
    });

    this.getResponder = () => ({
      ...responder.panHandlers,
      onLayout: this.onLayout,
      pointerEvents: this.props.pointerEvents,
    });

    this.onLayout = this.onLayout.bind(this);
    this.getLayout = this.getLayout.bind(this);
    // this.getETargetElement = this.getETargetElement.bind(this);
    this.getETargetId = this.getETargetId.bind(this);
    this.getInitialMoveDirection = this.getInitialMoveDirection.bind(this);
    this.getTouchDirection = this.getTouchDirection.bind(this);
    // this.checkETargetIsExpected = this.checkETargetIsExpected.bind(this);
  }

  // eslint-disable-next-line react/sort-comp
  onLayout({ nativeEvent }: LayoutChangeEvent) {
    if (this._layout !== undefined) return;
    this._layout = { ...nativeEvent.layout };
    this.forceUpdate();
  }

  onStartShouldSetResponder() {
    return true;
  }

  onMoveShouldSetResponder() {
    return true;
  }

  onMove(e: GestureResponderEvent, gesture: PanResponderGestureState) {}

  onGrant(e: GestureResponderEvent, gesture: PanResponderGestureState) {}

  onRelease(e: GestureResponderEvent, gesture: PanResponderGestureState) {}

  // getETargetInstance(e) {
  //   return ReactNativeComponentTree.getInstanceFromNode(e.target);
  // }

  // getETargetElement(e) {
  //   const inst = this.getETargetInstance(e);
  //   return inst._currentElement;
  // }

  getETargetId() {
    return this.eTargetId;
  }

  getInitialMoveDirection() {
    return this._initialMoveDirection;
  }

  getTouchDirection(x: number, y: number) {
    const rect: any = this.getLayout();

    if (!rect) return;

    /* 以节点的左上角建立坐标系 */
    // 表示左上角和右下角及中心点坐标

    // 求各个点坐标 注意y坐标应该转换为负值，因为节点的左上角为(0,0)，整个可视区域属于第四象限
    // 表示鼠标当前位置的点坐标
    const _y = -y;
    const x1 = rect.x;
    const y1 = -rect.y;

    const x4 = rect.x + rect.width;
    const y4 = -(rect.y + rect.height);

    const x0 = rect.x + rect.width / 2;
    const y0 = -(rect.y + rect.height / 2);

    // 矩形不够大，不考虑
    if (Math.abs(x1 - x4) < 0.0001) return 4;

    // 表示左上角和右下角的对角线斜率
    // 计算对角线斜率
    const k = (y1 - y4) / (x1 - x4);

    const range = [k, -k];

    // 表示鼠标当前位置的点与元素中心点连线的斜率
    const kk = (_y - y0) / (x - x0);

    // 如果斜率在range范围内，则鼠标是从左右方向移入移出的
    if (Number.isFinite(kk) && range[0] < kk && kk < range[1]) {
      // 根据x与x0判断左右
      return x > x0 ? 1 : 3;
    }

    // 根据y与y0判断上下
    return _y > y0 ? 0 : 2;
  }

  getLayout() {
    return this._layout;
  }

  // checkETargetIsExpected(e) {
  //   const element = this.getETargetElement(e);
  //   return this.eTargetId === element.props.eTargetId;
  // }

  getResponder: any;

  eTargetId: number;

  notHandleReceivePropsWhenTouching: boolean;

  _initialMoveDirection: any;

  _layout: { x: number; y: number; width: number; height: number } | undefined;

  render() {
    const { children, ...props } = this.props;
    const responder = this.getResponder();

    const newProps: any = _.cloneDeep(props);
    delete newProps.pointerEvents;

    return (
      <View {...newProps} {...responder}>
        {children}
      </View>
    );
  }
}
