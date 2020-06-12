/* eslint-disable react/default-props-match-prop-types */
/* eslint-disable react/require-default-props */
import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Config from '../../../config';
import Strings from '../../../i18n';

const { cx, winWidth } = Config;

class Footer extends React.Component {
  static propTypes = {
    cancelText: PropTypes.string.isRequired,
    confirmText: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    accessibilityLabel: PropTypes.string,
  };
  static defaultProps = {
    cancelText: Strings.getLang('cancel_btn'),
    confirmText: Strings.getLang('save_btn'),
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { cancelText, onConfirm, accessibilityLabel, confirmText, onCancel } = this.props;
    return (
      <View style={styles.footerPage}>
        <TouchableOpacity
          onPress={onCancel}
          style={[styles.textBox, styles.cancelContain]}
          activeOpacity={0.7}
          accessibilityLabel={accessibilityLabel}
        >
          <TYText numberOfLines={1} style={styles.footText}>
            {cancelText}
          </TYText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onConfirm}
          style={[styles.textBox, styles.confirmTextBox]}
          activeOpacity={0.7}
          accessibilityLabel={accessibilityLabel}
        >
          <TYText numberOfLines={1} style={[styles.footText, styles.confirmText]}>
            {confirmText}
          </TYText>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  footerPage: {
    width: winWidth * 0.85,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e5e5',
  },
  textBox: {
    flex: 1,
    height: cx(55),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  cancelContain: {
    borderBottomLeftRadius: 10,
  },
  footText: {
    color: '#333',
    fontSize: cx(16),
  },
  confirmTextBox: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: '#e5e5e5',
    borderBottomRightRadius: 10,
  },
  confirmText: {
    color: '#000',
    fontWeight: '600',
  },
});

export default Footer;
