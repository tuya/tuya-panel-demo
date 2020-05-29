import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import styles from '../../config/styles';
import { i18n } from '../../utils';

interface MainProps {
  switchOffTextOpacity: number;
}
export default class HomeSwitchOff extends PureComponent<MainProps> {
  render() {
    const { switchOffTextOpacity } = this.props;
    return (
      <View style={styles.flexContent}>
        <View>
          <TYText style={styles.title}>{i18n('switchOffTitle')}</TYText>
          <TYText style={[styles.tipText, { opacity: switchOffTextOpacity }]}>
            {i18n('switchOffContent')}
          </TYText>
        </View>
      </View>
    );
  }
}
