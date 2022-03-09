/* eslint-disable import/no-unresolved */
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import CustomTopBar from '@components/CustomTopBar';
import Strings from '@i18n';
import { ColorUtils } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import Res from '@res';
import ColourBox from '@components/ColourSlider';
import { IColour } from '@types';
import { StackNavigationProp } from '@react-navigation/stack';

const {
  RatioUtils: { convertX: cx, winWidth, isIphoneX },
} = Utils;
interface CloudTimerDimmerProps {
  route: any;
  navigation: StackNavigationProp<any>;
}

const CloudTimerDimmer: React.FC<CloudTimerDimmerProps> = props => {
  const {
    route: {
      params: { hue, saturation, value, onSave },
    },
    navigation,
  } = props;

  const lightImg = useRef<Image>();

  const [colour, setColour] = useState({
    hue,
    saturation,
    value,
  });

  const handleSave = async () => {
    onSave({ ...colour });
    navigation.goBack();
  };

  useEffect(() => {
    lightImg.current?.setNativeProps({
      style: { tintColor: ColorUtils.hsv2rgba(colour.hue, colour.saturation, colour.value) },
    });
  }, [colour]);

  const handleColorComplete = (data: IColour) => {
    setColour(data);
  };

  return (
    <View style={styles.flex1}>
      <CustomTopBar
        title={Strings.getLang('timer_dimmer_title')}
        hasBackIcon={true}
        onBack={() => navigation.goBack()}
        onSave={handleSave}
      />
      <View style={styles.main}>
        <View style={styles.imgBox}>
          <Image source={Res.lottieBg} style={styles.lightImageAb} resizeMode="contain" />
          <Image
            ref={(ref: Image) => {
              lightImg.current = ref;
            }}
            source={Res.lottieBg}
            style={[
              styles.lightImage,
              {
                tintColor: ColorUtils.hsv2rgba(0, 1000, 1000),
              },
            ]}
            resizeMode="contain"
          />
        </View>
        <View style={styles.controlBox}>
          <View style={styles.sliderBox}>
            <ColourBox
              disabled={false}
              data={{ hue: colour.hue, saturation: colour.saturation, value: colour.value }}
              handleChange={handleColorComplete}
              handleChangeComplete={handleColorComplete}
              isCloud={true}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    alignItems: 'center',
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: cx(20) + (isIphoneX ? 20 : 0),
  },
  imgBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightImage: {
    width: cx(183),
    height: cx(295),
  },
  lightImageAb: {
    position: 'absolute',
    width: cx(183),
    height: cx(295),
  },
  controlBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sliderBox: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: isIphoneX ? 80 : 70,
  },
});

export default CloudTimerDimmer;
