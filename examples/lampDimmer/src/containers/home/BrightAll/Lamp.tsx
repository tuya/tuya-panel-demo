import React from 'react';
import { View, StyleSheet, Image, LayoutChangeEvent } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import resource from 'res/index';

const { convertX: cx } = Utils.RatioUtils;

const defaultProps = {
  power: false,
};

type DefaultProps = Readonly<typeof defaultProps>;
type IProps = DefaultProps;
interface IState {
  show: boolean;
  size: number;
}
export default class Lamp extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      show: false,
      size: 100,
    };
  }
  handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    this.setState({
      show: true,
      size: Math.min(cx(152), Math.min(width, height) - 26),
    });
  };
  render() {
    const { power } = this.props;
    const { show, size } = this.state;
    return (
      <View
        style={[
          styles.container,
          {
            opacity: power ? 1 : 0.4,
          },
        ]}
        onLayout={this.handleLayout}
      >
        {show && (
          <Image
            source={resource.light}
            style={{ width: size, height: size, opacity: power ? 1 : 0.4 }}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
