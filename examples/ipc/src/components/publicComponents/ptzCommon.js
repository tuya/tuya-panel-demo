/* eslint-disable react/require-default-props */
/* eslint-disable react/default-props-match-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  ViewPropTypes,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';

class PtzCommon extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool.isRequired,
    pieWidth: PropTypes.number.isRequired,
    pieHeight: PropTypes.number.isRequired,
    containerStyle: ViewPropTypes.style,
    rotateDegree: PropTypes.string.isRequired,
    pieData: PropTypes.array.isRequired,
    containerBgImg: PropTypes.number,
    cirleImg: PropTypes.number,
    cirleContain: ViewPropTypes.style,
    hasCircle: PropTypes.bool.isRequired,
    cirleWidth: PropTypes.number.isRequired,
    activeKey: PropTypes.number.isRequired,
    ptzDotImg: PropTypes.number,
    pressIn: PropTypes.func,
    pressOut: PropTypes.func,
    panelItemActiveColor: PropTypes.string.isRequired,
  };
  static defaultProps = {
    disabled: false,
    pieWidth: 200,
    pieHeight: 200,
    pieNumber: 4,
    containerStyle: undefined,
    cirleContain: { backgroundColor: '#fff' },
    rotateDegree: '45deg',
    pieBgc: ['yellow', 'blue'],
    pieData: [{ key: '1' }, { key: '2' }, { key: '3' }, { key: '4' }],
    hasCircle: true,
    cirleWidth: 65,
    activeKey: -1,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }
  pieItemRender = (
    pieData,
    pieItemWidth,
    pieItemHeight,
    containerBgImg,
    activeKey,
    ptzDotImg,
    disabled
  ) => {
    const { panelItemActiveColor } = this.props;
    return pieData.map((item, index) => (
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={(item.hasPtz !== undefined && !item.hasPtz) || disabled}
        // disabled={true}
        style={styles.down_style}
        onPressIn={() => this.pressIn(index)}
        onPressOut={() => this.pressOut(index)}
        key={item.key}
        style={[
          styles.pieCommon,
          {
            backgroundColor: containerBgImg ? 'transparent' : '#fff',
            width: pieItemWidth,
            height: pieItemHeight,
          },
        ]}
      >
        {item.imageSource && activeKey === index && (
          <View style={[styles.hoverImage]}>
            <Image
              source={item.imageSource}
              style={{
                width: pieItemWidth,
                height: pieItemWidth,
                tintColor: panelItemActiveColor === '#fc2f07' ? undefined : panelItemActiveColor,
              }}
            />
          </View>
        )}
        {item.hasPtz && (
          <View style={[styles.ptzDotImage]}>
            <Image source={ptzDotImg} style={{ width: 10, height: 10 }} />
          </View>
        )}
      </TouchableOpacity>
    ));
  };
  circleRender = (cirleWidth, cirleImg, cirleContain) => {
    const halfWidth = cirleWidth / 2;
    return (
      <View
        style={[
          {
            width: cirleWidth,
            height: cirleWidth,
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: -halfWidth,
            marginLeft: -halfWidth,
            borderRadius: halfWidth,
          },
          cirleContain,
        ]}
      >
        {cirleImg && <Image soure={cirleImg} style={styles.circleImage} />}
      </View>
    );
  };

  pressIn = index => {
    this.props.pressIn(index);
  };
  pressOut = index => {
    this.props.pressOut(index);
  };
  render() {
    const {
      pieWidth,
      pieHeight,
      containerStyle,
      rotateDegree,
      pieData,
      containerBgImg,
      hasCircle,
      cirleWidth,
      cirleImg,
      cirleContain,
      activeKey,
      ptzDotImg,
      disabled,
    } = this.props;
    const pieNumber = pieData.length;
    const pieItemWidth = pieWidth / (pieNumber / 2);
    const pieItemHeight = pieHeight / 2;

    return (
      <View style={styles.PtzCommonPage}>
        <View
          style={[
            {
              width: pieWidth,
              height: pieHeight,
              borderRadius: pieWidth / 2,
              overflow: 'hidden',
            },
            containerStyle,
          ]}
        >
          {containerBgImg ? (
            <ImageBackground
              source={containerBgImg}
              style={[
                styles.pieBox,
                {
                  width: pieWidth,
                  height: pieHeight,
                  transform: [{ rotate: rotateDegree }],
                },
              ]}
            >
              {this.pieItemRender(
                pieData,
                pieItemWidth,
                pieItemHeight,
                containerBgImg,
                activeKey,
                ptzDotImg,
                disabled
              )}
              {hasCircle && this.circleRender(cirleWidth, cirleImg, cirleContain, activeKey)}
            </ImageBackground>
          ) : (
            <View
              style={[
                styles.pieBox,
                {
                  width: pieWidth,
                  height: pieHeight,
                  transform: [{ rotate: rotateDegree }],
                },
              ]}
            >
              {this.pieItemRender(pieData, pieItemWidth, pieItemHeight, ptzDotImg)}
              {hasCircle && this.circleRender(cirleWidth, cirleImg, cirleContain)}
            </View>
          )}
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  PtzCommonPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pieCommon: {
    // backgroundColor: 'transparent',
  },
  hoverImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleImage: {
    width: 50,
    height: 50,
    tintColor: 'red',
  },
  ptzDotImage: {
    width: 10,
    height: 10,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -5,
    marginLeft: -5,
  },
});

export default PtzCommon;
