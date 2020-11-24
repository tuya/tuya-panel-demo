import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet, ViewPropTypes } from 'react-native';
import BoolView from './boolView';
import ValueView from './valueView';
import EnumView from './enumView';
import StringView from './stringView';
import RawView from './rawView';
import BitView from './bitView';
import DpInfoView from './dpInfoView';
import { updateDp } from '../redux/modules/common';

export default class DpItemView extends Component {
  static propTypes = {
    style: ViewPropTypes.style,
    dpSchema: PropTypes.object.isRequired,
    uiConfig: PropTypes.object.isRequired,
    dispatch: PropTypes.any.isRequired,
    dpState: PropTypes.any.isRequired,
  };

  static defaultProps = {
    style: null,
  };

  constructor(props) {
    super(props);
    this.onChangeHandle = this.onChangeHandle.bind(this);

    this.state = {};
  }

  shouldComponentUpdate(nextProps) {
    return this.props.dpState !== nextProps.dpState;
  }

  onChangeHandle(value) {
    const { code } = this.props.dpSchema;
    this.props.dispatch(updateDp({ [code]: value }));
  }

  // eslint-disable-next-line
  readonly(mode) {
    return mode === 'ro';
    // return false; // 只上报也让可以下发, 用于可能需要的调试测试
  }

  render() {
    const { dpSchema, dpState } = this.props;
    return (
      <View style={[styles.container, this.props.style]}>
        <DpInfoView dpSchema={dpSchema} />
        {dpSchema.type === 'bool' && (
          <BoolView
            style={styles.itemView}
            readonly={this.readonly(dpSchema.mode)}
            value={dpState}
            onValueChange={this.onChangeHandle}
          />
        )}
        {dpSchema.type === 'value' && (
          <ValueView
            style={styles.itemView}
            readonly={this.readonly(dpSchema.mode)}
            max={dpSchema.max}
            min={dpSchema.min}
            step={dpSchema.step}
            value={dpState}
            onChange={this.onChangeHandle}
          />
        )}
        {dpSchema.type === 'enum' && (
          <EnumView
            style={styles.itemView}
            readonly={this.readonly(dpSchema.mode)}
            values={this.props.uiConfig.attr}
            selected={dpState}
            onChange={this.onChangeHandle}
          />
        )}
        {dpSchema.type === 'string' && (
          <StringView
            style={styles.itemView}
            readonly={this.readonly(dpSchema.mode)}
            value={dpState}
            onChange={this.onChangeHandle}
          />
        )}
        {dpSchema.type === 'raw' && (
          <RawView
            style={styles.itemView}
            readonly={this.readonly(dpSchema.mode)}
            value={dpState}
            onChange={this.onChangeHandle}
          />
        )}
        {dpSchema.type === 'bitmap' && (
          <BitView
            style={styles.itemView}
            readonly={this.readonly(dpSchema.mode)}
            values={this.props.uiConfig.attr}
            value={dpState}
            label={dpSchema.label}
            onChange={this.onChangeHandle}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderColor: 'red',
    borderRadius: 2,
    borderWidth: 0,
  },

  itemView: {},
});
