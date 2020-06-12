import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { TYText, IconFont } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import Config from '../../../config';
import CameraManager from '../../nativeComponents/cameraManager';
import Res from '../../../res';
import Strings from '../../../i18n';
import icon from '../../../res/iconfont.json';
import { gotoCloudH5PurcharsePage } from '../../../config/click';
import TYSdk from '../../../api/index';

const { cx, winWidth } = Config;
const TYNative = TYSdk.native;

class ReBuyCloudData extends React.Component {
  static propTypes = {
    closeTip: PropTypes.func.isRequired,
    uuid: PropTypes.string.isRequired,
    homeId: PropTypes.number.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {};
  }

  getH5CloudUrl = () => {
    const { uuid, homeId } = this.props;
    const { lang } = TYNative.mobileInfo;
    TYSdk.getDomainUrl()
      .then(data => {
        const urlData = data[0];
        const h5Url = `https://${urlData.appDomain}?lang=${lang}&homeId=${homeId}&deviceId=${uuid}&serveType=cloud_storage`;
        gotoCloudH5PurcharsePage(h5Url);
      })
      .catch(err => {
        CameraManager.showTip(Strings.getLang('cloudRequestError'));
      });
  };
  closeTip = () => {
    this.props.closeTip();
  };
  render() {
    return (
      <View style={styles.reBuyCloudDataPage}>
        <Image source={Res.tabCloudStorage.tipIcon} style={styles.leftIcon} />
        <View style={styles.reBuyContent}>
          <TYText style={styles.reBuyTitle}>{Strings.getLang('cloud_storage_expired_txt')}</TYText>
          <TouchableOpacity onPress={this.getH5CloudUrl} activeOpacity={0.7}>
            <TYText style={styles.reBuyAdress}>
              {Strings.getLang('cloud_storage_button_renew')}
            </TYText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.closeTipBox} activeOpacity={0.7} onPress={this.closeTip}>
          <IconFont d={icon.close} size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  reBuyCloudDataPage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: winWidth * 0.95,
    minHeight: cx(70),
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    paddingHorizontal: cx(10),
    paddingVertical: cx(10),
    flexDirection: 'row',
  },
  leftIcon: {
    top: cx(4),
    width: cx(30),
    resizeMode: 'contain',
  },
  reBuyContent: {
    flex: 1,
    paddingLeft: cx(5),
    paddingRight: cx(10),
  },
  reBuyTitle: {
    lineHeight: cx(16),
    color: '#fff',
    marginBottom: cx(8),
    fontSize: cx(16),
  },
  reBuyAdress: {
    color: '#0091FF',
    fontSize: cx(16),
  },
  closeTipBox: {
    top: cx(4),
    width: cx(30),
    height: 18,
  },
});

const mapStateToProps = state => {
  const { productId, uuid, devId, homeId } = state.devInfo;
  return {
    productId,
    uuid,
    devId,
    homeId,
  };
};

export default connect(mapStateToProps, null)(ReBuyCloudData);
