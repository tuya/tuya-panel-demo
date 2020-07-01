import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Popup, TYSdk } from 'tuya-panel-kit';
import { showPopCommon } from '../../../redux/modules/ipcCommon';
import SelectValue from './selectValue';
// import Footer from './footer';
import { enableHd } from '../../../config/click';
import { requestTimeout, cancelRequestTimeOut } from '../../../utils';

const TYEvent = TYSdk.event;
const TYNative = TYSdk.native;
const TYDevice = TYSdk.device;

class switchDialog extends React.Component {
  static propTypes = {
    dataSource: PropTypes.object.isRequired,
    showPopCommon: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      changData: props.dataSource.showData,
    };
  }
  componentDidMount() {
    this.openDialog();
    TYEvent.on('deviceDataChange', this.dpChange);
  }
  componentWillUnmount() {
    TYEvent.off('deviceDataChange', this.dpChange);
  }
  onConfirm = value => {
    const { dataSource } = this.props;
    const { mode } = dataSource;
    if (mode === 'videoResolution') {
      this.props.showPopCommon({
        showPopCommon: false,
      });
      Popup.close();
      enableHd(value);
    } else {
      TYNative.showLoading({ title: '' });
      TYDevice.putDeviceData({
        [mode]: value,
      });
      requestTimeout();
    }
  };
  dpChange = data => {
    const { dataSource } = this.props;
    const { mode } = dataSource;
    const changedp = data.payload;
    if (changedp[mode] !== undefined) {
      TYNative.hideLoading();
      cancelRequestTimeOut();
      this.props.showPopCommon({
        showPopCommon: false,
      });
      Popup.close();
    }
  };

  openDialog = () => {
    const { dataSource } = this.props;
    const { title, mode } = dataSource;
    const { changData } = this.state;
    Popup.custom(
      {
        content: <SelectValue showData={changData} mode={mode} onConfirm={this.onConfirm} />,
        title: title !== '' ? title : <View style={{ height: 0 }} />,
        footer: <View style={{ height: 0 }} />,
      },
      {
        onMaskPress: () => {
          this.props.showPopCommon({
            showPopCommon: false,
          });
          Popup.close();
        },
      }
    );
  };
  render() {
    return <View />;
  }
}

const mapStateToProps = state => {
  const { clarityStatus } = state.ipcCommonState;
  return {
    clarityStatus,
  };
};
const mapToDisPatch = dispatch => {
  return bindActionCreators({ showPopCommon }, dispatch);
};
export default connect(mapStateToProps, mapToDisPatch)(switchDialog);
