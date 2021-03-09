import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import _ from 'lodash';
import { TYText } from 'tuya-panel-kit';
import { TYIpcNative } from '@tuya/tuya-panel-ipc-sdk';
import { useSelector } from 'react-redux';
import { commonConfig } from '@config';
import Strings from '@i18n';
import Res from '@res';

const { cx, cy } = commonConfig;

interface SelectValueProps {
  showData: any;
  mode: string;
  onConfirm: (__: any) => void;
}

const SelectValue: React.FC<SelectValueProps> = (props: SelectValueProps) => {
  const { showData } = props;
  const getCheckedValue = (datas: any) => {
    const checkedIndex = _.findIndex(datas, (item: any) => {
      return item.checked === true;
    });
    return datas[checkedIndex].value;
  };

  const [selectData, setSelectData] = useState(showData);
  const [checkedValue] = useState(getCheckedValue(showData));
  const theme = useSelector((state: any) => state.theme);
  const { type, customTheme } = theme;
  const themeDialogBgc = customTheme[type].dialogBgc;
  const themeDialogDivideLine = customTheme[type].dialogDivideLine;

  const changeBox = (value: any) => {
    const { mode } = props;
    if (checkedValue === value && mode === 'videoResolution') {
      TYIpcNative.showToast(Strings.getLang('hasCurrentClarity'));
      return false;
    }
    if (checkedValue === value) {
      return false;
    }
    const oldArr = [...selectData];
    oldArr.forEach((item, index) => {
      if (item.value === value) {
        oldArr[index].checked = true;
      } else {
        oldArr[index].checked = false;
      }
    });
    setSelectData(oldArr);
    props.onConfirm(value);
  };

  return (
    <View style={[styles.selectValuePage, { backgroundColor: themeDialogBgc }]}>
      {selectData.map((item, index) => (
        <TouchableOpacity
          onPress={() => {
            changeBox(item.value);
          }}
          activeOpacity={0.8}
          style={[
            styles.checkBox,
            {
              borderBottomWidth: index === selectData.length - 1 ? 0 : 1,
              borderBottomColor: themeDialogDivideLine,
            },
          ]}
          key={item.text}
        >
          <TYText numberOfLines={1} style={styles.checkTitle}>
            {item.text}
          </TYText>
          {item.checked && (
            <View style={styles.checkImgBox}>
              <Image style={styles.checkImg} source={Res.publicImage.checkCircle} />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  selectValuePage: {},
  checkBox: {
    height: cy(48),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkTitle: {
    fontSize: cx(16),
  },
  checkImgBox: {
    width: cx(24),
    position: 'absolute',
    right: cx(20),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkImg: {
    width: '100%',
    resizeMode: 'contain',
  },
});

export default SelectValue;
