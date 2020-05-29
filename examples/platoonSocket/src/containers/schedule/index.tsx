import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import { TYSdk, TYFlatList } from 'tuya-panel-kit';
import Strings from '../../i18n';

const TYDevice = TYSdk.device;
const TYNative = TYSdk.native;

interface ScheduleProps {
  switchNames: any;
  data: any;
}

class Schedule extends Component<ScheduleProps> {
  static propTypes = {
    switchNames: PropTypes.object,
    data: PropTypes.array,
  };

  static defaultProps = {
    switchNames: {},
    data: [],
  };

  get datas() {
    const { switchNames, data } = this.props;
    return _.map(data, (dp, key) => {
      const name = switchNames[dp.code] || Strings.getDpLang(dp.code);
      return {
        key,
        title: name,
        value: '',
        arrow: true,
        onPress: () => {
          TYNative.gotoDpAlarm({
            category: `category_${dp.code}`,
            repeat: 0,
            data: [
              {
                dpId: TYDevice.getDpIdByCode(dp.code),
                dpName: name,
                selected: 0,
                rangeKeys: [true, false],
                rangeValues: [true, false].map(v => Strings.getDpLang(dp.code, v)),
              },
            ],
          });
        },
      };
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <TYFlatList style={{ paddingTop: 16 }} data={this.datas} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});

const mapStateToProps = (state: any) => {
  return {
    switchNames: state.socketState.socketNames,
  };
};

export default connect(mapStateToProps, null)(Schedule);
