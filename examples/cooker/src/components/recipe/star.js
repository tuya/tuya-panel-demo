/* eslint-disable max-len */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, ViewPropTypes, Animated, Easing } from 'react-native';
import Dialog from '../dialog';
import TYSdk from './api';
import Strings from './i18n';
import { mainStyles as styles, Res } from './assist/recipe-detail';

export default class Star extends PureComponent {
  static propTypes = {
    searchId: PropTypes.string,
    style: ViewPropTypes.style,
    isCollect: PropTypes.bool,
  };

  static defaultProps = {
    searchId: null,
    style: {},
    isCollect: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      isCollect: props.isCollect,
      animatedStarValue: new Animated.Value(props.isCollect ? 1 : 0),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isCollect !== nextProps.isCollect) {
      this.setState({ isCollect: nextProps.isCollect }, () => this.onAnimate(nextProps.isCollect));
    }
  }

  onCollect = contentId => {
    const { isCollect } = this.state;
    const mark = !isCollect;
    const title = Strings.getLang(`collect_${mark ? 'success' : 'failed'}`);
    const confirmText = Strings.getLang('OK');
    const func = mark ? TYSdk.getCollectDetail : TYSdk.onCancelCollect;
    func(contentId).then(data => {
      this.onAnimate(mark, () => {
        this.setState({ isCollect: mark });
        data &&
          Dialog.alert({
            title,
            confirmText,
          });
        TYSdk.event.emit('collectUpdate');
      });
    });
  };

  onAnimate = (isStart, func) => {
    Animated.timing(this.state.animatedStarValue, {
      duration: 500,
      toValue: isStart ? 1 : 0,
      useNativeDriver: true,
      easing: Easing.linear,
    }).start(({ finished }) => {
      finished && typeof func === 'function' && func();
    });
  };

  render() {
    const { style, searchId } = this.props;
    const { isCollect } = this.state;
    return (
      <TouchableOpacity style={style} onPress={() => this.onCollect(searchId)}>
        <Animated.Image
          source={Res.star}
          style={[
            isCollect ? styles.collectImageStyle : styles.isCollectImageStyle,
            {
              transform: [
                {
                  scale: this.state.animatedStarValue.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 2, 1],
                  }),
                },
                {
                  rotate: this.state.animatedStarValue.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: ['0deg', '180deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      </TouchableOpacity>
    );
  }
}
