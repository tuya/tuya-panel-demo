import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet, ViewPropTypes } from 'react-native';
import { TYText, Divider } from 'tuya-panel-kit';
import Footer from './footer';
import commonStyle, { HEADER_HEIGHT } from './styles';

export default class CustomDialog extends Component {
  static propTypes = {
    /**
     * 自定义 Dialog Content
     */
    content: PropTypes.any.isRequired,
    style: ViewPropTypes.style,
    headerStyle: ViewPropTypes.style,
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

  static defaultProps = {
    style: null,
    headerStyle: null,
    titleStyle: null,
    subTitle: '',
    subTitleStyle: null,
    footerWrapperStyle: null,
    cancelTextStyle: null,
    confirmTextStyle: null,
    onCancel: null,
    onConfirm: null,
  };

  _handleConfirm = () => {
    const { onConfirm } = this.props;
    onConfirm && onConfirm();
  };

  render() {
    const {
      style,
      headerStyle,
      title,
      titleStyle,
      subTitle,
      subTitleStyle,
      content,
      confirmText,
      confirmTextStyle,
      footerWrapperStyle,
      cancelText,
      cancelTextStyle,
      onCancel,
    } = this.props;
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.header, headerStyle]}>
          <TYText style={[styles.title, titleStyle]}>{title}</TYText>
          {!!subTitle && <TYText style={[styles.subTitle, subTitleStyle]}>{subTitle}</TYText>}
        </View>
        <Divider />
        {content}
        <Footer
          style={footerWrapperStyle}
          cancelTextStyle={cancelTextStyle}
          confirmTextStyle={confirmTextStyle}
          cancelText={cancelText}
          confirmText={confirmText}
          onCancel={onCancel}
          onConfirm={this._handleConfirm}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  ...commonStyle,

  header: {
    height: HEADER_HEIGHT,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
  },
});
