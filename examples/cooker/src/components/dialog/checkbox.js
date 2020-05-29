import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet, ViewPropTypes } from 'react-native';
import { TYText, TYFlatList, Divider } from 'tuya-panel-kit';
import Footer from './footer';
import commonStyle, { HEADER_HEIGHT } from './styles';

export default class CheckBoxDialog extends Component {
  static propTypes = {
    /**
     * CheckBox 类型: 单选 or 多选
     */
    type: PropTypes.oneOf(['radio', 'switch']),
    /**
     * 选中的值
     * 单选为 string 或者 number, 多选类型为 array
     */
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]).isRequired,
    /**
     * Checkbox 数据源，其中 value 必填, 除 value 外可为 `CheckboxItem` props
     */
    dataSource: PropTypes.arrayOf(
      PropTypes.shape({
        ...TYFlatList.CheckboxItem.propTypes,
        value: PropTypes.string.isRequired,
      })
    ).isRequired,
    /**
     * Checkbox 变更回调事件
     */
    onChange: PropTypes.func,
    style: ViewPropTypes.style,
    headerStyle: ViewPropTypes.style,
    title: PropTypes.string.isRequired,
    titleStyle: TYText.propTypes.style,
    subTitle: PropTypes.string,
    subTitleStyle: TYText.propTypes.style,
    contentStyle: ViewPropTypes.style,
    footerWrapperStyle: ViewPropTypes.style,
    cancelText: PropTypes.string.isRequired,
    cancelTextStyle: TYText.propTypes.style,
    confirmText: PropTypes.string.isRequired,
    confirmTextStyle: TYText.propTypes.style,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
  };

  static defaultProps = {
    type: 'radio',
    style: null,
    headerStyle: null,
    titleStyle: null,
    subTitle: '',
    subTitleStyle: null,
    contentStyle: null,
    footerWrapperStyle: null,
    cancelTextStyle: null,
    confirmTextStyle: null,
    onChange: null,
    onCancel: null,
    onConfirm: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
    if (props.type === 'switch' && !Array.isArray(props.value)) {
      console.warn('CheckBoxDialog: 复选框的 value 必须为 数组');
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.value !== nextProps.value) {
      this.setState({ value: nextProps.value });
    }
  }

  isChecked(value) {
    const { type } = this.props;
    if (type === 'radio') {
      return this.state.value === value;
    } else if (type === 'switch') {
      return this.state.value.some(v => v === value);
    }
    return false;
  }

  _handleCheckBoxChange = (checked, value) => {
    const { type, onChange } = this.props;
    if (type === 'radio') {
      this.setState(() => {
        const newValue = checked ? value : undefined;
        onChange && onChange(newValue);
        return { value: newValue };
      });
    } else if (type === 'switch') {
      this.setState(prevState => {
        let newValue = Array.isArray(prevState.value) ? prevState.value : [];
        if (checked) newValue = [...newValue, value];
        else newValue = newValue.filter(v => v !== value);
        onChange && onChange(newValue);
        return { value: newValue };
      });
    }
  };

  _handleConfirm = () => {
    const { onConfirm } = this.props;
    onConfirm && onConfirm(this.state.value);
  };

  renderCheckBoxItem = ({ item }) => {
    const { value, title, ...checkboxProps } = item;
    return (
      <TYFlatList.CheckboxItem
        styles={{
          container: styles.item,
          title: styles.checkBoxTitle,
        }}
        {...checkboxProps}
        title={title || value}
        checked={this.isChecked(value)}
        onChange={checked => this._handleCheckBoxChange(checked, value)}
      />
    );
  };

  render() {
    const {
      style,
      headerStyle,
      title,
      titleStyle,
      subTitle,
      subTitleStyle,
      contentStyle,
      dataSource,
      confirmText,
      confirmTextStyle,
      footerWrapperStyle,
      cancelText,
      cancelTextStyle,
      onCancel,
      ...TYFlatListProps
    } = this.props;
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.header, headerStyle]}>
          <TYText style={[styles.title, titleStyle]}>{title}</TYText>
          {!!subTitle && <TYText style={[styles.subTitle, subTitleStyle]}>{subTitle}</TYText>}
        </View>
        <Divider />
        <TYFlatList
          style={[styles.content, contentStyle]}
          scrollEnabled={dataSource.length > 5}
          keyExtractor={item => item.value}
          data={dataSource}
          renderItem={this.renderCheckBoxItem}
          {...TYFlatListProps}
        />
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

  content: {
    maxHeight: 200, // 超出5个item显示滚动条
    alignSelf: 'stretch',
    backgroundColor: '#fff',
  },

  item: {
    height: 40,
    minHeight: 40,
  },

  checkBoxTitle: {
    fontSize: 14,
    color: '#666',
  },
});
