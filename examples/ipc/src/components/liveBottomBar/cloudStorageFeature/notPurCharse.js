/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import Strings from '../../../i18n';
import Config from '../../../config';
import CameraManager from '../../nativeComponents/cameraManager';
import { gotoCloudH5PurcharsePage } from '../../../config/click';
import TYSdk from '../../../api';

const { cx } = Config;

const TYNative = TYSdk.native;

class NotPurCharse extends React.Component {
  static propTypes = {
    // h5Url: PropTypes.string.isRequired,
    panelItemActiveColor: PropTypes.string.isRequired,
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

  render() {
    const { panelItemActiveColor } = this.props;
    return (
      <View style={styles.notPurCharsePage}>
        <View style={styles.notPurCharseContain}>
          <TYText style={styles.cloudTitle}>{Strings.getLang('cloud_storage_title')}</TYText>
          <TYText style={styles.cloudSubTitle}>{Strings.getLang('cloud_storage_tip')}</TYText>
          <TouchableOpacity
            onPress={this.getH5CloudUrl}
            activeOpacity={0.9}
            style={[styles.buyTextBox, { backgroundColor: panelItemActiveColor }]}
          >
            <TYText style={styles.buyText} numberOfLines={1}>
              {Strings.getLang('cloud_storage_purchase')}
            </TYText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  notPurCharsePage: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notPurCharseContain: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: cx(15),
  },
  cloudTitle: {
    textAlign: 'center',
    fontSize: cx(22),
    fontWeight: '800',
    marginBottom: 10,
  },
  cloudSubTitle: {
    textAlign: 'center',
    color: '#c0c0c0',
    fontSize: cx(16),
    marginBottom: cx(15),
  },
  buyTextBox: {
    minWidth: 100,
    paddingHorizontal: cx(30),
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 44,
  },
  buyText: {
    fontSize: cx(16),
    color: '#fff',
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

export default connect(mapStateToProps, null)(NotPurCharse);
