import React, { useImperativeHandle, useState, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface ArrowWaveProps {
  arrowNum?: number;
  arrowStyle?: ViewStyle;
  arrowColor?: string;
  reverse?: boolean;
  containerStyle?: ViewStyle;
}

const ArrowWave = React.forwardRef<any, ArrowWaveProps>(
  ({ arrowNum = 3, arrowStyle = {}, arrowColor = '#ddd', reverse, containerStyle }, forwardRef) => {
    const [visible, setVisible] = useState<boolean>(true);
    const animator = useArrowsAnimator(arrowNum, arrowStyle);
    const styleArray = reverse ? animator.styleArray.reverse() : animator.styleArray;

    useImperativeHandle(
      forwardRef,
      () => ({
        stop: () => {
          animator.stopAnimation();
        },
        start: () => {
          animator.beginAnimation();
        },
        hide: () => {
          setVisible(false);
        },
        show: () => {
          setVisible(true);
          animator.beginAnimation();
        },
      }),
      []
    );

    if (!visible) return null;

    return (
      <View style={[styles.container, containerStyle]}>
        {styleArray.map((item, index) => {
          return (
            <Animated.View
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              style={[
                styles.arrow,
                { borderBottomColor: arrowColor, borderLeftColor: arrowColor, ...item },
              ]}
            />
          );
        })}
      </View>
    );
  }
);

ArrowWave.displayName = 'ArrowWave';
ArrowWave.defaultProps = {
  arrowNum: 3,
  arrowStyle: {},
  arrowColor: '#ddd',
  reverse: false,
  containerStyle: {},
};

const styles = StyleSheet.create({
  arrow: {
    borderBottomColor: '#ddd',
    borderBottomWidth: 2,
    borderLeftColor: '#ddd',
    borderLeftWidth: 2,
    height: 10,
    width: 10,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 16,
    justifyContent: 'space-around',
    overflow: 'hidden',
    width: 35,
  },
});

export default ArrowWave;

interface useArrowsStyleReturn {
  styleArray: ViewStyle[];
  beginAnimation: () => void;
  stopAnimation: () => void;
}

const useArrowsAnimator = (count: number, wrapperStyle: ViewStyle): useArrowsStyleReturn => {
  const arr = Array.from({ length: count });
  const waveAnimateRef = useRef<Animated.Value[]>(arr.map(() => new Animated.Value(0)));
  const initial = () => {
    waveAnimateRef.current.forEach(item => item.setValue(0.3));
  };
  const beginAnimation = () => {
    initial();
    const animations = arr.map((_, index) =>
      Animated.timing(waveAnimateRef.current[index], {
        duration: 600,
        toValue: 1,
      })
    );

    Animated.stagger(500, animations).start(({ finished }) => {
      finished && beginAnimation();
    });
  };
  const stopAnimation = () => {
    waveAnimateRef.current.forEach(item => {
      item.stopAnimation();
    });
  };

  useEffect(() => {
    beginAnimation();

    return () => {
      stopAnimation();
    };
  }, []);

  return {
    styleArray: waveAnimateRef.current.map(item => {
      return {
        ...wrapperStyle,
        opacity: item as unknown as number,
      };
    }),
    beginAnimation,
    stopAnimation,
  };
};
