/* eslint-disable react/require-default-props */
import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Config from '../../../../config';

const { cx, cy, isIphoneX, winWidth } = Config;

class PickerFooter extends React.Component {
  static propTypes = {
    cancelText: PropTypes.string.isRequired,
    confirmText: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    accessibilityLabel: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { cancelText, confirmText, onConfirm, onCancel, accessibilityLabel } = this.props;
    return (
      <View style={styles.footPage}>
        <TouchableOpacity
          onPress={onCancel}
          style={[styles.textBox, styles.textCancelBox]}
          activeOpacity={0.7}
          accessibilityLabel={accessibilityLabel}
        >
          <TYText numberOfLines={1} style={styles.cancelText}>
            {cancelText}
          </TYText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onConfirm}
          style={styles.textBox}
          activeOpacity={0.7}
          accessibilityLabel={accessibilityLabel}
        >
          <TYText numberOfLines={1} style={styles.confirmText}>
            {confirmText}
          </TYText>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  footPage: {
    width: winWidth,
    borderTopColor: '#d8d8d8',
    borderTopWidth: 1,
    backgroundColor: '#ffffff',
    // paddingTop: 8,
    flexDirection: 'row',
  },
  textBox: {
    flex: 1,
    height: cy(48),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  textCancelBox: {
    borderRightColor: '#d8d8d8',
    borderRightWidth: 1,
  },
  cancelText: {
    textAlign: 'center',
    width: '100%',
    color: '#333',
    fontSize: cx(16),
    paddingBottom: isIphoneX ? 20 : 0,
  },
  confirmText: {
    textAlign: 'center',
    width: '100%',
    color: '#333',
    fontSize: cx(16),
    fontWeight: '600',
    paddingBottom: isIphoneX ? 20 : 0,
  },
});

export default PickerFooter;
