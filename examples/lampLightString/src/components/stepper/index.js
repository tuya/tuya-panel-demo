/* eslint-disable import/no-extraneous-dependencies */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ViewPropTypes } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import {
  BigButton,
  TouchableOpacityView,
  StyledIconFont,
  StyledInput,
  RightView,
  TouchableThreeView,
  dPlus,
  dMinus,
} from './styled';

const { inMaxMin, add, subtract } = Utils.NumberUtils;

export default class Stepper extends PureComponent {
  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    /**
     * 步进器内容样式
     */
    style: ViewPropTypes.style,
    /**
     * 输入框样式
     */
    inputStyle: ViewPropTypes.style,
    /**
     * 加减按钮样式
     */
    buttonStyle: ViewPropTypes.style,
    /**
     * 是否支持手动编辑
     */
    editable: PropTypes.bool,
    /**
     * 按钮类型
     */
    buttonType: PropTypes.oneOf(['ellipse', 'triangle']),
    /**
     * 最小值
     */
    min: PropTypes.number,
    /**
     * 最大值
     */
    max: PropTypes.number,
    /**
     * 具体值
     */
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /**
     * 步长
     */
    stepValue: PropTypes.number,
    /**
     * 按钮类型为 ellipse 时按钮激活状态下的颜色
     */
    ellipseIconColor: PropTypes.string,
    /**
     * 按钮类型为 triangle 时激活状态下的颜色
     */
    triangleIconColor: PropTypes.string,
    /**
     * 文本输入的高亮和光标颜色
     */
    selectionColor: PropTypes.string,
    /**
     * 按钮类型为 triangle 时的减法按钮路径
     */
    iconMinusPath: PropTypes.string,
    /**
     * 按钮类型为 triangle 时的加法按钮路径
     */
    iconPlusPath: PropTypes.string,
    /**
     * 短按值回调
     * @param {number} value - 具体值
     */
    onValueChange: PropTypes.func,
    /**
     * 是否禁用
     * @version 3.4.6
     */
    disabled: PropTypes.bool,
    /**
     * 获取TextInput 实例ref
     * @version 3.4.11
     */
    getTextInputRef: PropTypes.func,
    // eslint-disable-next-line react/require-default-props
    disabledColor: PropTypes.string,
  };

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    style: {},
    buttonStyle: {},
    inputStyle: {},
    editable: true,
    min: 0,
    value: 20,
    max: 300,
    stepValue: 1,
    ellipseIconColor: '#333',
    selectionColor: '#FF4800',
    buttonType: 'ellipse',
    iconMinusPath: dMinus,
    iconPlusPath: dPlus,
    triangleIconColor: '#FF4800',
    onValueChange: () => {},
    disabled: false,
    getTextInputRef: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
  }

  componentDidMount() {
    const { getTextInputRef } = this.props;
    getTextInputRef && getTextInputRef(this.TextInputRef);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({
        value: nextProps.value,
      });
    }
  }

  componentWillUnmount() {
    this.clearInterval();
  }

  clearInterval() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  _handleMath = isMinus => {
    const { min, max, onValueChange, stepValue } = this.props;
    const { value } = this.state;
    if (isMinus) {
      if (value > min) {
        const step = Math.min(stepValue, subtract(value, min));
        onValueChange && onValueChange(subtract(value, step));
        this.setState({
          value: subtract(value, step),
        });
      }
    } else if (value <= max) {
      const step = Math.min(stepValue, subtract(max, value));
      onValueChange && onValueChange(add(value, step));
      this.setState({
        value: add(value, step),
      });
    }
  };

  _handlePressOut = () => {
    this.clearInterval();
  };

  _handlePressIn = (isMinus, disabled) => () => {
    if (disabled) return;
    this._handleMath(isMinus);
    this.clearInterval();
    this.timer = setInterval(() => {
      this._handleMath(isMinus);
    }, 250);
  };

  _handleChangeText = newValue => {
    const { max, min, onValueChange } = this.props;
    const idx = newValue.indexOf('.');
    if (!idx) return;

    if (idx === -1) {
      if (
        Number(newValue) > max ||
        Number(newValue) < min ||
        (newValue.length === 2 && !newValue.indexOf('0') && newValue[1] !== '.')
      ) {
        // const newValues = `${Number(newValue) >= max ? max : min}`;
        // this.setState({
        //  value: newValues,
        // });
        onValueChange(newValue);
        return;
      }
      onValueChange(newValue);
      this.setState({
        value: newValue,
      });
    } else {
      if (
        Number(newValue.substr(0, idx)) >= max ||
        Number(newValue.substr(0, idx)) < min ||
        newValue.length > idx + 2
      ) {
        const newValues = `${Number(newValue.substr(0, idx)) >= max ? max : min}`;
        // onValueChange(newValues);
        onValueChange(newValue);
        this.setState({
          value: newValues,
        });
        return;
      }
      onValueChange(newValue);
      this.setState({
        value: newValue,
      });
    }
  };

  _handleEndText = () => {
    const { min, onValueChange } = this.props;
    const { value } = this.state;
    const newValue = Number(value);
    if (typeof value === 'string' && !value.length) {
      onValueChange && onValueChange(min);
      this.setState({
        value: min,
      });
    } else {
      this.setState({
        value: newValue,
      });
      onValueChange && onValueChange(newValue);
    }
  };

  renderEllipse = () => {
    const {
      min,
      max,
      style,
      buttonStyle,
      ellipseIconColor,
      selectionColor,
      inputStyle,
      editable,
      disabled,
      disabledColor,
      ...textInputProps
    } = this.props;
    const { value } = this.state;
    const isDisableMinus = disabled || !(value > min);
    const isDisablePlus = disabled || !(value < max);
    return (
      <BigButton style={style}>
        <TouchableOpacityView
          activeOpacity={isDisableMinus ? 1 : 0.6}
          style={[buttonStyle, isDisableMinus && { backgroundColor: disabledColor }]}
          onPressOut={this._handlePressOut}
          onPressIn={this._handlePressIn(true, isDisableMinus)}
        >
          <StyledIconFont fill={ellipseIconColor} name="minus" />
        </TouchableOpacityView>
        <StyledInput
          ref={ref => {
            this.TextInputRef = ref;
          }}
          maxLength={3}
          {...textInputProps}
          style={[disabled && { color: 'rgba(51,51,51,.4)' }, inputStyle]}
          // onEndEditing={this._handleEndText}
          value={value.toString()}
          onChangeText={this._handleChangeText}
          keyboardType="numeric"
          selectionColor={selectionColor}
          enablesReturnKeyAutomatically={true}
          editable={!disabled && editable}
        />
        <TouchableOpacityView
          activeOpacity={isDisablePlus ? 1 : 0.6}
          style={[buttonStyle, isDisablePlus && { backgroundColor: disabledColor }]}
          onPressOut={this._handlePressOut}
          onPressIn={this._handlePressIn(false, isDisablePlus)}
        >
          <StyledIconFont fill={ellipseIconColor} name="plus" />
        </TouchableOpacityView>
      </BigButton>
    );
  };

  renderTriangle = () => {
    const {
      min,
      max,
      style,
      buttonStyle,
      triangleIconColor,
      selectionColor,
      iconMinusPath,
      iconPlusPath,
      inputStyle,
      editable,
      disabled,
      ...textInputProps
    } = this.props;
    const { value } = this.state;
    const isDisableMinus = disabled || !(value > min);
    const isDisablePlus = disabled || !(value < max);
    return (
      <RightView style={style}>
        <TouchableThreeView
          activeOpacity={isDisableMinus ? 1 : 0.6}
          style={buttonStyle}
          disabled={isDisableMinus}
          onPressOut={this._handlePressOut}
          onPressIn={this._handlePressIn(true, isDisableMinus)}
        >
          <StyledIconFont fill={triangleIconColor} d={iconMinusPath} />
        </TouchableThreeView>
        <StyledInput
          ref={ref => {
            this.TextInputRef = ref;
          }}
          maxLength={4}
          {...textInputProps}
          editable={!disabled && editable}
          style={[disabled && { color: 'rgba(51,51,51,.4)' }, inputStyle]}
          // onEndEditing={this._handleEndText}
          value={value.toString()}
          onChangeText={this._handleChangeText}
          keyboardType="numeric"
          selectionColor={selectionColor}
          enablesReturnKeyAutomatically={true}
        />
        <TouchableThreeView
          activeOpacity={isDisablePlus ? 1 : 0.6}
          style={buttonStyle}
          disabled={isDisablePlus}
          onPressOut={this._handlePressOut}
          onPressIn={this._handlePressIn(false, isDisablePlus)}
        >
          <StyledIconFont fill={triangleIconColor} d={iconPlusPath} />
        </TouchableThreeView>
      </RightView>
    );
  };

  render() {
    const { buttonType } = this.props;
    return buttonType === 'ellipse' ? this.renderEllipse() : this.renderTriangle();
  }
}
