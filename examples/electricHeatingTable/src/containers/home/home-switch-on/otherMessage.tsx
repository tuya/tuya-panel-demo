import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { TYText, UnitText } from 'tuya-panel-kit';
import styles from '../../../config/styles';
import { ReduxType } from '../../../redux/combine';
import { connect } from 'react-redux';
import { updateDp } from '../../../redux/modules/common';
import { DpState } from '../../../config/interface';
import { i18n, cy, toFixedData } from '../../../utils';

interface MainProps {
  messageTextOpacity: number;
  dpState: DpState;
  devInfo: { [key: string]: any };
}
class OtherMessage extends PureComponent<MainProps> {
  render() {
    const { messageTextOpacity, dpState } = this.props;
    const schema = Object.keys(this.props.devInfo.schema);
    return (
      <View style={[styles.otherMessageContainer, { opacity: messageTextOpacity }]}>
        {schema.includes('temp_current') && (
          <View style={[styles.textCenter]}>
            <View style={styles.textVaule}>
              <UnitText
                value={
                  dpState.switch
                    ? 0 ||
                      `${toFixedData(
                        dpState.temp_current /
                          Math.pow(10, this.props.devInfo.schema.temp_current.scale),
                        1
                      )}`
                    : '--'
                }
                size={cy(14)}
                valueColor="#fff"
                unitColor="#fff"
              />
              <TYText style={styles.unit}>℃</TYText>
            </View>
            <View style={styles.textBox}>
              <TYText style={styles.otherTextName}>{i18n('innerTemp')}</TYText>
            </View>
          </View>
        )}
        {schema.includes('capacity_current') && (
          <View style={styles.textCenter}>
            <View style={styles.textVaule}>
              <UnitText
                value={
                  dpState.switch
                    ? 0 ||
                      `${toFixedData(
                        dpState.capacity_current /
                          Math.pow(10, this.props.devInfo.schema.capacity_current.scale),
                        0
                      )}`
                    : '--'
                }
                size={cy(14)}
                valueColor="#fff"
                unitColor="#fff"
              />
              <TYText style={styles.unit}>W</TYText>
            </View>
            <View style={styles.textBox}>
              <TYText style={styles.otherTextName}>{i18n('currentPower')}</TYText>
            </View>
          </View>
        )}
      </View>
    );
  }
}
export default connect(
  ({ dpState, devInfo }: ReduxType) => ({
    dpState,
    devInfo,
  }),
  {
    updateDp,
  }
)(OtherMessage);
