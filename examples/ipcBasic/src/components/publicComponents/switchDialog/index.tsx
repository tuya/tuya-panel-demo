import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { actions } from '@models';
import { Popup, TYSdk } from 'tuya-panel-kit';
import { useDispatch } from 'react-redux';
import { requestTimeout, cancelRequestTimeOut } from '@utils';
import { commonClick } from '@config';
import SelectValue from './selectValue';

const TYNative = TYSdk.native;
const TYDevice = TYSdk.device;
const TYEvent = TYSdk.event;

interface SwitchDialogProps {
  dataSource: any;
}

const SwitchDialog: React.FC<SwitchDialogProps> = (props: SwitchDialogProps) => {
  const { dataSource } = props;
  const dispatch = useDispatch();
  const [changData] = useState(dataSource.showData);

  const dpChange = (data: any) => {
    const changedp = data.payload;
    const { mode } = dataSource;
    if (changedp[mode] !== undefined) {
      cancelRequestTimeOut();
      dispatch(
        actions.ipcCommonActions.showPopCommon({
          showPopCommon: false,
        })
      );
      Popup.close();
    }
  };
  useEffect(() => {
    openDialog();
    TYEvent.on('deviceDataChange', dpChange);
    return () => {
      TYEvent.off('deviceDataChange', dpChange);
    };
  }, []);

  const onConfirm = (value: any) => {
    const { mode } = dataSource;
    if (mode === 'videoResolution') {
      dispatch(
        actions.ipcCommonActions.showPopCommon({
          showPopCommon: false,
        })
      );
      Popup.close();
      commonClick.changeClarityAndAudio(value);
    } else if (mode === 'generalTheme') {
      console.log('sdjsdhhs', value);
      commonClick.changeThemeState(value);
      dispatch(
        actions.ipcCommonActions.showPopCommon({
          showPopCommon: false,
        })
      );
      Popup.close();
    } else {
      TYNative.showLoading({ title: '' });
      TYDevice.putDeviceData({
        [mode]: value,
      });
      requestTimeout();
    }
  };

  const openDialog = () => {
    const { title, mode } = dataSource;
    Popup.custom(
      {
        content: <SelectValue showData={changData} mode={mode} onConfirm={onConfirm} />,
        title: title !== '' ? title : <View style={{ height: 0 }} />,
        footer: <View style={{ height: 0 }} />,
      },
      {
        onMaskPress: () => {
          dispatch(
            actions.ipcCommonActions.showPopCommon({
              showPopCommon: false,
            })
          );
          Popup.close();
        },
      }
    );
  };
  return null;
};
export default SwitchDialog;
