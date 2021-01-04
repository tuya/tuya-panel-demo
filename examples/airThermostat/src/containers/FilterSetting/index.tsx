import { Utils, TYText, TYSdk, Dialog } from 'tuya-panel-kit';
import React, { PureComponent } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import ScrollView from 'components/ScrollView';
import { connect } from 'react-redux';
import { isSupportDp } from 'utils/index';
import Strings from 'i18n/index';
import dpCodes from 'config/default/dpCodes';
import gateway from '../../gateway';

const {
  ThemeUtils: { withTheme },
  RatioUtils: { convertX: cx },
} = Utils;

const {
  filterLifeCode,
  filterResetCode,
  primaryFilterLifeCode,
  primaryFilterResetCode,
  mediumFilterLifeCode,
  mediumFilterResetCode,
  highFilterLifeCode,
  highFilterResetCode,
} = dpCodes;

const codes = [
  [primaryFilterLifeCode, primaryFilterResetCode],
  [mediumFilterLifeCode, mediumFilterResetCode],
  [highFilterLifeCode, highFilterResetCode],
  [filterLifeCode, filterResetCode],
];

interface Props {
  dpState: any;
  theme?: any;
}

class FilterSetting extends PureComponent<Props> {
  handleToBuy = (code: string) => () => {
    TYSdk.native.jumpTo(Strings.getLang(`${code}Url`));
  };

  handleReset = (code: string) => () => {
    Dialog.confirm({
      title: Strings.getLang(`${code}Title`),
      subTitle: Strings.getLang(`${code}Desc`),
      cancelText: Strings.getLang('cancel'),
      confirmText: Strings.getLang('confirm'),
      onConfirm: () => {
        Dialog.close();
        gateway.putDpData({ [code]: true }, { checkCurrent: false });
      },
    });
  };

  render() {
    const { dpState, theme } = this.props;
    const {
      global: { brand: themeColor },
    } = theme;
    return (
      <ScrollView>
        <View style={{ padding: cx(24) }}>
          {codes.map(([code, resetCode]) => {
            const isSupport = isSupportDp(code);
            if (isSupport) {
              const schema = TYSdk.device.getDpSchema(code);
              const url = Strings.getLang(`${code}Url`);
              const hasBuy = /^https:\/\//.test(url);
              return (
                <View style={styles.info} key={code}>
                  <View style={styles.labelBox}>
                    <TYText style={styles.label}>{Strings.getDpLang(code)}</TYText>
                    <TYText style={[styles.value]}>
                      {dpState[code]}
                      {schema.unit}
                    </TYText>
                  </View>
                  <View style={styles.btns}>
                    {hasBuy && (
                      <TouchableOpacity
                        style={styles.buyBtn}
                        activeOpacity={0.7}
                        onPress={this.handleToBuy(code)}
                      >
                        <TYText style={[styles.btnText, { color: themeColor }]}>
                          {Strings.getLang('buy')}
                        </TYText>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.resetBtn}
                      activeOpacity={0.7}
                      onPress={this.handleReset(resetCode)}
                    >
                      <TYText style={[styles.btnText, { color: themeColor }]}>
                        {Strings.getLang('reset')}
                      </TYText>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }
            return null;
          })}
        </View>
      </ScrollView>
    );
  }
}

export default connect(({ dpState }: any) => ({ dpState }))(withTheme(FilterSetting));

const styles = StyleSheet.create({
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    paddingHorizontal: cx(20),
  },
  labelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    opacity: 0.9,
  },
  value: {
    marginLeft: 8,
    fontSize: 18,
    opacity: 0.7,
  },
  btns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyBtn: {},
  resetBtn: {
    marginLeft: cx(24),
  },
  btnText: {
    fontSize: 14,
  },
});
