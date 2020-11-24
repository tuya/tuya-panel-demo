import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, ViewPropTypes } from 'react-native';

import { Button } from 'tuya-panel-kit';
import { clearConsole } from '../redux/modules/common';

export default class ConsoleLayout extends Component {
  static propTypes = {
    style: ViewPropTypes.style,
    logs: PropTypes.array,
    dispatch: PropTypes.func.isRequired,
  };

  static defaultProps = {
    style: null,
    logs: [],
  };

  constructor(props) {
    super(props);
    this._renderRow = this._renderRow.bind(this);
    this.tapCodeBtn = this.tapCodeBtn.bind(this);

    this.state = {
      code: false,
    };
  }

  tapCodeBtn() {
    this.setState({ code: !this.state.code });
  }

  _renderRow(v, k) {
    const strFlag = v.isSend ? '\t<发送>\t' : '\t<接收>\t';
    const color = v.isSend ? '#F5A623' : '#5FB336';
    const content = this.state.code ? v.strCodes : v.strIds;
    return (
      <Text key={k} style={[styles.item, { color }]}>
        {v.time}
        {strFlag}
        {content}
      </Text>
    );
  }

  doClear = () => {
    this.props.dispatch(clearConsole());
  };

  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <ScrollView
          ref={scrollView => {
            this._scrollView = scrollView;
          }}
          style={[styles.list]}
        >
          {this.props.logs.map((v, k) => this._renderRow(v, k))}
        </ScrollView>

        <Button
          wrapperStyle={{ alignSelf: 'flex-end' }}
          style={styles.clear}
          onPress={this.doClear}
        >
          <Text style={styles.clearText}>CLEAR</Text>
        </Button>

        <Button
          wrapperStyle={{ alignSelf: 'flex-end' }}
          style={[styles.format, this.state.code ? { backgroundColor: '#F5A623' } : null]}
          onPress={this.tapCodeBtn}
        >
          <Text style={styles.clearText}>CODE</Text>
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#303A4B',
  },

  clear: {
    borderWidth: 1,
    borderColor: '#303A4B',
    borderRadius: 3,
    padding: 5,
    right: 15,
    bottom: 10,
    position: 'absolute',
  },

  format: {
    borderWidth: 1,
    borderColor: '#303A4B',
    borderRadius: 3,
    padding: 5,
    right: 70,
    bottom: 10,
    position: 'absolute',
  },

  clearText: {
    backgroundColor: 'transparent',
    fontSize: 12,
    color: '#303A4B',
  },

  list: {
    flex: 1,
    overflow: 'hidden',
    marginVertical: 1,
  },

  item: {
    fontSize: 10,
    marginHorizontal: 2,
    marginTop: 5,
  },
});
