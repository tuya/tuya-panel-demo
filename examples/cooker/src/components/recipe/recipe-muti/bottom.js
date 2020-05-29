/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { TYText } from 'tuya-panel-kit';
import {
  View,
  Image,
  ImageBackground,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
// eslint-disable-next-line import/no-named-as-default
import Config from '../config';
import { Res, mainStyles as styles } from '../assist/recipe-muti';
import Strings from '../i18n';

// eslint-disable-next-line max-len
const BottomButtonGroup = ({ handleStop, onStepChange, index, total, isPause, themeColor }) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const buttonColorStyle = { tintColor: themeColor };
  const { pause: pauseCode } = Config.codes;
  return (
    <View style={styles.BottomButtonGroup}>
      <TouchableWithoutFeedback
        onPress={() => {
          onStepChange && onStepChange(index - 1);
        }}
        disabled={isFirst}
      >
        <View style={isFirst ? styles.stepButtonWrapperDisabled : styles.stepButtonWrapper}>
          <ImageBackground
            style={styles.stepButton}
            source={Res.stepWrap}
            imageStyle={buttonColorStyle}
          >
            <Image style={styles.stepInnerButton} source={Res.stepPre} />
          </ImageBackground>
        </View>
      </TouchableWithoutFeedback>
      <TouchableOpacity onPress={handleStop}>
        <ImageBackground style={styles.stopButton} source={Res.stop} imageStyle={buttonColorStyle}>
          <TYText
            style={styles.stopText}
            text={Strings.getLang(isPause || !pauseCode ? 'run' : 'stop')}
          />
        </ImageBackground>
      </TouchableOpacity>
      <TouchableWithoutFeedback
        onPress={() => {
          onStepChange && onStepChange(index + 1);
        }}
        disabled={isLast}
      >
        <View style={isLast ? styles.stepButtonWrapperDisabled : styles.stepButtonWrapper}>
          <ImageBackground
            style={styles.stepButton}
            source={Res.stepWrap}
            imageStyle={buttonColorStyle}
          >
            <Image style={styles.stepInnerButton} source={Res.stepNext} />
          </ImageBackground>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

BottomButtonGroup.propTypes = {
  handleStop: PropTypes.func,
  onStepChange: PropTypes.func,
  index: PropTypes.number,
  total: PropTypes.number,
  isPause: PropTypes.bool,
  themeColor: PropTypes.string,
};

BottomButtonGroup.defaultProps = {
  handleStop: () => {},
  onStepChange: () => {},
  index: 0,
  total: 0,
  isPause: false,
  themeColor: null,
};

export default BottomButtonGroup;
