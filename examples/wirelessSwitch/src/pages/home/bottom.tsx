/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useDispatch } from 'react-redux';
import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  ImageBackground,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Utils, TYSdk, Popup, TYText } from 'tuya-panel-kit';
import Res from '@res';
import Strings from '@i18n';
import { actions, useSelector, ReduxState } from '@models';
import RuleList from '../ruleList';

const { convertX: cx, viewHeight } = Utils.RatioUtils;
const { compareVersion } = Utils.CoreUtils;
const statusHeight = StatusBar.currentHeight || 0;
const TOPHEIGHT = cx(246) + statusHeight;
const newVersion = '3.25.0';

interface BottomProps {
  themeColor: string;
  changeState: (a: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

const Bottom: React.FC<BottomProps> = props => {
  const { themeColor, changeState } = props;
  const dispatch = useDispatch();
  const { selectState, selectValueState }: ReduxState = useSelector(state => state);
  const { selectCode } = selectState;
  const result = compareVersion(TYSdk.mobile.mobileInfo.appVersion, newVersion);
  const handleToAdd = () => {
    const { range = [] } = TYSdk.device.getDpSchema(selectCode);
    const dataSource = range.map((val: string) => ({
      key: val,
      value: val,
      title: Strings.getDpLang(selectCode, val),
      styles: { title: { marginLeft: 16 } },
    }));
    Popup.list({
      title: Strings.getLang('selectAction'),
      titleStyle: styles.listTitleStyle,
      // @ts-ignore
      value: null,
      dataSource,
      footerType: 'singleCancel',
      cancelText: Strings.getLang('cancels'),
      iconTintColor: themeColor,
      styles: {
        title: [{ color: '#333333', fontSize: 16 }],
      },
      onSelect: (v: string) => {
        Popup.close();
        dispatch(actions.common.updateSelectValue(v));
        setTimeout(() => {
          const src = `tuyaSmart://createScene_allDevices?devId=${TYSdk.devInfo.devId}`;
          TYSdk.native.jumpTo(src);
        }, 600);
      },
    });
  };
  return (
    <View style={styles.root}>
      <ImageBackground style={styles.imgBg} source={Res.listBg}>
        <View style={styles.content}>
          <RuleList
            isDefaultTheme={false}
            selectCode={selectState.selectCode}
            selectValue={selectValueState.selectValue}
            themeColor={themeColor}
            onTriggle={() => changeState(true)}
            isNewApp={result === 1}
          />
          <View style={[styles.addBg, styles.addBgContent]}>
            <View style={styles.addbtn}>
              <Image
                source={Res.addBg}
                style={[styles.addBg, styles.addBgImage, { tintColor: themeColor }]}
                resizeMode="stretch"
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleToAdd}>
                <TYText style={styles.addText}>{Strings.getLang('addText')}</TYText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: cx(375),
  },
  imgBg: {
    width: cx(375),
    height: cx(478),
  },
  content: {
    width: cx(375),
    height: viewHeight - TOPHEIGHT,
  },
  addBg: {
    width: cx(343),
    height: cx(98),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  addBgImage: {
    bottom: 0,
  },
  addbtn: {
    width: cx(343),
    height: cx(98),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  addBtn: {
    width: cx(343),
    height: cx(54),
    marginBottom: cx(17),
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBgContent: {
    width: cx(375),
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  addText: {
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  listTitleStyle: {
    backgroundColor: 'transparent',
    color: '#999999',
    fontSize: 14,
  },
});

export default Bottom;
