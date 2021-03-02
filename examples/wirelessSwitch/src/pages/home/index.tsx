import { useDispatch } from 'react-redux';
import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Image } from 'react-native';
import { Utils, TopBar, TYSdk } from 'tuya-panel-kit';
import Res from '@res';
import Strings from '@i18n';
import { actions, useSelector } from '@models';
import TriggleAnimate from '../../components/triggerAnimate';
import ShufflingList from '../../components/shufflingList';
import Bottom from './bottom';
import icons from '../../icons';

const { convertX: cx, viewHeight } = Utils.RatioUtils;
const statusHeight = StatusBar.currentHeight || 0;
const TOPHEIGHT = cx(246) + statusHeight;
const THEMECOLOR = '#338CE5';

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const [trigger, setState] = useState(false);
  const { switchCodes }: any = useSelector(state => state);
  const { codes } = switchCodes;
  const data = () => {
    return codes.map((d: any) => {
      const { code } = d;
      return {
        key: `key_${code}`,
        title: Strings.getDpLang(code),
      };
    });
  };
  return (
    <View style={styles.root}>
      <TopBar
        title=""
        background="transparent"
        actions={[
          {
            d: icons.edit,
            color: '#000',
            onPress: () => TYSdk.native.showDeviceMenu(),
          },
        ]}
        onBack={() => TYSdk.native.back()}
      />
      <View style={styles.topContent}>
        {/* 触发动画 */}
        <TriggleAnimate
          pathColor={trigger ? THEMECOLOR : '#DBDBDB'}
          animateTime={2000}
          trigger={trigger}
          stop={() => setState(false)}
          isDefaultTheme={false}
          devName={TYSdk.devInfo.name}
        />
        <View style={styles.shufflingList}>
          {/* 按键选择 */}
          <ShufflingList
            data={data()}
            themeColor={THEMECOLOR}
            contentWidth={cx(290)}
            marginRight={cx(10)}
            itemWidth={cx(85)}
            isDefaultTheme={false}
            numberOfLines={1}
            itemStyle={styles.itemStyle}
            onIndexChange={(idx: number) => {
              dispatch(actions.common.updateSelectCode(codes[idx].code));
            }}
          />
        </View>
        <Image
          source={Res.finger}
          style={[styles.finger, { tintColor: trigger ? THEMECOLOR : '#A1A1A1' }]}
        />
      </View>
      {/* 规则列表 */}
      <Bottom
        themeColor={THEMECOLOR}
        style={styles.bottomContent}
        changeState={(dt: boolean) => setState(dt)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: cx(375),
    justifyContent: 'space-between',
    height: viewHeight,
  },
  topContent: {
    width: cx(375),
    height: TOPHEIGHT,
    paddingLeft: cx(15),
    justifyContent: 'space-between',
  },
  shufflingList: {
    width: cx(290),
    marginBottom: cx(10),
  },
  itemStyle: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  finger: {
    width: cx(70),
    height: cx(90),
    position: 'absolute',
    top: cx(170),
    right: 0,
  },
  bottomContent: {
    flex: 1,
    width: cx(375),
  },
});

export default Home;
