/* eslint-disable react/no-array-index-key */
/* eslint-disable prettier/prettier */
import React from 'react';
import { View, StyleSheet, Dimensions, ColorPropType, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import { Button, Utils } from 'tuya-panel-kit';

const { convert } = Utils.RatioUtils;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  wrapper: {
    paddingVertical: convert(8),
    marginHorizontal: convert(16),
  },
  controllerBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  bottomBoder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5EAF3',
  },
});

export default class ControllerBar extends React.PureComponent {
  static defaultProps = {
    size: 'normal',
    backgroundType: 'pure',
    backgroundColor: '#fff',
    hasBottomBorder: false,
    style: {},
    wrapperStyle: {},
  };
  static propTypes = {
    size: PropTypes.oneOfType([PropTypes.oneOf(['large', 'normal', 'small']), PropTypes.number]),
    backgroundType: PropTypes.oneOf(['alpha', 'pure']),
    backgroundColor: ColorPropType,
    hasBottomBorder: PropTypes.bool,
    style: ViewPropTypes.style,
    button: PropTypes.array.isRequired,
    wrapperStyle: ViewPropTypes.style,
  };
  constructor(props) {
    super(props);
    this.state = {
      wrapperWidth: Dimensions.get('window').width,
    };
  }
  wrapperLayout = e => {
    this.setState({
      wrapperWidth: e.nativeEvent.layout.width,
    });
  };
  renderControllerBar = () => {
    const { button, size } = this.props;
    return (
      <View style={styles.controllerBar}>
        {button.map((btn, index) => {
          const customBtn = btn;
          if (!btn.size) {
            customBtn.size = size;
          }
          return <Button {...btn} key={btn.key || `btn_${index}`} />;
        })}
      </View>
    );
  };
  render() {
    const { style, backgroundType, backgroundColor, hasBottomBorder, wrapperStyle } = this.props;
    const backgroundStyle = {
      backgroundColor: backgroundColor || '#fff',
    };
    if (backgroundType === 'alpha') {
      backgroundStyle.backgroundColor = 'rgba(255, 255, 255, 0.08)';
    }
    const containerStyle = [
      styles.container,
      { width: this.state.wrapperWidth },
      backgroundStyle,
      style,
    ];
    const cWrapperStyle = [styles.wrapper, hasBottomBorder && styles.bottomBoder, wrapperStyle];
    return (
      <View style={containerStyle} onLayout={this.wrapperLayout}>
        <View style={cWrapperStyle}>{this.renderControllerBar()}</View>
      </View>
    );
  }
}
