import React from 'react';
import { View, Text, Image, TouchableWithoutFeedback } from 'react-native';
import { IconFont } from 'tuya-panel-kit';

class Button extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isTouch: false,
    };
  }

  handleTouch = () => {
    this.setState({ isTouch: true });
  };

  touchRelease = () => {
    this.setState({ isTouch: false });
  };

  render() {
    const {
      label,
      icon,
      style,
      iconStyle,
      labelStyle,
      iconColor,
      children,
      touchedBackground,
      useLocalState,
      ...props
    } = this.props;
    const { isTouch } = this.state;
    const child = children ? <View style={style}>{children}</View> : null;
    const iconProps = {
      fill: iconColor,
      stroke: iconColor,
      ...props,
    };
    const first =
      typeof icon === 'number' || typeof icon === 'object' ? (
        <Image style={{ tintColor: iconColor }} source={icon} resizeMode="cover" />
      ) : typeof icon === 'string' && icon ? (
        <IconFont d={icon} {...iconProps} />
      ) : (
        undefined
      );
    const second = label ? <Text style={labelStyle}>{label}</Text> : undefined;
    return (
      <TouchableWithoutFeedback
        onPressIn={this.handleTouch}
        onPressOut={this.touchRelease}
        {...props}
      >
        {child || (
          <View style={style}>
            <View
              style={[
                iconStyle,
                isTouch && useLocalState && { backgroundColor: touchedBackground },
              ]}
            >
              {first}
            </View>
            {second}
          </View>
        )}
      </TouchableWithoutFeedback>
    );
  }
}

export default Button;
