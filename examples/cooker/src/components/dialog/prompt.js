import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  StyleSheet,
  ViewPropTypes,
} from 'react-native';
import { TYText, IconFont } from 'tuya-panel-kit';
import Footer from './footer';
import commonStyle from './styles';

export default class Prompt extends Component {
  static propTypes = {
    ...TextInput.propTypes,
    /**
     * 是否显示帮助图标
     */
    showHelp: PropTypes.bool,
    /**
     * 帮助图标点击回调
     */
    onHelpPress: PropTypes.func,
    /**
     * 输入框的容器样式
     */
    inputWrapperStyle: ViewPropTypes.style,
    /**
     * 输入框样式
     */
    inputStyle: TextInput.propTypes.style,
    style: ViewPropTypes.style,
    contentStyle: ViewPropTypes.style,
    title: PropTypes.string.isRequired,
    titleStyle: TYText.propTypes.style,
    subTitle: PropTypes.string,
    subTitleStyle: TYText.propTypes.style,
    footerWrapperStyle: ViewPropTypes.style,
    textContentType: PropTypes.string,
    cancelText: PropTypes.string.isRequired,
    cancelTextStyle: TYText.propTypes.style,
    confirmText: PropTypes.string.isRequired,
    confirmTextStyle: TYText.propTypes.style,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
  };

  static defaultProps = {
    showHelp: false,
    onHelpPress: null,
    style: null,
    contentStyle: null,
    titleStyle: null,
    subTitle: '',
    subTitleStyle: null,
    inputWrapperStyle: null,
    inputStyle: null,
    footerWrapperStyle: null,
    cancelTextStyle: null,
    confirmTextStyle: null,
    textContentType: '',
    onCancel: null,
    onConfirm: null,
  };

  constructor(props) {
    super(props);
    this._value = props.defaultValue;
    this.state = {
      value: props.value,
    };
  }

  _handleChangeText = text => {
    const { defaultValue, value, onChangeText } = this.props;
    if (typeof defaultValue !== 'undefined') {
      this._value = text;
      typeof onChangeText === 'function' && onChangeText(this._value);
    } else if (typeof value !== 'undefined') {
      // 如果为受控组件且有返回值则在此处刷新内容
      const ret = typeof onChangeText === 'function' ? onChangeText(text) : undefined;
      typeof ret !== 'undefined' && this.setState({ value: ret });
    }
  };

  _handleConfirm = () => {
    const { defaultValue, value, onConfirm } = this.props;
    if (typeof onConfirm !== 'function') {
      return;
    }
    if (typeof defaultValue !== 'undefined') {
      onConfirm(this._value);
    } else if (typeof value !== 'undefined') {
      onConfirm(this.state.value);
    }
  };

  render() {
    const {
      value,
      showHelp,
      onHelpPress,
      style,
      contentStyle,
      title,
      titleStyle,
      subTitle,
      subTitleStyle,
      inputWrapperStyle,
      inputStyle,
      footerWrapperStyle,
      confirmText,
      confirmTextStyle,
      cancelText,
      cancelTextStyle,
      onConfirm,
      onCancel,
      ...TextInputProps
    } = this.props;
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.content, contentStyle]}>
          <TYText style={[styles.title, titleStyle]}>{title}</TYText>
          {!!subTitle && <TYText style={[styles.subTitle, subTitleStyle]}>{subTitle}</TYText>}
          <View style={[styles.inputWrapper, inputWrapperStyle]}>
            <TextInput
              style={[
                styles.textInput,
                { padding: Platform.OS === 'android' ? 0 : null },
                inputStyle,
              ]}
              placeholderTextColor="#dbdbdb"
              underlineColorAndroid="transparent"
              {...TextInputProps}
              value={typeof value !== 'undefined' ? this.state.value : undefined}
              onChangeText={this._handleChangeText}
            />
            {showHelp && (
              <TouchableOpacity activeOpacity={0.8} onPress={onHelpPress}>
                <IconFont name="help-sharp" size={24} color="#b5b5b5" />
              </TouchableOpacity>
            )}
          </View>
        </View>
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

  inputWrapper: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#B5B5B5',
    backgroundColor: '#fff',
    marginTop: 20,
    height: 24,
    paddingLeft: 4,
  },

  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#000',
  },
});
