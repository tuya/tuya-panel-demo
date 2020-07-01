import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Config from '../../../config';

const { cx, cy, isIphoneX } = Config;

class Footer extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { text, onConfirm } = this.props;
    return (
      <View style={styles.footPage}>
        <TouchableOpacity onPress={onConfirm} style={styles.textBox} activeOpacity={0.7}>
          <TYText numberOfLines={1} style={styles.footText}>
            {text}
          </TYText>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  footPage: {
    backgroundColor: '#dfdfdf',
    paddingTop: 8,
  },
  textBox: {
    height: cy(48),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  footText: {
    textAlign: 'center',
    width: '100%',
    color: '#333',
    fontSize: cx(16),
    paddingBottom: isIphoneX ? 20 : 0,
  },
});

export default Footer;
