import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TYText, useTheme, Utils } from 'tuya-panel-kit';
import { useMount } from 'ahooks';
import { useDispatch } from 'react-redux';
import Strings from '@i18n';
import useSelector from '@hooks/useSelector';
import Res from '@res';
import { CommonActions } from '@actions';
import CloudTimingList from './CloudTimingList';

const { convertX: cx } = Utils.RatioUtils;
const { getCloudTimingList } = CommonActions;

const Timing: React.FC = () => {
  const dispatch = useDispatch();

  const { isDarkTheme, subFontColor }: any = useTheme();
  const { cloudTimingList } = useSelector(({ uiState }) => ({
    cloudTimingList: uiState.cloudTimingList || [],
  }));

  useMount(() => {
    dispatch(getCloudTimingList());
  });

  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <TYText size={cx(20)}>{Strings.getLang('title_timing')}</TYText>
        <TYText
          size={cx(12)}
          color={subFontColor}
          style={{ marginTop: cx(4), marginBottom: cx(9) }}
        >
          {Strings.getLang('tip_timing')}
        </TYText>
      </View>
      <View style={styles.content}>
        {cloudTimingList.length ? (
          <CloudTimingList />
        ) : (
          <View style={styles.empty}>
            <Image
              source={isDarkTheme ? Res.timing_empty_dark : Res.timing_empty_light}
              style={styles.emptyImg}
            />
            <TYText color={subFontColor} style={styles.emptyText}>
              {Strings.getLang('tip_timing_empty')}
            </TYText>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginVertical: cx(8),
    marginHorizontal: cx(24),
  },
  content: {
    flex: 1,
  },
  empty: {
    position: 'absolute',
    bottom: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  emptyImg: {
    width: cx(224),
    height: cx(162),
  },
  emptyText: {
    marginLeft: cx(3),
  },
});

export default Timing;
