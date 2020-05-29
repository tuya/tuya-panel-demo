import React from 'react';
import { TouchableWithoutFeedback, Animated } from 'react-native';

const AnimateTouchable = Animated.createAnimatedComponent(TouchableWithoutFeedback);

export default class AnimateButton extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      animateValue: new Animated.Value(0),
    };
  }

  componentDidMount() {
    Animated.spring(this.state.animateValue, {
      toValue: 1,
      duration: 400,
      damping: 10,
      stiffness: 100,
    }).start();
  }

  render() {
    return (
      <AnimateTouchable {...this.props}>
        <Animated.View
          style={[
            this.props.style,
            {
              transform: [
                {
                  translateY: this.state.animateValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [700, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {this.props.children}
        </Animated.View>
      </AnimateTouchable>
    );
  }
}
