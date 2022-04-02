/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-unresolved */
import React, { FC, useCallback, useMemo } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
// @ts-ignore
import { Rect } from 'react-native-svg';
import { Utils, TYText, LinearGradient } from 'tuya-panel-kit';
import Res from '@res';
import DpCodes from '@config/dpCodes';
import { ColorUtils, WORK_MODE } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import LampApi from '@tuya/tuya-panel-api/lib/lamp/general';
import { actions, useSelector } from '@models';
import _scenes from '@config/default/scenes';
import Strings from '@i18n';
import { RgbSceneData } from '@types';
import useTheme from '@hooks/useTheme';
import { store } from '../../main';

const { convertX: cx } = Utils.RatioUtils;
const { rgbSceneCode, workModeCode, powerCode } = DpCodes;

interface SceneItemProps {
  data: RgbSceneData;
  isCloudScene: boolean;
  sceneValue: number;
  onPressScene: (data: RgbSceneData) => void;
}
const SceneItem: FC<SceneItemProps> = ({ sceneValue, data, onPressScene, isCloudScene }) => {
  const {
    global: { isDefaultTheme },
  } = useTheme();

  const { power, workMode, rgbSceneValue, collectedSceneIds } = useSelector(
    ({ dpState, cloudState }: any) => ({
      power: dpState[powerCode],
      workMode: dpState[workModeCode],
      rgbSceneValue: dpState[rgbSceneCode],
      collectedSceneIds: cloudState.collectedSceneIds,
    })
  );

  const bgColorData = useMemo(() => {
    const { colors } = data.value || {};
    return colors?.map(c => ColorUtils.hsv2rgba(c.hue, c.saturation + 200, 1000));
  }, [data.value]);

  const isCollected = useMemo(() => {
    return collectedSceneIds.indexOf(data.sceneId) !== -1;
  }, [collectedSceneIds, data.sceneId]);

  const getStops = useMemo(
    () => (colors: string[]) => {
      if (colors.length === 1) {
        // eslint-disable-next-line no-param-reassign
        colors = colors.concat(colors);
      }
      const result: any = {};
      const length = colors.length - 1;
      colors.forEach((item, index) => {
        const percent = Math.floor((index / length) * 100);
        result[`${percent}%`] = item;
      });
      return result;
    },
    []
  );

  const handleCollectScene = useCallback(
    (sceneId: number) => () => {
      store.dispatch(actions.common.updateCollectedSceneId(sceneId));
      const newList = [...collectedSceneIds];
      const index = newList.indexOf(sceneId);
      const exist = index !== -1;
      if (exist) {
        newList.splice(index, 1);
      } else {
        newList.unshift(sceneId);
      }
      LampApi.saveCloudConfig!(`collectedSceneIds`, newList);
    },
    [collectedSceneIds]
  );

  const handlePressScene = (obj: RgbSceneData) => () => {
    onPressScene(obj);
  };

  const collectIconColor = isDefaultTheme ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const { sceneId, name } = data;
  let isActive = false;
  if (
    (isCloudScene && sceneValue === sceneId) ||
    (!isCloudScene && rgbSceneValue.id === sceneId && power && workMode === WORK_MODE.SCENE)
  ) {
    isActive = true;
  }
  const itemElement = () => (
    <TouchableOpacity
      key={sceneId}
      activeOpacity={0.8}
      style={styles.cardItem}
      onPress={handlePressScene(data)}
    >
      {isActive && (
        <LinearGradient style={styles.bgStyle} stops={getStops(bgColorData)} x2="100%" y2="100%">
          <Rect width={cx(166)} height={cx(257)} />
        </LinearGradient>
      )}
      <View
        style={[
          styles.box,
          {
            backgroundColor: isDefaultTheme ? '#151724' : '#fffdfd',
          },
        ]}
      >
        <Image source={data.img} style={styles.img} />
        <View style={styles.cardBottom}>
          <TYText
            style={{ flex: 1 }}
            color={isDefaultTheme ? '#fff' : '#0b0909'}
            numberOfLines={1}
            ellipsizeMode="tail"
            size={14}
          >
            {Strings.getLang(name as any)}
          </TYText>

          {!isCloudScene && (
            <TouchableOpacity onPress={handleCollectScene(sceneId)}>
              <Image
                style={[
                  styles.collectionIcon,
                  {
                    tintColor: isCollected ? '#DA3737' : collectIconColor,
                  },
                ]}
                source={Res.heart}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
  return <View style={styles.main}>{itemElement()}</View>;
};
const styles = StyleSheet.create({
  main: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cardItem: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: cx(12),
  },
  bgStyle: {
    width: cx(166),
    height: cx(257),
    borderRadius: cx(18),
    overflow: 'hidden',
  },
  img: {
    width: cx(166),
    height: cx(257),
    borderRadius: cx(16),
  },
  cardBottom: {
    position: 'absolute',
    bottom: cx(16),
    width: '100%',
    paddingHorizontal: cx(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collectionIcon: {
    width: cx(14),
    height: cx(14),
    marginLeft: cx(8),
  },
  box: {
    margin: cx(2),
    height: cx(253),
    width: cx(162),
    borderRadius: cx(16),
    alignItems: 'center',
    overflow: 'hidden',
  },
});

export default SceneItem;
