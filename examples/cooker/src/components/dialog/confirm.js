import PropTypes from 'prop-types';
import React from 'react';
import { View, StyleSheet, ViewPropTypes } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Footer from './footer';
import commonStyle from './styles';

const Confirm = ({
  style,
  contentStyle,
  title,
  titleStyle,
  subTitle,
  subTitleStyle,
  confirmText,
  confirmTextStyle,
  footerWrapperStyle,
  cancelText,
  cancelTextStyle,
  onConfirm,
  onCancel,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.content, contentStyle]}>
        <TYText style={[styles.title, titleStyle]}>{title}</TYText>
        {!!subTitle && <TYText style={[styles.subTitle, subTitleStyle]}>{subTitle}</TYText>}
      </View>
      <Footer
        style={footerWrapperStyle}
        cancelTextStyle={cancelTextStyle}
        confirmTextStyle={confirmTextStyle}
        cancelText={cancelText}
        confirmText={confirmText}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </View>
  );
};

Confirm.propTypes = {
  style: ViewPropTypes.style,
  contentStyle: ViewPropTypes.style,
  title: PropTypes.string.isRequired,
  titleStyle: TYText.propTypes.style,
  subTitle: PropTypes.string,
  subTitleStyle: TYText.propTypes.style,
  footerWrapperStyle: ViewPropTypes.style,
  cancelText: PropTypes.string.isRequired,
  cancelTextStyle: TYText.propTypes.style,
  confirmText: PropTypes.string.isRequired,
  confirmTextStyle: TYText.propTypes.style,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};

Confirm.defaultProps = {
  style: null,
  contentStyle: null,
  titleStyle: null,
  subTitle: '',
  subTitleStyle: null,
  footerWrapperStyle: null,
  cancelTextStyle: null,
  confirmTextStyle: null,
  onCancel: null,
  onConfirm: null,
};

const styles = StyleSheet.create(commonStyle);

export default Confirm;
