import React, { useState, FC } from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import { Utils, TYText, Popup, Toast, DeprecatedNavigator } from 'tuya-panel-kit';
import { useSelector } from '@models';

import AddModal from '../../components/AddModal';
import Strings from '../../i18n';
import Res from '../../res';
import { theme } from '../../config';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

interface MainProps {
  navigator: DeprecatedNavigator;
}

const TopView: FC<MainProps> = ({ navigator }) => {
  const [visible, setVisible] = useState(false);
  const devInfo = useSelector(state => state.devInfo);
  const popAdd = () => {
    const { isAdmin } = devInfo;
    if (isAdmin) {
      Popup.custom(
        {
          content: <AddModal />,
          footer: <View />,
          title: <View />,
          wrapperStyle: {
            alignSelf: 'center',
            backgroundColor: 'transparent',
          },
        },
        {
          alignContainer: 'center',
          maskStyle: { backgroundColor: 'rgba(51,51,51,0.7)' },
        }
      );
    } else {
      setVisible(true);
    }
  };
  const toAddList = () => {
    navigator.push({
      id: 'addList',
    });
  };
  return (
    <View>
      <View style={styles.container}>
        <View style={styles.main}>
          <TouchableOpacity style={styles.btnContainer} activeOpacity={0.9} onPress={toAddList}>
            <Image source={Res.add} style={styles.icon} />
            <TYText style={styles.btnText}>{Strings.getLang('addSubDevByList')}</TYText>
          </TouchableOpacity>
          <View style={styles.line} />
          <TouchableOpacity style={styles.btnContainer} activeOpacity={0.9} onPress={popAdd}>
            <Image source={Res.search} style={styles.icon} />
            <TYText style={styles.btnText}>{Strings.getLang('searchDev')}</TYText>
          </TouchableOpacity>
        </View>
      </View>
      <Toast
        show={visible}
        text={Strings.getLang('isNotAdmin')}
        onFinish={() => setVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: cx(20),
  },
  main: {
    height: cy(56),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  line: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0E0E0',
    height: cy(20),
  },
  btnContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  btnText: {
    color: theme.themeColor,
    fontSize: cx(15),
    marginLeft: cx(6),
  },
  icon: {
    width: cx(20),
    height: cx(20),
    tintColor: theme.themeColor,
  },
});
export default TopView;
