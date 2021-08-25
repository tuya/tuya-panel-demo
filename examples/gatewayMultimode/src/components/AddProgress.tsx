/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { FC, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Utils, TYText, Progress, Popup, TYSdk, Dialog } from 'tuya-panel-kit';
import { useDispatch } from 'react-redux';
import { actions, useSelector } from '@models';
import Strings from '@i18n';
import { SubDevInfo } from '../config/interface';

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
  // 根据接口获取到的设备列表，和已选中设备列表做比对。得出已经添加成功的设备数量
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

  // 添加失败弹窗的30s倒计时
  const timeoutPop = () =>
    setTimeout(() => {
      Dialog.alert({
        title: Strings.getLang('tip'),
        subTitle: Strings.getLang('addFailDesc'),
        confirmText: Strings.getLang('confirm'),
        onConfirm: () => {
          Dialog.close();
          Popup.close();
          dispatch(actions.customize.getSubDevList());
          TYSdk.Navigator.popToTop();
        },
      });
    }, 30 * 1000);
  return (
    <View style={styles.main}>
      <TYText text={Strings.getLang('addProgressTip')} style={styles.tip} />
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
        <TYText text={`${addedNum} / ${allNum}`} style={styles.centerText} />
      </View>
      <View>
        <TYText text={Strings.getLang('addProgressDesc')} style={styles.desc} />
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
