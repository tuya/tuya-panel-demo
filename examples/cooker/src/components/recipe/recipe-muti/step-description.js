import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Strings from '../i18n';
import { mainStyles as styles } from '../assist/recipe-muti';

const StepDescription = ({ total, index, desc }) => (
  <View style={styles.stepDescriptionContainer}>
    <TYText style={styles.stepTitle}>{`${Strings.getLang('step_title')} ${index}/${total}`}</TYText>
    <TYText style={styles.desc}>{desc}</TYText>
  </View>
);

StepDescription.propTypes = {
  index: PropTypes.number,
  total: PropTypes.number,
  desc: PropTypes.string,
};

StepDescription.defaultProps = {
  index: 0,
  total: 0,
  desc: '',
};

export default StepDescription;
