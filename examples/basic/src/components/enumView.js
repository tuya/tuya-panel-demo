import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Text, Image, TouchableOpacity, View, StyleSheet, ViewPropTypes } from 'react-native';
import _ from 'lodash';
import { TYSdk } from 'tuya-panel-kit';

const TYNative = TYSdk.native;

const Strings = require('../i18n');

const Res = {
  selectIcon: require('../res/tuya_select_icon.png'),
};

export default class EnumView extends Component {
  static propTypes = {
    style: ViewPropTypes.style,
    values: PropTypes.object.isRequired,
    selected: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    readonly: PropTypes.bool,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    style: null,
    onChange: null,
    readonly: false,
  };

  constructor(props) {
    super(props);
    this.onPressHandle = this._onPressHandle.bind(this);

    this.state = {
      selected: props.selected,
      strValues: this.parseStrValues(props.values),
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      selected: nextProps.selected,
      strValues: this.parseStrValues(nextProps.values),
    });
  }

  componentWillUpdate() {}

  parseStrValues(values) {
    const strValues = {};
    Object.keys(values).forEach(k => {
      strValues[k] = Strings[values[k]] ? Strings[values[k]] : values[k];
    });
    return strValues;
  }

  _onPressHandle() {
    if (this.props.readonly) return;
    const { selected, strValues } = this.state;
    TYNative.bottomListDialog(Object.values(strValues), strValues[selected], value => {
      const p = _.findKey(strValues, o => o === value);
      if (p) {
        this.setState({ selected: p });
        if (this.props.onChange) this.props.onChange(p);
      }
    });
  }

  render() {
    const { readonly } = this.props;
    const { selected, strValues } = this.state;

    return (
      <TouchableOpacity style={this.props.style} activeOpacity={0.8} onPress={this.onPressHandle}>
        <View style={[styles.container, readonly ? { opacity: 0.5 } : null]}>
          <Text style={styles.text}>{strValues[selected]}</Text>
          {!readonly && <Image style={styles.icon} source={Res.selectIcon} />}
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: 150,
    height: 36,
    borderColor: '#DDDDDD',
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  text: {
    flex: 1,
    fontSize: 14,
    color: '#303030',
    marginHorizontal: 10,
  },

  icon: {
    alignItems: 'flex-end',
    margin: 10,
  },
});
