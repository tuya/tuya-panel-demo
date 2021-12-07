/* eslint-disable react/static-property-placement */
/* eslint-disable max-classes-per-file */
import React, { PureComponent } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { TYText, Utils, IconFont } from 'tuya-panel-kit';
import Strings from '@i18n';

const {
  RatioUtils: { convert },
} = Utils;

const iconDraw =
  'M376.425931 760.514207h-64.176552a60.168828 60.168828 0 0 0-33.227034-33.421241V296.907034c14.88331-5.561379 27.489103-18.944 33.227034-33.421241h418.304c9.18069 22.280828 32.079448 37.888 56.143449 37.888 34.392276 0 60.751448-27.859862 60.751448-62.411034S821.089103 176.551724 786.714483 176.551724c-26.359172 0-48.145655 15.607172-56.161104 37.888H311.084138a61.616552 61.616552 0 0 0-56.143448-36.775724c-34.392276 0-60.751448 27.859862-60.751449 62.411034 0 26.747586 14.900966 49.028414 37.81738 57.944276v429.073656C210.273103 737.103448 194.206897 758.289655 194.206897 785.037241 194.206897 819.588414 221.713655 847.448276 254.94069 847.448276c26.359172 0 48.145655-15.607172 56.161103-37.888h64.176552c12.605793 0 22.916414-11.140414 22.916414-23.410759 1.147586-15.589517-9.163034-25.63531-21.768828-25.63531 M441.767724 797.14869c-2.259862 7.874207 5.649655 16.896 13.594483 14.653793l96.132414-28.16-83.703173-86.686897-26.023724 100.193104z m398.177104-355.787035l-42.97269-45.038345c-10.187034-11.264-28.283586-10.134069-39.600552 1.112276l-40.730483 42.796138 81.460966 84.44469 40.712828-42.796138c11.29931-11.246345 11.29931-29.272276 1.129931-40.518621zM496.075034 666.535724l79.183449 86.686897 200.209655-203.776-81.44331-85.574621-197.949794 202.681379z';

const iconEmpty =
  'M618.666667 307.328v466.346667a15.829333 15.829333 0 0 1-16 15.658666 16.277333 16.277333 0 0 1-7.146667-1.664l-160-78.336a15.637333 15.637333 0 0 1-8.853333-13.994666v-466.346667c0-8.64 7.168-15.658667 16-15.658667 2.474667 0 4.928 0.576 7.146666 1.664l160 78.336a15.637333 15.637333 0 0 1 8.853334 13.994667z m72.064-25.322667l160-87.978666a16.341333 16.341333 0 0 1 21.824 5.738666 14.933333 14.933333 0 0 1 2.112 7.637334v457.216a15.296 15.296 0 0 1-8.064 13.376l-160 87.978666a16.341333 16.341333 0 0 1-21.824-5.738666 14.933333 14.933333 0 0 1-2.112-7.637334V295.381333c0-5.546667 3.072-10.624 8.064-13.376zM384 228.736v457.216a15.296 15.296 0 0 1-8.064 13.376l-160 87.978667a16.341333 16.341333 0 0 1-21.824-5.738667 14.933333 14.933333 0 0 1-2.112-7.637333V316.714667c0-5.546667 3.072-10.624 8.064-13.376l160-87.978667a16.341333 16.341333 0 0 1 21.824 5.738667 14.933333 14.933333 0 0 1 2.112 7.637333z';

export interface IEmptyMapProps {
  style?: StyleProp<ViewStyle>;
  icon?: string;
  iconColor?: string;
  iconSize?: number;
  fontStyle?: StyleProp<TextStyle>;
}

export class EmptyMap extends PureComponent<IEmptyMapProps> {
  static defaultProps = {
    icon: iconEmpty,
    iconColor: '#0065FF',
    iconSize: convert(48),
  };

  render() {
    const { icon, iconColor, iconSize, fontStyle, style } = this.props;
    return (
      <View style={[styles.root, style]}>
        <IconFont style={styles.icon} size={iconSize} color={iconColor} d={icon} />
        <TYText style={[styles.textStyle, fontStyle]}>{Strings.getLang('emptyMap_title')}</TYText>
        <TYText style={[styles.textStyle, fontStyle]}>
          {Strings.getLang('emptyMap_subTitle')}
        </TYText>
      </View>
    );
  }
}

export class DrawMap extends PureComponent<IEmptyMapProps> {
  static defaultProps = {
    icon: iconDraw,
    iconColor: '#0065FF',
    iconSize: convert(48),
  };

  render() {
    const { icon, iconColor, iconSize, fontStyle, style } = this.props;
    return (
      <View style={[styles.root, style]}>
        <IconFont style={styles.icon} size={iconSize} color={iconColor} d={icon} />
        <TYText style={[styles.textStyle, fontStyle]}>{Strings.getLang('drawMap_title')}</TYText>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    justifyContent: 'center',
    alignItems: 'center',
    ...StyleSheet.absoluteFillObject,
  },
  icon: { marginBottom: convert(8) },
  textStyle: {
    fontSize: convert(12),
    color: '#3D3D3D',
    lineHeight: convert(18),
  },
});
