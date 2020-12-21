import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
  ViewStyle,
  StyleProp,
  ImageStyle,
  TextStyle,
} from 'react-native';
import { Utils } from 'tuya-panel-kit';

const { width } = Dimensions.get('window');
const { convertY } = Utils.RatioUtils;

interface BottomButtonProps {
  data: buttonListType[];
  bgColor?: string;
  textColor?: string;
  imageColor: StyleProp<ImageStyle>;
  imageStyle: StyleProp<ImageStyle>;
  noText: boolean;
  style: StyleProp<ViewStyle>;
  innerStyle: StyleProp<ViewStyle>;
  textStyle: StyleProp<TextStyle>;
}
export default class BottomButton extends Component<BottomButtonProps, any> {
  static defaultProps = {
    bgColor: 'transparent',
    textColor: '#000',
    imageColor: {},
    imageStyle: {},
    noText: false,
    style: {},
    innerStyle: {},
    textStyle: {},
  };

  renderButton() {
    const { textColor, data } = this.props;
    const { length } = data;
    return this.props.data.map(item => (
      <View
        style={[
          { width: (width - 40) / length, justifyContent: 'center', alignItems: 'center' },
          this.props.innerStyle,
        ]}
        key={item.key}
      >
        {!item.type && (
          <TouchableOpacity
            onPress={() => {
              if (typeof item.onPress === 'function') {
                item.onPress();
              }
            }}
            style={[
              { width: (width - 40) / this.props.data.length },
              styles.barItem,
              this.props.innerStyle,
            ]}
          >
            <Image
              source={item.background}
              style={[this.props.imageColor, this.props.imageStyle, item.imageColor]}
            />
            {!this.props.noText && (
              <Text
                style={[styles.buttonText, { color: textColor }, this.props.textStyle]}
                numberOfLines={1}
              >
                {item.text}
              </Text>
            )}
          </TouchableOpacity>
        )}
        {item.type === 'View' && (
          <View
            style={[
              { width: (width - 40) / this.props.data.length },
              styles.barItem,
              this.props.innerStyle,
            ]}
          >
            <Image
              source={item.background}
              style={[this.props.imageColor, this.props.imageStyle, item.imageColor]}
            />
            {!this.props.noText && (
              <Text
                style={[styles.buttonText, { color: textColor }, this.props.textStyle]}
                numberOfLines={1}
              >
                {item.text}
              </Text>
            )}
          </View>
        )}
        {item.type === 'component' && (
          <View
            style={[
              { width: (width - 40) / this.props.data.length },
              styles.barItem,
              this.props.innerStyle,
            ]}
          >
            {item.renderView()}
            {!this.props.noText && (
              <Text
                style={[styles.buttonText, { color: textColor }, this.props.textStyle]}
                numberOfLines={1}
              >
                {item.text}
              </Text>
            )}
          </View>
        )}
      </View>
    ));
  }
  render() {
    const { bgColor } = this.props;
    return (
      <View style={[styles.toolBar, { backgroundColor: bgColor }, this.props.style]}>
        {this.renderButton()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  toolBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    paddingTop: convertY(14),
    paddingHorizontal: 20,
    overflow: 'scroll',
    paddingBottom: convertY(10),
  },
  barItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    textAlign: 'center',
    marginTop: convertY(13),
    fontSize: 13,
    lineHeight: 16,
  },
});
