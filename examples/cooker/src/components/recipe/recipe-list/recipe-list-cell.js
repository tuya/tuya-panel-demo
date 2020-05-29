/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable max-len */
import React from 'react';
/* eslint-disable */
import PropTypes from 'prop-types';
import { TouchableOpacity, Text, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';
import { Utils as outerUtils } from 'tuya-panel-kit';
import TYSdk from '../api';
import { jumpToSense } from '../utils';
import { mainStyles, Res as OutRes } from '../assist/recipe-detail';

const { RatioUtils } = outerUtils;
const { convertX: cx } = RatioUtils;
const { width } = Dimensions.get('window');
const Res = {
  start: require('../res/icon-yun.png'),
};

class Cell extends React.PureComponent {
  static PropTypes = {
    onTabClick: PropTypes.func,
    scrollValue: PropTypes.number,
    navigator: PropTypes.any,
    index: PropTypes.number,
  };

  static defaultProps = {
    tabBarBackgroundColor: '#fff',
    page: 5,
    navigator: TYSdk.Navigator,
    index: 0,
  };

  constructor(props) {
    super(props);

    this.state = {
      animatePress: new Animated.Value(1),
      animateTrans: new Animated.Value(0),
      animateItem: new Animated.Value(0),
    };
  }

  componentWillMount() {
    this.layoutAnimateIn();
  }

  onPressItem = data => {
    if (data['hard_level']) {
      jumpToSense({
        id: 'recipeDetail',
        searchId: data.id,
        index: data.index,
        recipeData: data,
        recipeTitle: data.recipeTitle,
        sceneConfigs: {
          ...Navigator.SceneConfigs.FloatFromBottom,
          gestures: null, // 阻止ios左滑
        },
      });
    } else {
      jumpToSense({
        id: 'recipeDetail',
        searchId: data.id,
        index: data.index,
        sceneConfigs: {
          ...Navigator.SceneConfigs.FloatFromBottom,
          gestures: null, // 阻止ios左滑
        },
      });
    }
  };

  layoutAnimateIn = () => {
    const { index } = this.props;
    const delay = index * 300;
    Animated.spring(this.state.animateItem, {
      toValue: 1,
      duration: 700,
      delay: delay,
    }).start();
  };

  layoutAnimateOut = () => {
    Animated.spring(this.state.animateItem, {
      toValue: 0,
      duration: 300,
    }).start();
  };

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
    TYSdk.event.emit('sharedElementStart', this.props.markId);
  }

  sharedElementStart = data => {
    Animated.spring(this.state.animateTrans, {
      toValue: 1,
      duration: 200,
    }).start(() => {
      this.onPressItem(data);
    });
  };

  sharedElementEnd = () => {
    Animated.spring(this.state.animateTrans, {
      toValue: 1,
      duration: 200,
    }).start();
  };

  render() {
    const { data, cellStyle } = this.props;
    const { id, recipeTitle, name } = data;
    const image = typeof data.image === 'string' ? { uri: data.image } : image;
    // const { width: propsWidth } = StyleSheet.flatten([cellStyle, imageStyle]);
    // const contentWidth = propsWidth || width;
    const sourceImageStyle = StyleSheet.flatten([styles.image]);
    const targetImageStyle = StyleSheet.flatten([mainStyles.topContentView]);
    return (
      <TouchableOpacity
        key={id}
        onPressIn={() => this.animateIn()}
        onPressOut={() => this.animateOut()}
        onPress={() => this.onPressItem(data)}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            styles.cell,
            {
              transform: [
                {
                  scale: this.state.animatePress,
                },
                {
                  translateX: this.state.animateItem.interpolate({
                    inputRange: [0, 1],
                    outputRange: [Math.random() > 0.5 ? 700 : -700, 1],
                  }),
                },
                {
                  translateY: this.state.animateItem.interpolate({
                    inputRange: [0, 1],
                    outputRange: [700, 0],
                  }),
                },
                {
                  translateY: this.state.animateTrans.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -100],
                  }),
                },
              ],
            },
            cellStyle,
          ]}
        >
          <Animated.Image
            style={[
              {
                width: this.state.animateTrans.interpolate({
                  inputRange: [0, 1],
                  outputRange: [sourceImageStyle.width, targetImageStyle.width],
                }),
                height: this.state.animateTrans.interpolate({
                  inputRange: [0, 1],
                  outputRange: [sourceImageStyle.height, targetImageStyle.height],
                }),
              },
            ]}
            prefetch={data.image}
            androidresizeMethod="resize"
            source={image}
            resizeMode="cover"
          />
          <Image
            source={OutRes.mask}
            style={[mainStyles.commonStyle, mainStyles.initImageStyle, { resizeMode: 'cover' }]}
          />
          <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.tabText]}>
            {recipeTitle || name}
          </Text>
          {data.isstart && (
            <TouchableOpacity style={styles.imageView2} onPress={() => {}}>
              <Image resizeMode="contain" style={styles.image2} source={Res.start} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  cell: {
    width,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabText: {
    fontSize: cx(17),
    color: '#FFFFFF',
    fontWeight: 'bold',
    position: 'absolute',
    backgroundColor: 'transparent',
    zIndex: 10,
    left: cx(20),
    bottom: cx(20),
  },

  image: {
    width: width - cx(43),
    height: cx(180),
    resizeMode: 'cover',
  },

  banner: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageView2: {
    position: 'absolute',
    backgroundColor: 'transparent',
    zIndex: 10,
    right: cx(20),
    bottom: cx(20),
    width: cx(18),
    height: cx(18),
  },

  image2: {
    width: cx(18),
    height: cx(18),
  },
});
export default Cell;
