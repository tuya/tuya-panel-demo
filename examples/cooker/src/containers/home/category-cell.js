/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line max-len
import { View, StyleSheet, Image, TouchableWithoutFeedback, Animated, Easing } from 'react-native';
import { TYText, Utils } from 'tuya-panel-kit';

const { convertX: cx } = Utils.RatioUtils;
const CATEGORY_WIDTH = cx(327);
const CATEGORY_HEIGHT = cx(80);

export default class RecipeCell extends Component {
  static propTypes = {
    index: PropTypes.number,
    category: PropTypes.string,
    onPress: PropTypes.func,
    pic: PropTypes.oneOfType(PropTypes.string, PropTypes.number),
  };

  static defaultProps = {
    index: 0,
    category: '',
    onPress: null,
    pic: undefined,
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
      easing: Easing.linear,
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
    const { category, onPress, pic } = this.props;

    return (
      <TouchableWithoutFeedback
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
              ],
            },
          ]}
        >
          <Image source={typeof pic === 'string' ? { uri: pic } : pic} style={styles.bgImage} />
          <View style={styles.modal} />
          <TYText style={styles.text}>{category}</TYText>
        </Animated.View>
      </TouchableWithoutFeedback>
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
