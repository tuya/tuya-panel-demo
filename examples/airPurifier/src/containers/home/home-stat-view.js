import camelCase from 'camelcase';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import { Utils } from 'tuya-panel-kit';
import GridLayout from '../../components/GridLayout';
import TYSdk from '../../api';
import dpCodes from '../../config/dpCodes';
import { arrayToObject } from '../../utils';
import Strings from '../../i18n';
import { store } from '../../main';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

const { scaleNumber } = Utils.NumberUtils;

const { totalPm: totalPmCode } = dpCodes;

class HomeStatView extends Component {
  static propTypes = {
    dps: PropTypes.arrayOf(
      PropTypes.shape({
        code: PropTypes.string.isRequired,
      })
    ).isRequired,
  };

  constructor(props) {
    super(props);
    this._dps = this.props.dps || [];
    this.state = {
      dps: props.dps,
      codeState: arrayToObject(
        props.dps.map(({ code }) => ({
          [code]: store.getState().dpState[code],
        }))
      ),
    };
    // this.state = arrayToObject(
    //   this._dps.map(({ code }) => ({
    //     [code]: store.getState().dpState[code],
    //   }))
    // );
  }

  componentDidMount() {
    TYSdk.event.on('dpDataChange', this._handleDpDataChange);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dps: nextProps.dps,
      codeState: arrayToObject(
        nextProps.dps.map(({ code }) => ({
          [code]: store.getState().dpState[code],
        }))
      ),
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentWillUnmount() {
    TYSdk.event.off('dpDataChange', this._handleDpDataChange);
  }

  getDataList() {
    const fnMap = {
      value: (value, schema) => scaleNumber(schema.scale, value),
      enum: (value, schema) => Strings[`dp_${schema.code.toLowerCase()}_${value}`] || value,
      bitmap: (value, schema) =>
        Strings.getFaultStrings(schema.code, value) || Strings.getDpLang(schema.code, 0),
    };

    return this.state.dps.map(({ code, unit }) => {
      let value = this.state.codeState[code];
      /**
       * 注: 这里不用 `getLang` 是因为需要在取不到语言包的时候用 `schema` 中的 `unit`
       */
      let unitText = Strings[`dp_${code.toLowerCase()}_unit`] || unit;
      const { devInfo = {} } = store.getState();
      const { type, ...schema } = devInfo.schema[code];
      const valueFn = fnMap[type] || (v => v);
      value = valueFn(value, schema);
      if (code === totalPmCode) {
        // 历史原因需兼容
        const lowCode = code.toLowerCase();
        unitText = value < 1000 ? Strings[`dp_${lowCode}_unit1`] : Strings[`dp_${lowCode}_unit2`];
        value = value < 1000 ? value : (value / 1000).toFixed(2);
      }
      return {
        title: Strings.getDpLang(code),
        unit: unitText,
        value,
        code,
      };
    });
  }

  _handleDpDataChange = data => {
    const cmd = {};
    const codes = Object.keys(data);

    codes.forEach(code => {
      if (typeof this.state.codeState[code] !== 'undefined') {
        cmd[code] = data[code];
      }
    });

    if (Object.keys(cmd).length > 0) {
      this.setState(cmd);
    }
  };

  render() {
    const rowNum = Math.ceil(this.state.dps.length / 2);
    return (
      <GridLayout style={styles.container} rowNum={rowNum} data={this.getDataList()}>
        {({ key, title, value, unit, code }, allData) => {
          const dataLen = allData.length;
          const showBorderBottom =
            key === dataLen - 1 || (dataLen % 2 === 0 && key === dataLen - 2);
          return (
            <View
              key={key}
              accessibilityLabel={`HomeScene_StatView_${camelCase(code, {
                pascalCase: true,
              })}`}
              style={styles.grid}
            >
              <View style={styles.content}>
                <Text style={styles.text}>{title}</Text>
                <View style={styles.bottomText}>
                  <Text numberOfLines={1} style={styles.text__value}>
                    {value === '' ? '--' : value}
                  </Text>
                  <Text numberOfLines={1} style={styles.text__unit}>
                    {value === '' ? '' : unit}
                  </Text>
                </View>
              </View>

              {/* BORDERS */}
              <View style={styles.border__top} />
              <View style={styles.border__right} />
              {showBorderBottom && <View style={styles.border__bottom} />}
            </View>
          );
        }}
      </GridLayout>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: cy(16),
  },

  grid: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: cy(16),
  },

  border__top: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  border__bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  border__right: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
  },

  text: {
    fontSize: Math.max(12, cx(12)),
    color: '#fff',
  },

  bottomText: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: cy(12),
  },

  text__value: {
    fontSize: cx(32),
    color: '#fff',
  },

  text__unit: {
    marginBottom: cy(5),
    fontSize: cx(16),
    color: '#fff',
  },
});

export default connect(({ dpState }) => ({
  totalPm: dpState[totalPmCode],
}))(HomeStatView);
