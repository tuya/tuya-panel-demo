import React, { FC, useState, useEffect, useRef, useMemo } from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
  Animated,
  Easing,
  StyleProp,
  TextStyle,
  ViewStyle,
  PanResponderInstance,
} from 'react-native';
import { SwipeoutAction } from 'tuya-panel-kit';
import NativeButton from './nativeButton';

interface ISwipeoutButtonProps {
  type: string;
  height: number;
  width: number;
  text: string;
  content?: string;
  disabled?: boolean;
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  accessibilityLabel?: string;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
}

const SwipeoutButton: FC<ISwipeoutButtonProps> = ({
  type,
  height,
  width,
  text,
  textStyle,
  onPress,
  disabled,
  content,
  backgroundColor,
  color,
  fontSize,
  accessibilityLabel,
}) => {
  const swipeoutBtnStyle: StyleProp<ViewStyle> = [styles.swipeoutBtn];
  // type
  if (type === 'delete') {
    swipeoutBtnStyle.push(styles.colorDelete);
  }
  if (type === 'primary') {
    swipeoutBtnStyle.push(styles.colorPrimary);
  }
  if (type === 'secondary') {
    swipeoutBtnStyle.push(styles.colorSecondary);
  }
  // background
  if (backgroundColor) {
    swipeoutBtnStyle.push([{ backgroundColor }]);
  }
  // height|width
  swipeoutBtnStyle.push([
    {
      height,
      width,
    },
  ]);

  const swipeoutBtnContentStyle = {
    height,
    width,
  };

  // textColor
  const swipeoutBtnTextStyle = [textStyle, styles.swipeoutBtnText];
  if (color) {
    swipeoutBtnTextStyle.push([{ color }]);
  }
  if (fontSize) {
    swipeoutBtnTextStyle.push([{ fontSize }]);
  }
  return (
    <NativeButton
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled || false}
      style={[styles.swipeoutBtnWrapperStyle, swipeoutBtnStyle]}
      textStyle={swipeoutBtnTextStyle}
    >
      {content ? <View style={swipeoutBtnContentStyle}>{content}</View> : text}
    </NativeButton>
  );
};

SwipeoutButton.defaultProps = {
  content: '',
  backgroundColor: '#fff',
  color: '#fff',
  fontSize: 12,
  disabled: false,
  textStyle: {},
  accessibilityLabel: '',
  onPress: () => ({}),
};

interface ISwipeoutProps {
  accessibilityLabel?: string;
  disabled?: boolean;
  left?: SwipeoutAction[];
  right?: SwipeoutAction[];
  buttonWidth: number;
  sensitivity?: number;
  autoClose?: boolean;
  scroll?: (isScroll: boolean) => void;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  close?: boolean;
  rowID?: number | string;
  sectionID?: number | string;
  onOpen?: (sectionID?: number | string, rowID?: number | string) => void;
  onClose?: (
    sectionID?: number | string,
    rowID?: number | string,
    direction?: 'left' | 'right'
  ) => void;
}

const Swipeout: FC<ISwipeoutProps> = ({
  sensitivity = 80,
  children,
  disabled,
  rowID,
  sectionID,
  buttonWidth,
  left,
  right,
  scroll,
  style,
  close,
  backgroundColor,
  accessibilityLabel,
  onOpen: propsOnOpen,
  onClose: propsOnClose,
  autoClose: propsAutoClose,
}) => {
  const swipeoutContent = useRef({} as any);
  const contentDot = useRef(new Animated.Value(0)).current;
  const swiping = useRef(false);
  const openedRight = useRef(false);
  const openedLeft = useRef(false);
  const contentDotNumRef = useRef(0);
  const btnWidth = useRef(0);
  const leftWidth = useRef(0);
  const rightWidth = useRef(0);
  const contentWidthRef = useRef(0);
  const currentCloseState = useRef(close);

  const [contentDotNum, setContentDotNum] = useState(0);
  const [isRightVisible, setIsRightVisible] = useState(false);
  const [isLeftVisible, setIsLeftVisible] = useState(false);
  const [stateBtnWidth, setStateBtnWidth] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  const styleSwipeout = useMemo(() => {
    const list = [styles.swipeout, style];
    if (backgroundColor) {
      list.push([{ backgroundColor }]);
    }
    return list;
  }, [style, backgroundColor]);

  const styleLeft = useMemo(() => {
    return [
      styles.swipeoutBtns,
      {
        left: 0,
        overflow: 'hidden',
        width: contentDotNum,
      },
    ];
  }, [contentDotNum]);

  const styleRight = useMemo(() => {
    return [
      styles.swipeoutBtns,
      {
        right: 0,
        left: Math.abs(contentWidth + contentDotNum),
      },
    ];
  }, [contentWidth, contentDotNum]);

  const styleContent = useMemo(() => {
    return [
      styles.swipeoutContent,
      {
        left: contentDot,
      },
    ];
  }, [contentDot]);

  useEffect(() => {
    if (currentCloseState.current && !close) {
      const cb = (_leftW, rightW) => onShow(-rightW, 'right', 160);
      swipeoutContent.current.measure((x, y, width) => grantMeasureCallback(x, y, width, cb));
    }
    currentCloseState.current = close;
  }, [close]);

  const grantMeasureCallback = (_x, _y, width, cb?) => {
    const newBtnWidth = buttonWidth || width / 5;
    btnWidth.current = newBtnWidth;
    setStateBtnWidth(newBtnWidth);
    leftWidth.current = left ? left.length * btnWidth.current : 0;
    rightWidth.current = right ? right.length * btnWidth.current : 0;
    swiping.current = true;
    if (cb && typeof cb === 'function') cb(leftWidth.current, rightWidth.current, btnWidth.current);
  };

  const handlePanResponderGrant = () => {
    if (disabled) return;
    if (!openedLeft.current && !openedRight.current) {
      onOpen();
    } else {
      onClose();
    }
    swipeoutContent.current.measure(grantMeasureCallback);
  };

  const handlePanResponderMove = (_e, gestureState) => {
    if (disabled) {
      return;
    }
    let { dx } = gestureState;
    const { dy } = gestureState;
    if (dx === 0) return;
    if (openedRight.current) {
      dx -= rightWidth.current;
    } else if (openedLeft.current) {
      dx += leftWidth.current;
    }
    const moveHorizontal = Math.abs(dx) > Math.abs(dy);
    if (scroll) {
      if (moveHorizontal) {
        scroll(false);
      } else {
        scroll(true);
      }
    }
    if (!swiping.current) {
      return;
    }
    if (dx < 0 && right) {
      contentDot.setValue(dx);
    } else if (dx > 0 && left) {
      contentDot.setValue(dx);
    }
  };

  const handlePanResponderEnd = (_e, gestureState) => {
    if (disabled) return;
    const { dx } = gestureState;
    const openX = contentWidthRef.current * 0.33;
    let openLeft = dx > openX || dx > leftWidth.current / 2;
    let openRight = dx < -openX || dx < -rightWidth.current / 2;
    if (openedRight.current) {
      openRight = dx - openX < -openX;
    }
    if (openedLeft.current) {
      openLeft = dx + openX > openX;
    }
    if (swiping.current) {
      if (openRight && contentDotNumRef.current < 0 && dx < 0) {
        onShow(-rightWidth.current, 'right', dx > openX ? 350 : 160);
      } else if (openLeft && contentDotNumRef.current > 0 && dx > 0) {
        onShow(leftWidth.current, 'left', 160);
      } else {
        onHide();
      }
    }
  };

  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => openedLeft.current || openedRight.current,
      onMoveShouldSetPanResponderCapture: (_event, gestureState) =>
        Math.abs(gestureState.dx) > sensitivity && Math.abs(gestureState.dy) <= sensitivity,
      onPanResponderGrant: handlePanResponderGrant,
      onPanResponderMove: handlePanResponderMove,
      onPanResponderRelease: handlePanResponderEnd,
      onPanResponderTerminate: handlePanResponderEnd,
      onShouldBlockNativeResponder: () => false,
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  useEffect(() => {
    contentDot.addListener(obj => {
      contentDotNumRef.current = obj.value;
      setContentDotNum(obj.value);
      setIsRightVisible(obj.value < 0);
      setIsLeftVisible(obj.value > 0);
    });
  }, []);

  const onLayout = event => {
    const { width, height } = event.nativeEvent.layout;
    contentWidthRef.current = width;
    setContentWidth(width);
    setContentHeight(height);
  };

  const onOpen = () => {
    if (propsOnOpen && typeof propsOnOpen === 'function') propsOnOpen(sectionID, rowID);
  };

  const onClose = () => {
    if (propsOnClose && typeof propsOnClose === 'function') propsOnClose(sectionID, rowID);
  };

  const onShow = (paramsContentDot, direction, duration) => {
    const isLeft = direction === 'left';
    onOpen();
    Animated.timing(contentDot, {
      duration,
      easing: Easing.linear,
      delay: 0,
      toValue: paramsContentDot,
    }).start(() => {
      openedLeft.current = isLeft;
      openedRight.current = !isLeft;
      swiping.current = false;
    });
  };

  const onHide = () => {
    if (propsOnClose && (openedLeft.current || openedRight.current)) {
      const direction = openedRight.current ? 'right' : 'left';
      propsOnClose(sectionID, rowID, direction);
    }
    Animated.timing(contentDot, {
      duration: 160,
      easing: Easing.linear,
      delay: 0,
      toValue: 0,
    }).start(() => {
      openedLeft.current = false;
      openedRight.current = false;
      swiping.current = false;
    });
  };

  const autoClose = btn => {
    const { onPress } = btn;
    if (propsAutoClose) onHide();
    if (onPress && typeof onPress === 'function') {
      onPress();
    }
  };

  const renderButtons = (btnsArray, visible, animateStyle) => {
    if (btnsArray && visible) {
      return (
        <Animated.View style={animateStyle}>
          {btnsArray.map((btn, index) => (
            <SwipeoutButton
              backgroundColor={btn.backgroundColor}
              color={btn.color}
              disabled={btn.disabled}
              key={btn.key || index}
              accessibilityLabel={`${accessibilityLabel}_${btn.key || index}`}
              onPress={() => autoClose(btn)}
              text={btn.text}
              content={btn.content}
              type={btn.type}
              width={stateBtnWidth}
              height={contentHeight}
              fontSize={btn.fontSize}
              textStyle={btn.textStyle}
            />
          ))}
        </Animated.View>
      );
    }
  };

  return (
    <View style={styleSwipeout}>
      <Animated.View style={styleContent}>
        <View
          ref={ref => {
            swipeoutContent.current = ref;
          }}
          accessibilityLabel={accessibilityLabel}
          onLayout={onLayout}
          {...panResponder.panHandlers}
        >
          {children}
        </View>
      </Animated.View>
      {renderButtons(left, isLeftVisible, styleLeft)}
      {renderButtons(right, isRightVisible, styleRight)}
    </View>
  );
};

Swipeout.defaultProps = {
  accessibilityLabel: 'Swipeout',
  left: [],
  right: [],
  autoClose: false,
  disabled: false,
  backgroundColor: '',
  close: false,
  style: {},
  rowID: -1,
  sectionID: -1,
  sensitivity: 80,
  onOpen: () => ({}),
  onClose: () => ({}),
  scroll: () => ({}),
};

const styles = StyleSheet.create({
  swipeout: {
    backgroundColor: '#dbddde',
    overflow: 'hidden',
  },
  swipeoutBtnWrapperStyle: {
    flex: 1,
  },
  swipeoutBtn: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  swipeoutBtnText: {
    color: '#fff',
    textAlign: 'center',
  },
  swipeoutBtns: {
    bottom: 0,
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  swipeoutContent: {},
  colorDelete: {
    backgroundColor: '#fb3d38',
  },
  colorPrimary: {
    backgroundColor: '#006fff',
  },
  colorSecondary: {
    backgroundColor: '#fd9427',
  },
});

export default Swipeout;
