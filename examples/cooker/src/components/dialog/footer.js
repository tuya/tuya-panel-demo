import PropTypes from 'prop-types';
import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewPropTypes } from 'react-native';
import { TYText, Divider, Utils } from 'tuya-panel-kit';
import { DIALOG_WIDTH, FOOTER_HEIGHT } from './styles';

const { convertX: cx } = Utils.RatioUtils;

const DialogFooter = ({
  style,
  cancelText,
  cancelTextStyle,
  confirmText,
  confirmTextStyle,
  onCancel,
  onConfirm,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Divider style={styles.divider} width={DIALOG_WIDTH} height={StyleSheet.hairlineWidth} />
      {!!cancelText && (
        <TouchableOpacity style={styles.btn} activeOpacity={0.8} onPress={onCancel}>
          <TYText style={[styles.cancelText, cancelTextStyle]}>{cancelText}</TYText>
        </TouchableOpacity>
      )}
      {!!cancelText && !!confirmText && (
        <Divider width={StyleSheet.hairlineWidth} height={FOOTER_HEIGHT} />
      )}
      {!!confirmText && (
        <TouchableOpacity style={styles.btn} activeOpacity={0.8} onPress={onConfirm}>
          <TYText style={[styles.confirmText, confirmTextStyle]}>{confirmText}</TYText>
        </TouchableOpacity>
      )}
    </View>
  );
};

DialogFooter.propTypes = {
  style: ViewPropTypes.style,
  cancelText: PropTypes.string,
  cancelTextStyle: TYText.propTypes.style,
  confirmText: PropTypes.string,
  confirmTextStyle: TYText.propTypes.style,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};

DialogFooter.defaultProps = {
  style: null,
  cancelText: '',
  cancelTextStyle: null,
  confirmText: '',
  confirmTextStyle: null,
  onCancel: null,
  onConfirm: null,
};

const styles = StyleSheet.create({
  container: {
    height: FOOTER_HEIGHT,
    borderRadius: cx(14),
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },

  divider: {
    position: 'absolute',
    top: 0,
  },

  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 17,
    color: '#0077FF',
  },

  confirmText: {
    fontSize: 17,
    color: '#0077FF',
  },
});

export default DialogFooter;
