import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import CameraTopList from './cameraTopList';
import SwitchDialog from '../publicComponents/switchDialog';
import CustomDialog from '../publicComponents/customDialog';

class NormalPlayFeature extends React.Component {
  static propTypes = {
    showPopCommon: PropTypes.bool.isRequired,
    showCustomDialog: PropTypes.bool.isRequired,
    popData: PropTypes.object.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { showPopCommon, showCustomDialog, popData } = this.props;
    return (
      <View style={styles.normalPlayPage}>
        <CameraTopList />
        {/* 这里将pop组成封装,根据传入值得不同【‘mode’, 'cloud'】两种模式，分别弹出不同的值  */}
        {showPopCommon && <SwitchDialog dataSource={popData} />}
        {showCustomDialog && <CustomDialog dataSource={popData} />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  normalPlayPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});

const mapStateToProps = state => {
  const { showPopCommon, showCustomDialog, popData } = state.ipcCommonState;
  return {
    showPopCommon,
    showCustomDialog,
    popData,
  };
};

export default connect(mapStateToProps, null)(NormalPlayFeature);
