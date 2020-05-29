import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import VideoPlayer from '../video-player';

export default class VideoPlayerView extends PureComponent {
  static propTypes = {
    title: PropTypes.string,
    stepTitle: PropTypes.string,
    mainTitle: PropTypes.string,
    initImage: PropTypes.oneOfType(['number', 'string']).isRequired,
    style: PropTypes.any,
    onPlay: PropTypes.func,
    navigator: PropTypes.object.isRequired,
    uri: PropTypes.any.isRequired,
  };

  static defaultProps = {
    title: '',
    stepTitle: '',
    onPlay: null,
    mainTitle: '',
    style: null,
  };

  render() {
    const { title, stepTitle, uri, initImage, onPlay, style, mainTitle } = this.props;
    return (
      <VideoPlayer
        navigator={this.props.navigator}
        mainTitle={title || mainTitle}
        stepTitle={stepTitle}
        onPlay={onPlay}
        uri={uri}
        initImage={initImage}
        style={style}
      />
    );
  }
}
