import { Utils, TYText, Popup } from 'tuya-panel-kit';
import Strings from 'i18n/index';
import React, { PureComponent } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import ScrollView from 'components/ScrollView';

const { convertY: cy, convertX: cx, height: winHeight, isIphoneX } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

interface Props {
  cancelText?: string;
  okText?: string;
  onCancel?: () => void;
  onOk?: () => void;
  title?: string;
  renderTitle?: () => React.ReactNode;
  contentType?: 'scroll' | 'panel';
  theme?: any;
  style?: any;
  hideCancel?: boolean;
  hideOk?: boolean;
}

@withTheme
export default class PopMain extends PureComponent<Props> {
  handleCancel = () => {
    const { onCancel } = this.props;
    if (typeof onCancel === 'function') {
      onCancel();
    } else {
      Popup.close();
    }
  };
  handleOk = () => {
    const { onOk } = this.props;
    if (typeof onOk === 'function') {
      onOk();
    } else {
      Popup.close();
    }
  };

  render() {
    const {
      title,
      cancelText,
      okText,
      style,
      theme,
      contentType,
      hideCancel,
      hideOk,
      children,
    } = this.props;
    const {
      global: { brand: themeColor },
    } = theme;
    return (
      <View style={[styles.panel, style]}>
        <View style={styles.header}>
          {hideCancel ? (
            <View />
          ) : (
            <TouchableOpacity activeOpacity={0.5} onPress={this.handleCancel}>
              <TYText style={styles.cancelTxt}>{cancelText || Strings.getLang('cancel')}</TYText>
            </TouchableOpacity>
          )}
          <TYText style={styles.title} numberOfLines={1}>
            {title}
          </TYText>
          {hideOk ? (
            <View />
          ) : (
            <TouchableOpacity activeOpacity={0.5} onPress={this.handleOk}>
              <TYText style={[styles.okTxt, { color: themeColor }]}>
                {okText || Strings.getLang('confirm')}
              </TYText>
            </TouchableOpacity>
          )}
        </View>

        {contentType === 'panel' ? (
          <View style={{ flex: 1 }}>{children}</View>
        ) : (
          <ScrollView>{children}</ScrollView>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  panel: {
    height: winHeight - (isIphoneX ? 70 : 40),
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelTxt: {
    fontSize: 17,
    paddingLeft: cx(24),
  },
  title: {
    flex: 1,
    fontSize: 17,
    textAlign: 'center',
  },
  okTxt: {
    fontSize: 17,
    paddingRight: cx(24),
    textAlign: 'right',
  },
});
