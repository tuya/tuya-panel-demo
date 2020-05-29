import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import Res from '../res';

const { convertX: cx } = Utils.RatioUtils;

interface SwitchItemProps {
  power: boolean;
  name: string;
  onPowerPress: any;
  onEditPress: any;
}

// eslint-disable-next-line react/prefer-stateless-function
class SwitchItem extends Component<SwitchItemProps> {
  static propTypes = {
    power: PropTypes.bool,
    name: PropTypes.string,
    onPowerPress: PropTypes.func,
    onEditPress: PropTypes.func,
  };

  static defaultProps = {
    power: false,
    name: '',
    onPowerPress() {},
    onEditPress() {},
  };

  render() {
    const { power, name, onPowerPress, onEditPress } = this.props;
    return (
      <View style={styles.itemContent}>
        <TouchableOpacity onPress={onPowerPress}>
          <Image source={power ? Res.powerOn : Res.powerOff} style={styles.img} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.nameEdit} onPress={onEditPress}>
          <TYText style={styles.name}>{name}</TYText>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameEdit: {
    width: cx(100),
  },
  name: {
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    fontSize: cx(12),
  },
  img: {
    width: cx(180),
    height: cx(180),
  },
});

export default SwitchItem;
