import React, { useState, FC } from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import { Utils, TYText, Popup, Toast } from 'tuya-panel-kit';
import { useSelector } from '@models';

import AddModal from '../components/AddModal';
import Strings from '../i18n';
import Res from '../res';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

const TopView: FC = () => {
  const [visible, setVisible] = useState(false);
  const devInfo = useSelector(state => state.devInfo);
  const pop = () => {
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
  return (
    <View>
      <TouchableOpacity style={styles.btnContainer} activeOpacity={0.9} onPress={pop}>
        <Image source={Res.add} style={{ width: cx(20), height: cx(20) }} />
        <TYText style={styles.btnText}>{Strings.getLang('addSubDev')}</TYText>
      </TouchableOpacity>
      <Toast
        show={visible}
        text={Strings.getLang('isNotAdmin')}
        onFinish={() => setVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  btnContainer: {
    height: cy(57),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    flexDirection: 'row',
  },

  btnText: {
    color: '#FF4800',
    fontSize: 16,
    marginLeft: 4,
  },
});
export default TopView;
