import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { actions } from '@models';
import { Popup, TYSdk } from 'tuya-panel-kit';
import { useDispatch } from 'react-redux';

interface CustomDialogProps {
  dataSource: any;
}

const CustomDialog: React.FC<CustomDialogProps> = (props: CustomDialogProps) => {
  const { dataSource } = props;
  const [title] = useState(dataSource.title);
  const dispatch = useDispatch();

  useEffect(() => {
    openDialog();
  }, []);

  const openDialog = () => {
    Popup.custom(
      {
        content: dataSource.component,
        title: title !== '' ? title : <View style={{ height: 0 }} />,
        footer: <View />,
      },
      {
        onMaskPress: () => {
          dispatch(
            actions.ipcCommonActions.showCustomDialog({
              showCustomDialog: false,
            })
          );
          Popup.close();
        },
      }
    );
  };
  return null;
};
export default CustomDialog;
