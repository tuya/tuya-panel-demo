import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Utils, SwitchButton } from 'tuya-panel-kit';
import Res from '../res';

const { convertX } = Utils.RatioUtils;
const { width } = Dimensions.get('window');
interface SwitchListProps {
  title: string;
  tip: string;
  clickTitle: string;
  type: string;
  switchValue: boolean;
  onSwitch: (value: boolean) => void;
  onClick: () => void;
  choiceValue: string;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
}
interface SwitchListState {
  switchValue: boolean;
  choiceValue: string;
}
export default class SwitchList extends Component<SwitchListProps, SwitchListState> {
  static defaultProps = {
    data: {},
    tip: '',
    clickTitle: '',
    switchValue: false,
    onSwitch: () => {},
    onClick: () => {},
    style: {},
    choiceValue: '',
    innerStyle: {},
  };

  constructor(props: any) {
    super(props);
    this.state = {
      switchValue: this.props.switchValue,
      choiceValue: this.props.choiceValue,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.setState({
        switchValue: nextProps.switchValue,
        choiceValue: nextProps.choiceValue,
      });
    }
  }

  renderSwitch() {
    const { tip, title, onSwitch, innerStyle } = this.props;
    return (
      <View
        style={[
          styles.inputView,
          { borderBottomWidth: 0 },
          tip ? { height: convertX(70) } : {},
          innerStyle,
        ]}
      >
        <View>
          <Text style={styles.userTip}>{title}</Text>
          {!!tip && <Text style={styles.tip}>{tip}</Text>}
        </View>

        <SwitchButton
          onTintColor="#0076FF"
          value={this.state.switchValue}
          onValueChange={value => {
            //  this.setState({ switchValue: value });
            onSwitch && onSwitch(value);
          }}
        />
      </View>
    );
  }

  renderClickList(title: any, tip: any) {
    const { onClick, type, innerStyle } = this.props;
    const { choiceValue } = this.state;
    const styleListA = {
      view: { height: convertX(70) },
      text: styles.userTip,
    };
    const styleListB = {
      view: { height: convertX(38), paddingBottom: 10, alignItems: 'center' },
      text: {
        color: '#333',
        fontSize: convertX(14),
        maxWidth: 200,
      },
    };
    return (
      <View
        style={[
          styles.inputView,
          tip ? styleListA.view : type === 'switchAndClick' ? styleListB.view : {},
          innerStyle,
        ]}
      >
        <View>
          <Text
            style={type === 'switchAndClick' ? styleListB.text : styleListA.text}
            numberOfLines={1}
          >
            {title}
          </Text>
          {!!tip && (
            <Text style={styles.tip} numberOfLines={2}>
              {tip}
            </Text>
          )}
        </View>
        <View style={styles.onclickView}>
          <Text
            style={{
              color: '#333',
              fontSize: convertX(14),
              lineHeight: convertX(24),
              maxWidth: 100,
            }}
            numberOfLines={1}
          >
            {choiceValue}
          </Text>
          <Image source={Res.arrow} style={styles.arrow} />
        </View>
        <TouchableOpacity onPress={() => onClick()} style={styles.clickTouch} />
      </View>
    );
  }

  render() {
    const { type, tip, title, clickTitle, style } = this.props;
    const { switchValue } = this.state;
    return (
      <View>
        {type === 'switch' && <View style={[styles.spaceView, style]}>{this.renderSwitch()}</View>}

        {type === 'click' && (
          <View style={[styles.spaceView, style]}>{this.renderClickList(title, tip)}</View>
        )}
        {type === 'switchAndClick' && (
          <View style={[styles.spaceView, style]}>
            {this.renderSwitch()}
            {switchValue && this.renderClickList(clickTitle, '')}
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  userTip: {
    color: '#333',
    fontSize: convertX(16),
    maxWidth: 200,
  },

  spaceView: {
    backgroundColor: '#fff',
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputView: {
    flexDirection: 'row',
    width: convertX(343),
    height: convertX(50),
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginHorizontal: convertX(16),
    // borderBottomWidth: 0.5,
    // borderBottomColor: '#eee',
  },

  tip: {
    color: '#999999',
    fontSize: convertX(12),
    marginTop: convertX(6),
    maxWidth: convertX(270),
  },

  onclickView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    marginLeft: 10,
  },
  clickTouch: {
    width: convertX(343),
    height: convertX(50),
    backgroundColor: 'transparent',
    position: 'absolute',
  },
});
