import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { commonConfig, cameraData, commonClick } from '@config';
import { actions } from '@models';
import { TYIpcNative } from '@tuya/tuya-panel-ipc-sdk';
import { TYText } from 'tuya-panel-kit';
import Strings from '@i18n';

const { cx, cy } = commonConfig;

interface FullClarityChange {}

const FullClarityChange: React.FC<FullClarityChange> = (props: FullClarityChange) => {
  const ipcCommonState = useSelector((state: any) => state.ipcCommonState);
  const dispatch = useDispatch();
  const closeMask = () => {
    dispatch(
      actions.ipcCommonActions.showSelfFullClarityModal({
        showSelfFullClarityModal: false,
      })
    );
  };

  const changeClarity = (types: string) => {
    if (ipcCommonState.clarityStatus === types) {
      TYIpcNative.showToast(Strings.getLang('hasCurrentClarity'));
      return false;
    }
    commonClick.changeClarityAndAudio(types);
    dispatch(
      actions.ipcCommonActions.showSelfFullClarityModal({
        showSelfFullClarityModal: false,
      })
    );
  };

  const pressClarityBox = () => {
    return false;
  };

  return (
    <TouchableOpacity
      style={ipcCommonState.showSelfFullClarityModal ? styles.clarityPage : styles.clarityEmpty}
      onPress={closeMask}
    >
      <TouchableOpacity style={styles.clarityBox} onPress={pressClarityBox} activeOpacity={1}>
        {cameraData.fullClarityType.map((item: any) => (
          <TouchableOpacity
            style={styles.textBox}
            activeOpacity={0.7}
            key={item.type}
            onPress={() => {
              changeClarity(item.type);
            }}
          >
            <TYText style={styles.clarityText} numberOfLines={1}>
              {cameraData.decodeClarityStatusString[item.type]}
            </TYText>
          </TouchableOpacity>
        ))}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  clarityPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  clarityEmpty: {
    width: 0,
    height: 0,
  },
  clarityBox: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBox: {
    justifyContent: 'center',
    alignItems: 'center',
    height: cy(40),
  },
  clarityText: {
    fontSize: cx(14),
    color: '#fff',
  },
});

export default FullClarityChange;
