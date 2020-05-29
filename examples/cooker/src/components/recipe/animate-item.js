/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { TYText, Utils } from 'tuya-panel-kit';

const { convertX: cx } = Utils.RatioUtils;
const CATEGORY_WIDTH = cx(327);
const CATEGORY_HEIGHT = cx(80);
const Res = {
  bg: require('../../res/category_bg.png'),
};

export default class AnimatedItem extends Component {
  static propTypes = {
    index: PropTypes.number,
    category: PropTypes.string,
    onPress: PropTypes.func,
  };

  static defaultProps = {
    index: 0,
    category: '',
    onPress: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      animatePress: new Animated.Value(1),
      animateItem: new Animated.Value(0),
    };
  }

  componentDidMount() {
    const { index } = this.props;
    const delay = index * 200;
    Animated.timing(this.state.animateItem, {
      toValue: 1,
      duration: 500,
      delay,
      useNativeDriver: true,
    }).start();
  }

  animateIn() {
    Animated.timing(this.state.animatePress, {
      toValue: 0.9,
      duration: 200,
    }).start();
  }

  animateOut() {
    Animated.timing(this.state.animatePress, {
      toValue: 1,
      duration: 200,
    }).start();
  }

  render() {
    const { category, onPress } = this.props;

    return (
      <TouchableOpacity
        onPressIn={() => this.animateIn()}
        onPressOut={() => this.animateOut()}
        onPress={onPress}
      >
        <Animated.View
          style={[
            styles.categoryContainer,
            {
              transform: [
                {
                  scale: this.state.animatePress,
                },
                {
                  translateY: this.state.animateItem.interpolate({
                    inputRange: [0, 1],
                    outputRange: [700, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Image source={Res.bg} style={styles.bgImage} />
          <View style={styles.modal} />
          <TYText style={styles.text}>{category}</TYText>
        </Animated.View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  categoryContainer: {
    width: CATEGORY_WIDTH,
    height: CATEGORY_HEIGHT,
    borderRadius: cx(16),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: cx(8),
  },

  modal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,.1)',
  },

  bgImage: {
    width: CATEGORY_WIDTH,
    height: CATEGORY_HEIGHT,
    position: 'absolute',
  },

  text: {
    backgroundColor: 'transparent',
    fontSize: cx(20),
    color: '#fff',
    fontWeight: '500',
  },
});
