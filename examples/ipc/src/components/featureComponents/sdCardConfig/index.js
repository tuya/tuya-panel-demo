/* eslint-disable camelcase */
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TYText, TYSectionList, TYSdk } from 'tuya-panel-kit';
import { showSelfSdDialog } from '../../../redux/modules/ipcCommon';
import MiddleTitle from '../../publicComponents/selfDialog/title';
import MiddleFooter from '../../publicComponents/selfDialog/footer';
import Strings from '../../../i18n';
import Res from '../../../res';
import Config from '../../../config';
import { requestTimeout, cancelRequestTimeOut } from '../../../utils';

const { cx, topBarHeight, statusBarHeight, winWidth } = Config;

const TYEvent = TYSdk.event;
const TYNative = TYSdk.native;
const TYDevice = TYSdk.device;

class SdCardConfig extends React.Component {
  static propTypes = {
    record_switch: PropTypes.bool,
    record_mode: PropTypes.string,
    showSelfSdDialog: PropTypes.func.isRequired,
  };
  static defaultProps = {
    record_switch: false,
    record_mode: '',
  };
  constructor(props) {
    super(props);
    this.state = {
      sectionList: [],
      recordeSwitch: props.record_switch,
      recordeMode: props.record_mode,
    };
  }

  componentDidMount() {
    this.changeSectionList(this.props);
    TYEvent.on('deviceDataChange', this.dpChange);
  }
  componentWillReceiveProps(props) {}

  componentWillUnmount() {
    TYEvent.off('deviceDataChange', this.dpChange);
  }
  onCancel = () => {
    this.props.showSelfSdDialog({
      showSelfSdDialog: false,
    });
  };
  onConfirm = () => {
    const { recordeSwitch, recordeMode } = this.state;
    const senObj = {
      record_switch: recordeSwitch,
    };
    if (recordeMode !== '') {
      senObj.record_mode = recordeMode;
    }
    TYNative.showLoading({ title: '' });
    TYDevice.putDeviceData(senObj);
    requestTimeout();
  };
  dpChange = data => {
    const changedp = data.payload;
    if (changedp.record_switch !== undefined) {
      this.props.showSelfSdDialog({
        showSelfSdDialog: false,
      });
      TYNative.hideLoading();
      cancelRequestTimeOut();
    }
  };
  changeSectionList = () => {
    const { recordeSwitch, recordMode } = this.state;
    const sectionList = [
      {
        data: [
          {
            key: 'sdSwitch',
            title: Strings.getLang('sd_initial_switch'),
            value: recordeSwitch,
            onValueChange: value => this.changeValue('sdSwitch', value),
          },
        ],
      },
    ];

    if (recordMode !== '') {
      sectionList.push({
        title: Strings.getLang('sd_initial_mode'),
        data: [
          {
            key: 'sdEvent',
            title: Strings.getLang('sd_initial_event'),
          },
          {
            key: 'sdContinuous',
            title: Strings.getLang('sd_initial_continuous'),
          },
        ],
      });
    }
    this.setState({
      sectionList,
    });
  };
  changeValue = (key, value) => {
    let { recordeSwitch, recordeMode } = this.state;
    if (key === 'sdSwitch') {
      recordeSwitch = value;
    } else if (key === 'videoMode') {
      recordeMode = value;
    }
    this.setState(
      {
        recordeSwitch,
        recordeMode,
      },
      () => {
        this.changeSectionList();
      }
    );
  };
  renderVideoMode = key => {
    const { recordeMode } = this.state;
    return (
      <View style={{ height: 25 }}>
        {((recordeMode === '1' && key === 'sdEvent') ||
          (recordeMode === '2' && key === 'sdContinuous')) && (
          <Image source={Res.publicImage.checkCircle} style={styles.checkImg} />
        )}
      </View>
    );
  };

  renderItem = ({ item, index }) => {
    const { key, ...itemProps } = item;
    return (
      <View>
        {key === 'sdSwitch' && <TYSectionList.SwitchItem {...item} />}
        {(key === 'sdEvent' || key === 'sdContinuous') && (
          <TYSectionList.Item
            Action={this.renderVideoMode(key)}
            onPress={() => this.changeValue('videoMode', key === 'sdEvent' ? '1' : '2')}
            {...itemProps}
          />
        )}
      </View>
    );
  };
  renderSectionHeader = section => {
    const { title } = section.section;
    return (
      <View style={styles.sectionHeader}>
        {title ? <TYText style={styles.sectionText}>{title}</TYText> : null}
      </View>
    );
  };
  render() {
    const { sectionList } = this.state;
    return (
      <View style={styles.sdCardConfigPage}>
        <View style={styles.dialogBox}>
          <MiddleTitle title={Strings.getLang('sd_initial_title')} />
          <TYSectionList
            style={{ alignSelf: 'stretch', marginTop: 0 }}
            scrollEnabled={false}
            contentContainerStyle={styles.sectionContain}
            renderSectionHeader={this.renderSectionHeader}
            sections={sectionList}
            renderItem={this.renderItem}
            separatorStyle={{ height: 0 }}
          />
          <MiddleFooter onCancel={this.onCancel} onConfirm={this.onConfirm} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  sdCardConfigPage: {
    position: 'absolute',
    top: -(topBarHeight + statusBarHeight),
    left: 0,
    right: 0,
    bottom: -(topBarHeight + statusBarHeight),
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogBox: {
    width: winWidth * 0.85,
    backgroundColor: '#fff',
    borderRadius: 10,
    minHeight: 100,
  },
  sectionContain: {
    paddingBottom: cx(15),
    backgroundColor: '#fff',
  },
  sectionHeader: {
    paddingLeft: 15,
  },
  sectionText: {
    height: 30,
    color: '#999999',
    fontSize: cx(14),
  },
});

const mapStateToProps = state => {
  const { record_switch, record_mode } = state.dpState;
  return {
    record_switch,
    record_mode,
  };
};

const mapToDisPatch = dispatch => {
  return bindActionCreators({ showSelfSdDialog }, dispatch);
};

export default connect(mapStateToProps, mapToDisPatch)(SdCardConfig);
