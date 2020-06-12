/* eslint-disable react/require-default-props */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import _ from 'lodash';
import PropTypes from 'prop-types';
import CameraManager from '../../nativeComponents/cameraManager';
import PtzCommon from '../../publicComponents/ptzCommon';
import Res from '../../../res';
import ZoomCommon from '../../publicComponents/zoomCommon';
import { getPanelOpacity } from '../../../utils/panelStatus';
import Config from '../../../config';
import { store } from '../../../main';

const { smallScreen, middlleScreen, is7Plus } = Config;

const { zoomCircleBgImg } = Res.ptzZoomNormal;

class PtzZoom extends React.Component {
  static propTypes = {
    zoom: PropTypes.string,
    isAndriodFullScreenNavMode: PropTypes.bool.isRequired,
    panelItemActiveColor: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      ptzData: [
        { key: 'up', imageSource: Res.ptzZoomNormal.circleHoverUp, hasPtz: true },
        { key: 'right', imageSource: Res.ptzZoomNormal.circleHoverRight, hasPtz: true },
        { key: 'left', imageSource: Res.ptzZoomNormal.circleHoverLeft, hasPtz: true },
        { key: 'down', imageSource: Res.ptzZoomNormal.circleHoverDown, hasPtz: true },
      ],
      hoverKey: -1,
    };
  }
  componentDidMount() {
    const { devInfo } = store.getState();
    const { schema } = devInfo;
    const ptzSchema = schema.ptz_control;
    const ptz = ptzSchema.range;
    const oldPtzData = this.state.ptzData;
    const hasTop = _.indexOf(ptz, '0');
    const hasBottom = _.indexOf(ptz, '4');
    const hasLeft = _.indexOf(ptz, '6');
    const hasRight = _.indexOf(ptz, '2');
    if (hasTop !== -1) {
      oldPtzData[0].hasPtz = true;
    }
    if (hasRight !== -1) {
      oldPtzData[1].hasPtz = true;
    }
    if (hasLeft !== -1) {
      oldPtzData[2].hasPtz = true;
    }
    if (hasBottom !== -1) {
      oldPtzData[3].hasPtz = true;
    }
    this.setState({
      ptzData: oldPtzData,
    });
  }
  changePressIn = index => {
    this.setState({
      hoverKey: index,
    });
    if (index === 0) {
      CameraManager.startPtzUp();
    } else if (index === 1) {
      CameraManager.startPtzRight();
    } else if (index === 2) {
      CameraManager.startPtzLeft();
    } else if (index === 3) {
      CameraManager.startPtzDown();
    }
  };
  changePressOut = () => {
    this.setState({
      hoverKey: -1,
    });
    CameraManager.stopPtz();
  };

  render() {
    const { ptzData, hoverKey } = this.state;
    const { zoom, isAndriodFullScreenNavMode, panelItemActiveColor } = this.props;
    let pieSize = isAndriodFullScreenNavMode ? 200 : 170;
    let scaleSize = isAndriodFullScreenNavMode ? 50 : 45;
    if (smallScreen) {
      pieSize = 130;
      scaleSize = 40;
    } else if (middlleScreen) {
      if (is7Plus) {
        pieSize = 200;
        scaleSize = 50;
      } else {
        pieSize = 170;
        scaleSize = 45;
      }
    }
    return (
      <View style={styles.ptzZoomPage}>
        <PtzCommon
          pieWidth={pieSize}
          pieHeight={pieSize}
          disabled={!getPanelOpacity()}
          activeKey={hoverKey}
          pieData={ptzData}
          containerBgImg={Res.ptzZoomNormal.ptzBgImg}
          cirleImg={Res.ptzZoomNormal.circleImg}
          ptzDotImg={Res.ptzZoomNormal.ptzDot}
          pressOut={this.changePressOut}
          pressIn={this.changePressIn}
          panelItemActiveColor={panelItemActiveColor}
        />
        {zoom !== undefined && (
          <View style={styles.zoomBox}>
            <ZoomCommon
              zoomBg={zoomCircleBgImg}
              disabled={!getPanelOpacity()}
              iconWidth={scaleSize}
              iconHeight={scaleSize}
              panelItemActiveColor={panelItemActiveColor}
            />
          </View>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  ptzZoomPage: {
    flex: 1,
  },
  zoomBox: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
});

export default PtzZoom;
