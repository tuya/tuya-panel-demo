import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';
import { TYText } from 'tuya-panel-kit';
import { actions } from '@models';
import { commonConfig, commonClick, cameraData } from '@config';

const { cx, isIOS, cy, listHight } = commonConfig;

interface NormalFeatureTopLeftProps {}

const NormalFeatureTopLeft: React.FC<NormalFeatureTopLeftProps> = (
  props: NormalFeatureTopLeftProps
) => {
  const dispatch = useDispatch();
  const ipcCommonState = useSelector((state: any) => state.ipcCommonState);

  const popResolution = () => {
    if (commonClick.isRecordingNow() || commonClick.isMicTalking()) {
      return false;
    }
    const sendResolutionData = commonClick.resolutionData(ipcCommonState.clarityStatus);
    dispatch(
      actions.ipcCommonActions.popData({
        popData: sendResolutionData,
      })
    );
    dispatch(
      actions.ipcCommonActions.showPopCommon({
        showPopCommon: true,
      })
    );
  };

  const renderClarity = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.menuClarity}
        onPress={() => {
          popResolution();
        }}
      >
        <TYText numberOfLines={1} style={styles.videoClass}>
          {cameraData.decodeClarityStatusString[ipcCommonState.clarityStatus]}
        </TYText>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.normalFeatureTopLeftPage}>
      {ipcCommonState.clarityStatus !== 'AUDIO' && renderClarity()}
    </View>
  );
};

const styles = StyleSheet.create({
  normalFeatureTopLeftPage: {
    position: 'absolute',
    top: 0,
    left: cx(15),
    height: listHight,
    alignItems: 'center',
    flexDirection: 'row',
  },
  menuClarity: {
    marginRight: Math.ceil(cx(15)),
  },
  videoClass: {
    fontSize: Math.ceil(cx(12)),
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingHorizontal: Math.ceil(cx(7)),
    paddingVertical: isIOS ? cy(2) : cx(0),
    borderWidth: 2,
    borderColor: '#fff',
    fontWeight: '600',
    borderRadius: 4,
    overflow: 'hidden',
  },
});

export default NormalFeatureTopLeft;
