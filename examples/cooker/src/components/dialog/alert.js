import PropTypes from 'prop-types';
import React from 'react';
import { View, StyleSheet, ViewPropTypes } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Footer from './footer';
import commonStyle from './styles';

const Alert = ({
  style,
  contentStyle,
  title,
  titleStyle,
  subTitle,
  subTitleStyle,
  footerWrapperStyle,
  confirmText,
  confirmTextStyle,
  onConfirm,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.content, contentStyle]}>
        <TYText style={[styles.title, titleStyle]}>{title}</TYText>
        {!!subTitle && <TYText style={[styles.subTitle, subTitleStyle]}>{subTitle}</TYText>}
      </View>
      <Footer
        style={footerWrapperStyle}
        confirmTextStyle={confirmTextStyle}
        confirmText={confirmText}
        onConfirm={onConfirm}
      />
    </View>
  );
};

Alert.propTypes = {
  style: ViewPropTypes.style,
  contentStyle: ViewPropTypes.style,
  title: PropTypes.string.isRequired,
  titleStyle: TYText.propTypes.style,
  subTitle: PropTypes.string,
  subTitleStyle: TYText.propTypes.style,
  footerWrapperStyle: ViewPropTypes.style,
  confirmText: PropTypes.string.isRequired,
  confirmTextStyle: TYText.propTypes.style,
  onConfirm: PropTypes.func,
};

Alert.defaultProps = {
  style: null,
  contentStyle: null,
  titleStyle: null,
  subTitle: '',
  subTitleStyle: null,
  footerWrapperStyle: null,
  confirmTextStyle: null,
  onConfirm: null,
};

const styles = StyleSheet.create(commonStyle);

export default Alert;
