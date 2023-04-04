/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';

import { Utils } from 'tuya-panel-kit';
import RadioButton from './radioButton';

const { convertY } = Utils.RatioUtils;
interface IState {
  activeLeft: any;
  containerHeight: number;
  activeIndex: number;
  activeViewHidden: boolean;
  wrapperWidth: number;
  everyWidth: number;
}

const styles = StyleSheet.create({
  activeViewStyle: {
    backgroundColor: '#fff',
    position: 'absolute',
  },
  containerStyle: {
    height: convertY(30),
    borderRadius: convertY(15),
    borderColor: '#fff',
    justifyContent: 'center',
  },
  wrapperStyle: {
    flexDirection: 'row',
  },
});
const defaultProps = {
  style: {},
  wrapperStyle: {},
  activeColor: '',
  defaultActiveIndex: 0,
  gutter: 2,
  onChange: () => null,
  activeRadius: 0,
};
type IProps = {
  tabs: any;
  style?: ViewStyle;
  wrapperStyle?: ViewStyle;
  activeColor?: string;
  defaultActiveIndex?: number;
  gutter?: number;
  activeRadius?: number;
  onChange?: (index: number, item: number) => void;
} & Readonly<typeof defaultProps>;
class Group extends React.PureComponent<IProps, IState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = defaultProps;

  private containerSize;

  private wrapperSize;

  constructor(props) {
    super(props);
    const activeIndex =
      props.activeIndex !== undefined ? props.activeIndex : props.defaultActiveIndex;
    this.state = {
      activeLeft: new Animated.Value(0),
      activeIndex,
      activeViewHidden: true,
      wrapperWidth: 0,
      containerHeight: 0,
      everyWidth: 0,
    };

    this.containerSize = null;
    this.wrapperSize = null;
  }

  componentWillReceiveProps(nextProps) {
    if ('activeIndex' in nextProps) {
      this.moveActiveView(nextProps.activeIndex);
    }
  }

  getItem = () => {
    const { tabs } = this.props;
    const { wrapperWidth, activeViewHidden, activeIndex } = this.state;
    const buttonStyle = [{ width: wrapperWidth / tabs.length }];
    const defaultTextStyle = [{ opacity: activeViewHidden ? 0 : 1 }];
    return tabs.map((item, index) => {
      const { style, textStyle, ...other } = item;
      return (
        <RadioButton
          {...other}
          // eslint-disable-next-line react/no-array-index-key
          key={`tab_${index}`}
          style={[buttonStyle, style]}
          textStyle={[defaultTextStyle, textStyle]}
          onItemPress={() => this.changeTab(index, item, item.onItemPress)}
          isActive={activeIndex === index}
        />
      );
    });
  };

  moveActiveView = index => {
    const { everyWidth, activeLeft } = this.state;
    const { gutter } = this.props;
    const currentLeft = index * everyWidth + gutter;
    Animated.spring(activeLeft, {
      toValue: currentLeft,
    }).start();
    this.setState({
      activeIndex: index,
    });
  };

  changeTab = (index, item, func) => {
    const { activeIndex } = this.state;
    if (func) func(index);
    if (index === activeIndex) return;
    const { onChange } = this.props;
    onChange && onChange(index, item);
    if ('activeIndex' in this.props) return;
    this.moveActiveView(index);
  };

  containerLayout = e => {
    this.containerSize = e.nativeEvent.layout;
    this.completeCalcWidth();
  };

  wrapperLayout = e => {
    this.wrapperSize = e.nativeEvent.layout;
    this.completeCalcWidth();
  };

  completeCalcWidth = () => {
    if (!this.wrapperSize || !this.containerSize) return;
    const { tabs, gutter } = this.props;
    const everyWidth = this.wrapperSize.width / tabs.length;
    const { activeLeft, activeIndex } = this.state;
    activeLeft.setValue(gutter + everyWidth * activeIndex);
    this.setState({
      containerHeight: this.containerSize.height,
      wrapperWidth: this.wrapperSize.width,
      activeViewHidden: false,
      everyWidth,
    });
  };

  render() {
    const { style, wrapperStyle, activeColor, tabs, gutter, activeRadius } = this.props;
    const { wrapperWidth, containerHeight, activeLeft, activeViewHidden } = this.state;
    const containerPadding =
      // @ts-ignore
      activeRadius || StyleSheet.flatten([styles.containerStyle, style]).borderRadius + gutter;
    const containerStyle = [styles.containerStyle, style, { paddingHorizontal: gutter }];
    const customWrapperStyle = [styles.wrapperStyle, wrapperStyle];
    const newActiveLeft = { left: activeLeft };
    const activeViewStyle = [
      styles.activeViewStyle,
      {
        width: wrapperWidth / tabs.length,
        height: containerHeight - gutter * 2,
      },
      activeColor && { backgroundColor: activeColor },
      { borderRadius: containerPadding },
      newActiveLeft,
    ];
    return (
      <View onLayout={this.containerLayout} style={containerStyle}>
        {!activeViewHidden && <Animated.View style={activeViewStyle} />}
        <View onLayout={this.wrapperLayout} style={customWrapperStyle}>
          {this.getItem()}
        </View>
      </View>
    );
  }
}

export default Group;
