/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Text,
  ImageBackground,
  ColorPropType,
} from 'react-native';
import PropTypes from 'prop-types';
import Strings from '../i18n';
import { Res, cx, cy } from '../assist/recipe-detail';
import AnimateButton from '../animate-button';

const { width } = Dimensions.get('screen');
const IMAGE_WIDTH = cx(82);

const Bottom = ({ buttonsConfig = {}, themeColor }) => {
  const { setting, start, appointment } = buttonsConfig;
  const buttonColorStyle = { tintColor: themeColor };
  return (
    <View style={styles.container}>
      {!setting.hide && (
        <AnimateButton style={styles.leftImageWrap} onPress={setting.onPress}>
          <ImageBackground
            source={Res.btnWrap}
            resizeMode="stretch"
            style={styles.options}
            imageStyle={buttonColorStyle}
          >
            <Image source={Res.setting} style={[styles.setting]} />
          </ImageBackground>
        </AnimateButton>
      )}
      {!start.hide && (
        <AnimateButton onPress={start.onPress} style={styles.startBtnWrap}>
          <ImageBackground
            source={Res.startBtn}
            resizeMode="stretch"
            style={styles.startBtn}
            imageStyle={buttonColorStyle}
          >
            <Text style={styles.startText}>{Strings.getLang('run')}</Text>
          </ImageBackground>
        </AnimateButton>
      )}
      {!appointment.hide && (
        <AnimateButton style={styles.rightImageWrap} onPress={appointment.onPress}>
          <ImageBackground
            source={Res.btnWrap}
            resizeMode="stretch"
            style={styles.options}
            imageStyle={buttonColorStyle}
          >
            <Image source={Res.appoint} style={[styles.appoint]} />
          </ImageBackground>
        </AnimateButton>
      )}
    </View>
  );
};

Bottom.propTypes = {
  buttonsConfig: PropTypes.object.isRequired,
  themeColor: ColorPropType,
};

Bottom.defaultProps = {
  themeColor: '#4397D7',
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: cy(8),
    width,
    flexDirection: 'row',
    height: IMAGE_WIDTH,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  options: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnWrap: {
    width: cx(196),
    height: IMAGE_WIDTH,
  },
  startBtn: {
    width: cx(196),
    height: IMAGE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: {
    color: '#fff',
    fontSize: cx(18),
    fontWeight: '500',
    marginBottom: cx(14),
  },
  leftImageWrap: {
    position: 'absolute',
    left: cx(20),
  },
  rightImageWrap: {
    position: 'absolute',
    right: cx(20),
  },
  appoint: {
    width: cx(19),
    height: cx(19),
    resizeMode: 'contain',
    marginBottom: cx(10),
  },
  setting: {
    width: cx(17),
    height: cx(13),
    resizeMode: 'contain',
    marginBottom: cx(12),
  },
});

export default Bottom;
