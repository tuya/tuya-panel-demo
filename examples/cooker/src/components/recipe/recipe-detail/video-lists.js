import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import Swiper from 'react-native-swiper';
import VideoPlayer from './video-display';

const { RatioUtils } = Utils;
const { convertX: cx, convertY: cy } = RatioUtils;
const { width, height } = Dimensions.get('window');

export default class VideoLists extends Component {
  static propTypes = {
    select: PropTypes.number,
    ...Swiper.propTypes,
  };

  static defaultProps = {
    select: 0,
  };

  constructor(props) {
    super(props);

    this.state = {
      onPlay: false,
    };
    this._list = null;
  }

  onPlay = flag => {
    const { onPlay } = this.props;
    this.setState({ onPlay: flag }, () => {
      onPlay && onPlay(flag);
    });
  };

  _renderItem = (item, index) => {
    const { value, stepTitle } = item;
    const { title, initImage } = this.props;
    return (
      <View key={`${value}${index}`}>
        <VideoPlayer
          navigator={this.props.navigator}
          mainTitle={title}
          stepTitle={stepTitle}
          onPlay={this.onPlay}
          uri={value}
          initImage={initImage}
        />
      </View>
    );
  };

  renderDot = () => <View style={styles.dot} />;

  renderActiveDot = () => <View style={styles.activeDot} />;

  render() {
    const { data } = this.props;
    const { onPlay } = this.state;
    return (
      <View
        style={{
          width,
          height: onPlay ? height : cy(225),
          alignSelf: 'center',
          position: 'absolute',
          top: 0,
        }}
      >
        <Swiper
          width={width}
          height={onPlay ? height : cy(225)}
          horizontal={true}
          loop={false}
          scrollEnabled={!onPlay}
          showsPagination={!onPlay}
          paginationStyle={styles.pagination}
          dot={<View style={styles.dot} />}
          activeDot={<View style={styles.activeDot} />}
        >
          {data.map((d, k) => this._renderItem(d, k))}
        </Swiper>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  dot: {
    width: cx(110),
    height: cy(1),
    marginHorizontal: cx(8),
    backgroundColor: 'rgba(255,255,255,.3)',
  },

  activeDot: {
    width: cx(110),
    height: cy(1),
    backgroundColor: 'rgba(255,255,255,.83)',
  },
});
