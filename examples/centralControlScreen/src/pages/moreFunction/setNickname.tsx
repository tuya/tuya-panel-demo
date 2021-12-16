import React, { FC, useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { Utils, Toast, TYSdk, TopBar, TYText, Dialog } from 'tuya-panel-kit';
import Strings from '@i18n';
import { getNickname, deleteNickname, setNickname } from '@api';
import { theme } from '@config';
import { alertDialog, showToast } from '@utils';

const { width, height } = Dimensions.get('window');
const { convertX: cx, isIphoneX } = Utils.RatioUtils;

const nameTipList = [
  Strings.getLang('nameTip1'),
  Strings.getLang('nameTip2'),
  Strings.getLang('nameTip3'),
  Strings.getLang('nameTip4'),
];

const SetNickname: FC = () => {
  const [name, setName] = useState('');
  const [isShowToast, setIsShowToast] = useState(false);
  const [toastText, setToastText] = useState('');
  const [haveSetName, setHaveSetName] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    getNickname()
      .then(res => {
        if (typeof res === 'string' && res !== '') {
          setName(res);
          setHaveSetName(true);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const deleteNickName = () => {
    Dialog.confirm({
      title: Strings.getLang('deleteTip'),
      confirmText: Strings.getLang('confirm'),
      cancelText: Strings.getLang('cancel'),
      onConfirm: (data, { close }) => {
        close();
        deleteNickname()
          .then(d => {
            showToast(Strings.getLang('deleteNicknameSuccess'), TYSdk.Navigator.popToTop);
          })
          .catch(err => {
            console.log(err);
          });
      },
    });
  };

  const save = () => {
    const reg = new RegExp('[^\\u4e00-\\u9fa5]+', 'g');
    if (name === '') {
      setToastText(Strings.getLang('nameNull'));
      setIsShowToast(true);
      return;
    }
    if (name.length > 5 || name.length < 3) {
      setToastText(Strings.getLang('nameLongTip'));
      setIsShowToast(true);
      return;
    }
    if (reg.test(name)) {
      setToastText(Strings.getLang('languageTip'));
      setIsShowToast(true);
      return;
    }
    setNickname(name)
      .then(d => {
        alertDialog(Strings.getLang('setNicknameSuccess'), TYSdk.Navigator.popToTop);
      })
      .catch(err => {
        const errMsg = err && err.message;
        alertDialog(`${Strings.getLang('setNicknameFail')}：${errMsg}`);
        console.log(err);
      });
  };

  const renderTopBar = () => {
    return (
      <TopBar
        title={Strings.getLang('setNickname')}
        background="transparent"
        onBack={TYSdk.Navigator.pop}
        actions={[
          {
            source: Strings.getLang('save'),
            color: theme.themeColor,
            onPress: save,
          },
        ]}
      />
    );
  };

  const renderContent = () => {
    return (
      <View style={styles.center}>
        <TYText style={styles.tip}>{Strings.getLang('name')}</TYText>
        <TextInput
          style={styles.input}
          onChangeText={val => setName(val)}
          value={name}
          underlineColorAndroid="transparent"
          placeholder={Strings.getLang('nameTip')}
          placeholderTextColor="#A2A3AA"
        />
        <View style={{ marginTop: cx(20) }}>
          {nameTipList.map((d, i) => (
            <TYText key={d} text={`${i + 1}.${d}`} style={styles.detailTip} />
          ))}
        </View>
      </View>
    );
  };

  const renderDeleteBtn = () => {
    return (
      <TouchableOpacity onPress={deleteNickName} activeOpacity={0.8}>
        <View style={styles.deleteBut}>
          <TYText text={Strings.getLang('deleteName')} style={styles.deleteText} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderToast = () => {
    return (
      <Toast
        show={isShowToast}
        showPosition="bottom"
        text={toastText}
        onFinish={() => setIsShowToast(false)}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {renderTopBar()}
      {renderContent()}
      {haveSetName && renderDeleteBtn()}
      {renderToast()}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    paddingTop: cx(30),
    paddingHorizontal: cx(18),
  },
  input: {
    height: cx(56),
    borderRadius: cx(8),
    width: cx(327),
    backgroundColor: '#FFF',
    color: '#000',
    fontSize: cx(16),
    paddingLeft: cx(16),
  },
  tip: {
    color: '#22242C',
    fontSize: cx(16),
    lineHeight: cx(22),
    marginBottom: cx(10),
    fontWeight: 'bold',
  },
  detailTip: {
    color: '#A2A3AA',
    fontSize: cx(13),
    lineHeight: cx(18),
    marginBottom: cx(8),
  },
  deleteBut: {
    width,
    height: cx(60),
    backgroundColor: '#fff',
    borderTopColor: '#eee',
    borderTopWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isIphoneX ? cx(20) : 0,
  },
  deleteText: {
    color: '#A2A3AA',
    fontSize: cx(16),
  },
});

export default SetNickname;
