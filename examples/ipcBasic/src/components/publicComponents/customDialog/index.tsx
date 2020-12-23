// import React, { useEffect } from 'react';
// import { View, StyleSheet } from 'react-native';
// import { actions } from '@models';
// import { Popup, TYSdk } from 'tuya-panel-kit';
// import { useSelector, useDispatch } from 'react-redux';
// import { requestTimeout, cancelRequestTimeOut } from '@utils';

// const TYNative = TYSdk.native;

// interface CustomDialogProps {}

// const CustomDialog: React.FC<SwitchDialogProps> = (props: SwitchDialogProps) => {
//   const dispatch = useDispatch();
//   const ipcCommonState = useSelector((state: any) => state.ipcCommonState);
//   const theme = useSelector((state: any) => state.theme);
//   const { type, customTheme } = theme;
//   const themeContentBgc = customTheme[type].contentBgc;
//   useEffect(() => {
//     openDialog();
//   }, []);

//   const onConfirm = value => {
//     const { dataSource } = ipcCommonState;
//     const { mode } = dataSource;
//     if (mode === 'videoResolution') {
//       dispatch(
//         actions.ipcCommonActions.showPopCommon({
//           showPopCommon: false,
//         })
//       );
//       Popup.close();
//       // changeClarityAndAudio(value);
//     } else if (mode === 'generalTheme') {
//       // if (nativeThemeValue === value) {
//       //   return false;
//       // }
//       // changeThemeState(value);
//       // this.props.showPopCommon({
//       //   showPopCommon: false,
//       // });
//       Popup.close();
//     } else {
//       TYNative.showLoading();
//       TYNative.putDpData({
//         [mode]: value,
//       });
//       requestTimeout();
//     }
//   };

//   const openDialog = () => {
//     const { dataSource } = this.props;
//     const { title, mode } = dataSource;
//     const { changData } = this.state;
//     Popup.custom(
//       {
//         content: <SelectValue showData={changData} mode={mode} onConfirm={onConfirm} />,
//         title: title !== '' ? title : <View style={{ height: 0 }} />,
//         footer: <View style={{ height: 0 }} />,
//       },
//       {
//         onMaskPress: () => {
//           dispatch(
//             actions.ipcCommonActions.showPopCommon({
//               showPopCommon: false,
//             })
//           );
//           Popup.close();
//         },
//       }
//     );
//   };
//   return null;
// };
// export default CustomDialog;
