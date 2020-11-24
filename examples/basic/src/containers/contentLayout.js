import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ListView, ViewPropTypes, StyleSheet } from 'react-native';
import { store } from '../main';
import DpItemView from '../components/dpItemView';

const camelize = str => {
  if (typeof str === 'number') {
    return `${str}`;
  }

  const ret = str.replace(/[-_\s]+(.)?/g, (match, chr) => (chr ? chr.toUpperCase() : ''));
  // Ensure 1st char is always lowercase
  return ret.substr(0, 1).toLowerCase() + ret.substr(1);
};

export default class ContentLayout extends Component {
  static propTypes = {
    style: ViewPropTypes.style,
    dispatch: PropTypes.func.isRequired,
    dpData: PropTypes.object,
  };

  static defaultProps = {
    style: null,
    dpData: {
      schema: [],
      state: {},
    },
  };

  constructor(props) {
    super(props);

    this._renderRow = this._renderRow.bind(this);
    // eslint-disable-next-line
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => true });

    this.state = {
      dataSource: ds.cloneWithRows(props.dpData.schema),
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(nextProps.dpData.schema),
    });
  }

  _renderRow(rowData) {
    const strKey = `dp_${rowData.code}`;
    const key = camelize(strKey);

    return (
      <DpItemView
        style={styles.item}
        key={rowData.code}
        dpState={this.props.dpData.state[rowData.code]}
        dispatch={this.props.dispatch}
        dpSchema={rowData}
        uiConfig={this.props.dpData.uiConfig[key]}
      />
    );
  }

  render() {
    if (_.isEmpty(this.props.dpData.state)) {
      return null;
    }

    return (
      <ListView
        style={this.props.style}
        dataSource={this.state.dataSource}
        renderRow={this._renderRow}
        enableEmptySections={true}
      />
    );
  }
}

const styles = StyleSheet.create({
  item: {
    marginVertical: 5,
  },
});
