import React, { PureComponent } from 'react';
import { View, Image, TouchableWithoutFeedback } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import styles from '../../../config/styles';
import imgs from '../../../res';
import { i18n } from '../../../utils';

interface MainProps {
  onPressSwitch: () => void;
  boxWidth: number;
  ifShowText: boolean;
  _key: object;
}
export default class Switch extends PureComponent<MainProps> {
  componentWillReceiveProps = (nextProps: MainProps) => {
    if (nextProps._key !== this.props._key) {
      this.render();
    }
  };
  render() {
    const { onPressSwitch, boxWidth, ifShowText } = this.props;
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          onPressSwitch();
        }}
      >
        <View style={[styles.switch, { width: boxWidth }]}>
          <View style={styles.iconOutBox}>
            <Image source={imgs.switchIcon} />
          </View>
          {ifShowText && <TYText style={[styles.openText]}>{i18n('openDesktop')}</TYText>}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
