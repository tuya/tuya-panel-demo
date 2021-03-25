/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { FC, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Utils, TYText, Progress, Popup, TYSdk, Dialog } from 'tuya-panel-kit';
import { useDispatch } from 'react-redux';
import { actions, useSelector } from '@models';

import Strings from '../i18n';
import { SubDevInfo } from '../config/fetchDataInterface';

const { convertX: cx } = Utils.RatioUtils;
let timer;

interface MainProps {
  selects: string[];
}

const AddProgress: FC<MainProps> = ({ selects }) => {
  const dispatch = useDispatch();
  const [addedNum, setAddedNum] = useState(0);
  const subDevList = useSelector(state => state.deviceStore.subDevList);
  const allNum = selects.length;
  useEffect(() => {
    timer = timeoutPop();
    return () => {
      clearTimeout(timer);
    };
  }, []);
  useEffect(() => {
    const devIds = subDevList.map((item: SubDevInfo) => item.devId);
    let num = 0;
    selects.forEach(item => {
      if (devIds.includes(item)) {
        num += 1;
      }
    });
    setAddedNum(num);
  }, [subDevList]);
  useEffect(() => {
    clearTimeout(timer);
    if (addedNum !== allNum) {
      timer = timeoutPop();
    } else {
      setTimeout(() => {
        Popup.close();
        TYSdk.Navigator.popToTop();
      }, 800);
    }
  }, [addedNum]);
  const timeoutPop = () =>
    setTimeout(() => {
      Dialog.alert({
        title: Strings.getLang('tip'),
        subTitle: Strings.getLang('addFailDesc'),
        confirmText: Strings.getLang('confirm'),
        onConfirm: () => {
          Dialog.close();
          Popup.close();
          dispatch(actions.customize.getSubDevList(TYSdk.devInfo.devId));
          TYSdk.Navigator.popToTop();
        },
      });
    }, 30 * 1000);
  return (
    <View style={styles.main}>
      <TYText style={styles.tip}>{Strings.getLang('addProgressTip')}</TYText>
      <View style={styles.progressMain}>
        <Progress
          foreColor={{
            '0%': '#1381FB',
            '100%': '#00C36C',
          }}
          style={{ width: cx(130), height: cx(130) }}
          startColor="#1381FB"
          value={(addedNum * 100) / allNum}
          startDegree={-90}
          andDegree={360}
          disabled={true}
          thumbRadius={0}
          scaleHeight={6}
        />
        <TYText style={styles.centerText}>{`${addedNum} / ${allNum}`}</TYText>
      </View>
      <View>
        <TYText style={styles.desc}>{Strings.getLang('addProgressDesc')}</TYText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: cx(330),
    width: cx(330),
    backgroundColor: '#FFF',
    borderRadius: cx(16),
    paddingVertical: cx(36),
    paddingHorizontal: cx(26),
  },
  tip: {
    fontWeight: '600',
    fontSize: cx(16),
  },
  desc: {
    fontSize: cx(12),
    color: '#999',
    lineHeight: cx(20),
  },
  progressMain: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    position: 'absolute',
    fontSize: cx(20),
  },
});
export default AddProgress;
