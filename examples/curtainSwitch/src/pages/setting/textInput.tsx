import React, { PureComponent } from 'react';
import _filter from 'lodash/filter';
import _isEmpty from 'lodash/isEmpty';
import _parseInt from 'lodash/parseInt';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { TYSdk, Utils, TYText, Dialog } from 'tuya-panel-kit';
import Strings from '../../i18n';

const { convertX: cx } = Utils.RatioUtils;
const TYDevice = TYSdk.device;

interface TextInputProps {
  text: string;
  themeColor: string;
  code: string;
  clear: any;
}

interface TextInputState {
  texts: number | string;
}

export default class TextInputs extends PureComponent<TextInputProps, TextInputState> {
  constructor(props: TextInputProps) {
    super(props);
    const { text } = props;
    this.state = {
      texts: text,
    };
  }

  onConfirm = (texts: number | string) => {
    const { code, clear } = this.props;
    const { min = 0, max = 100 } = TYDevice.getDpSchema(code);
    if (+texts > max || +texts < min) {
      Dialog.close();
      Dialog.alert({
        title: Strings.getLang('inputAlert'),
        confirmText: Strings.getLang('confirm'),
      });
    } else {
      Dialog.close();
      TYDevice.putDeviceData({
        [code]: +texts,
      });
      clear();
    }
  };

  render() {
    const { themeColor } = this.props;
    const { texts } = this.state;
    return (
      <View>
        <View style={styles.content}>
          <View style={styles.top}>
            <TYText style={styles.subTitleStyle}>{Strings.getLang('pleaseEnter')}</TYText>
            <View style={styles.textStyle}>
              <TextInput
                style={styles.inputSty}
                onChangeText={(text: string) => {
                  this.setState({
                    texts: text,
                  });
                }}
                placeholder={`${texts}`}
                keyboardType="numeric"
                underlineColorAndroid="transparent"
              />
            </View>
            <TYText style={styles.subTitleStyle}>{Strings.getLang('unit_s')}</TYText>
          </View>
          <TYText style={styles.subTitleStyle}>{Strings.getLang('readyCalibrateTip2')}</TYText>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancel} onPress={() => Dialog.close()}>
            <TYText style={styles.cancelTxt}>{Strings.getLang('cancel')}</TYText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.next} onPress={() => this.onConfirm(texts)}>
            <TYText style={[styles.sureTxt, { color: themeColor }]}>
              {Strings.getLang('next')}
            </TYText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  subTitleStyle: {
    color: '#666666',
    fontSize: cx(12),
    backgroundColor: 'transparent',
    textAlign: 'left',
  },
  content: {
    width: cx(315),
    alignItems: 'flex-start',
    paddingLeft: cx(25),
    height: cx(84),
    alignSelf: 'stretch',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    width: cx(61),
    height: cx(31),
    borderRadius: cx(4),
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputSty: {
    width: cx(61),
    height: cx(31),
    fontSize: 13,
    color: '#666666',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    paddingBottom: 0,
    paddingTop: 0,
  },
  footer: {
    height: 56,
    alignSelf: 'stretch',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e5e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancel: {
    flex: 2,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightColor: '#e5e5e5',
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  next: {
    flex: 2,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelTxt: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'rgba(52,54,60,.6)',
    backgroundColor: 'transparent',
  },
  sureTxt: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'rgba(52,54,60,.6)',
    backgroundColor: 'transparent',
  },
});
