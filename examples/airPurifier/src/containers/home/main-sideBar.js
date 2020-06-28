import camelCase from 'camelcase';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import color from 'color';
import _map from 'lodash/map';
import _pickBy from 'lodash/pickBy';
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import { Utils } from 'tuya-panel-kit';
import TYSdk from '../../api';
import dpCodes from '../../config/dpCodes';
import Button from '../../components/Button';
import { arrayToObject } from '../../utils';
import icons from '../../res/iconfont.json';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

const {
  anion: anionCode,
  childLock: childLockCode,
  light: lightCode,
  uv: uvCode,
  wet: wetCode,
} = dpCodes;

class SideBar extends Component {
  static propTypes = {
    anion: PropTypes.bool,
    childLock: PropTypes.bool,
    light: PropTypes.bool,
    uv: PropTypes.bool,
    wet: PropTypes.bool,
  };

  static defaultProps = {
    anion: false,
    childLock: false,
    light: false,
    uv: false,
    wet: false,
  };
  constructor(props) {
    super(props);
    this.state = {
      anion: props.anion,
      childLock: props.childLock,
      light: props.light,
      uv: props.uv,
      wet: props.wet,
    };
  }

  componentDidMount() {
    TYSdk.event.on('dpDataChange', this._handleDpDataChange);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      anion: nextProps.anion,
      childLock: nextProps.childLock,
      light: nextProps.light,
      uv: nextProps.uv,
      wet: nextProps.wet,
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentWillUnmount() {
    TYSdk.event.off('dpDataChange', this._handleDpDataChange);
  }

  _handleDpDataChange = data => {
    const cmd = {};
    const codes = Object.keys(data);

    codes.forEach(code => {
      if (typeof this.state[code] !== 'undefined') {
        cmd[code] = data[code];
      }
    });

    if (Object.keys(cmd).length > 0) {
      this.setState(cmd);
    }
  };

  render() {
    const visibleState = _pickBy(this.state, v => v);
    return (
      <View style={styles.container}>
        {_map(visibleState, (value, code) => (
          <Button
            key={code}
            accessibilityLabel={`HomeScene_SideBar_${camelCase(code, {
              pascalCase: true,
            })}`}
            style={styles.btn}
            size={16}
            icon={icons[camelCase(code)]}
            iconColor="#fff"
            iconStyle={[styles.icon, { backgroundColor: 'rgba(255,255,255,.1)' }]}
          />
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: cx(36),
    right: cx(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: cy(12),
  },

  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: cx(24),
    height: cx(24),
    borderRadius: cx(12),
  },
});

export default connect(({ dpState }) => ({
  anion: dpState[anionCode],
  childLock: dpState[childLockCode],
  uv: dpState[uvCode],
  wet: dpState[wetCode],
  light: dpState[lightCode],
}))(SideBar);
