import camelCase from 'camelcase';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet, ViewPropTypes } from 'react-native';
import { Utils, TYSdk, TYSectionList, Popup } from 'tuya-panel-kit';
import { get, arrayToObject } from './utils';
import { store } from '../../main';

const TYEvent = TYSdk.event;
const TYNative = TYSdk.native;
const TYDevice = TYSdk.device;

const { scaleNumber } = Utils.NumberUtils;
const { convertY: cy } = Utils.RatioUtils;

export default class DpsLists extends Component {
  static propTypes = {
    accessibilityLabel: PropTypes.string,
    wrapperStyle: ViewPropTypes.style,
    /**
     * dp点列表
     */
    dps: PropTypes.arrayOf(
      PropTypes.shape({
        code: PropTypes.string.isRequired,
      })
    ).isRequired,

    /**
     * dp点的section标题，可选
     */
    dpTitle: PropTypes.string,

    /**
     * 自定义格式化value文案
     */
    formatValue: PropTypes.func,

    /**
     * same as FlatList's sections
     */
    sections: PropTypes.array,

    /**
     * 是否翻转`DP点列表`和`额外功能区块`的顺序
     */
    reverse: PropTypes.bool,

    /**
     * i18n Strings
     */
    Strings: PropTypes.object.isRequired,
  };

  static defaultProps = {
    accessibilityLabel: 'DpsLists',
    wrapperStyle: null,
    dpTitle: null,
    formatValue: null,
    sections: [],
    reverse: false,
  };

  constructor(props) {
    super(props);
    const dps = props.dps || [];
    const { dpState } = store.getState();
    this.state = {
      values: arrayToObject(
        dps.map(({ code }) => ({
          [code]: dpState[code],
        }))
      ),
    };
  }

  componentDidMount() {
    TYEvent.on('deviceDataChange', this._handleDpDataChange);
  }

  componentWillUnmount() {
    TYEvent.off('deviceDataChange', this._handleDpDataChange);
  }

  getDpFunData() {
    const { accessibilityLabel, dpTitle, formatValue, Strings } = this.props;
    const { devInfo } = store.getState();
    return [
      {
        title: dpTitle,
        data: Object.keys(this.state.values).map(code => {
          const schema = devInfo.schema[code];
          const value = get(this, `state.values.${code}`);
          const mode = get(schema, 'mode');
          const type = get(schema, 'type');
          const arrow = mode !== 'ro' && type !== 'bool';
          let formattedValue;
          switch (type) {
            case 'value': {
              const scale = get(schema, 'scale', 0);
              formattedValue = scaleNumber(scale, value);
              break;
            }
            case 'enum':
              formattedValue = Strings.getDpLang(code, value);
              break;
            default:
              formattedValue = value;
              break;
          }
          if (typeof formatValue === 'function') {
            formattedValue = formatValue(value, schema, formattedValue);
          }
          const testProps = {};
          const label = `${accessibilityLabel}_${camelCase(code, { pascalCase: true })}`;
          if (type === 'bool') {
            testProps.SwitchButtonProps = { accessibilityLabel: label };
          } else {
            testProps.accessibilityLabel = label;
          }
          return {
            ...testProps,
            key: code,
            arrow,
            value: formattedValue,
            title: Strings.getDpLang(code),
            onValueChange: () => this._handleItemValueChange(value, schema),
            onPress: () => this._handleItemPress(value, schema),
          };
        }),
      },
    ].filter(section => section.data.length > 0);
  }

  _handleDpDataChange = data => {
    if (data.type !== 'dpData') return;
    const { payload } = data;
    const newValues = {};
    const codes = Object.keys(payload);

    codes.forEach(code => {
      if (typeof this.state.values[code] !== 'undefined') {
        newValues[code] = payload[code];
      }
    });

    if (Object.keys(newValues).length > 0) {
      this.setState(({ values }) => ({
        values: {
          ...values,
          ...newValues,
        },
      }));
    }
  };

  _handleItemValueChange(value, schema) {
    const mode = get(schema, 'mode');
    const code = get(schema, 'code');
    if (mode === 'ro') return;
    TYDevice.putDeviceData({ [code]: !value });
  }

  _handleItemPress(value, schema) {
    const { accessibilityLabel, Strings } = this.props;
    const mode = get(schema, 'mode');
    const type = get(schema, 'type');
    if (mode === 'ro') return;
    switch (type) {
      case 'enum': {
        const range = get(schema, 'range', []);
        const code = camelCase(schema.code, { pascalCase: true });
        const dataSource = range.map(v => ({
          key: v,
          accessibilityLabel: `${accessibilityLabel}_${code}_${v}`,
          title: Strings.getDpLang(schema.code, v),
          value: v,
        }));
        Popup.list({
          type: 'radio',
          dataSource,
          title: Strings.getDpLang(schema.code),
          cancelText: Strings.getLang('cancel'),
          confirmText: Strings.getLang('confirm'),
          value,
          onConfirm: v => {
            Popup.close();
            TYDevice.putDeviceData({ [schema.code]: v });
          },
        });
        break;
      }
      case 'value': {
        Popup.numberSelector({
          title: Strings.getDpLang(schema.code),
          cancelText: Strings.getLang('cancel'),
          confirmText: Strings.getLang('confirm'),
          value,
          min: schema.min,
          max: schema.max,
          step: schema.step,
          scale: schema.scale,
          onConfirm: v => {
            Popup.close();
            if (v >= schema.min && v <= schema.max) {
              TYDevice.putDeviceData({ [schema.code]: v });
            } else {
              TYNative.simpleTipDialog(Strings.getLang('publishErrorTip'), () => {});
            }
          },
        });
        break;
      }
      default:
        break;
    }
  }

  render() {
    const { wrapperStyle, sections: extraSections, reverse, ...ListsProps } = this.props;
    const sections = reverse
      ? [...extraSections, ...this.getDpFunData()]
      : [...this.getDpFunData(), ...extraSections];
    return (
      <View style={[styles.container, wrapperStyle]}>
        <TYSectionList sections={sections} {...ListsProps} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: cy(16),
    backgroundColor: '#f8f8f8',
  },
});
