/* eslint-disable prettier/prettier */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import _filter from 'lodash/filter';
import _isEmpty from 'lodash/isEmpty';
import { View, StyleSheet, Image, ImageBackground, TouchableOpacity, FlatList } from 'react-native';
import { Utils, TYSdk, TYText } from 'tuya-panel-kit';
import Res from '../../res';
import Strings from '../../i18n';
import AnimateMotion from '../../components/animate';
import DualCurtain from '../../components/dualCurtain';
import { getDisable } from '../../utils';

const { convertX: cx } = Utils.RatioUtils;
const TYDevice = TYSdk.device;

interface ControlProps {
  isDefault: boolean;
  dpState: any;
  names: any;
  themeColor: string;
  isHorizontal: boolean;
}
class Control extends PureComponent<ControlProps> {
  constructor(props: ControlProps) {
    super(props);
    const schema = TYDevice.getDpSchema();
    this.switches = _filter(
      schema,
      d => /^control/.test(d.code) && d.code !== 'control_back' && d.code !== 'control_back_2'
    );
  }

  get datas() {
    const { dpState, themeColor, isHorizontal, isDefault } = this.props;
    return this.switches.map((d: any) => {
      const { code, range } = d;
      const percentCode = code.replace(/control/, 'percent_control');
      const percent = dpState[percentCode];
      const ICON: any = {
        0: Res.up,
        1: isDefault ? Res.circle1 : Res.circle2,
        2: Res.down,
      };
      const power = dpState[code];
      return range.map((value: string, index: number) => {
        const isStop = index === 1;
        const onPress = () => this._handleToSet(code, value);
        const isStopState = power === 'stop';
        return {
          key: value,
          title: isStop ? '' : Strings.getDpLang(code, value),
          icon: ICON[index],
          code,
          element: isStop ? (
            <View />
          ) : (
            <AnimateMotion
              icon={ICON[index]}
              color={themeColor}
              isTop={index === 0}
              isHorization={isHorizontal}
              onPress={onPress}
            />
          ),
          needAnimate: !isStop && power === value,
          onPress,
          disabled: getDisable(index, percent, isStopState),
        };
      });
    });
  }

  switches: any;

  _handleToSet = (code: string, value: string | number) => {
    TYDevice.putDeviceData({ [code]: value });
  };

  renderItem = ({ item, index }: any) => {
    const { title, icon, onPress, needAnimate, element, disabled } = item;
    const { isDefault, isHorizontal } = this.props;
    const color = isDefault ? '#FFFFFF' : '#858585';
    const isStop = index === 1;
    const MARGIN = isHorizontal ? 0 : cx(20);
    return (
      <TouchableOpacity style={styles.itemContent} onPress={onPress} disabled={disabled}>
        {needAnimate ? (
          element
        ) : (
          <View style={[styles.itemContent, isHorizontal && { flexDirection: 'row' }]}>
            {index === 2 && (
              <TYText style={[styles.title, { color, marginBottom: MARGIN }]}>{title}</TYText>
            )}
            <Image
              source={icon}
              style={[
                {
                  width: isStop ? cx(100) : cx(28),
                  height: isStop ? cx(100) : cx(13),
                },
                !isStop && { tintColor: color },
                !isStop &&
                  isHorizontal && {
                  transform: [
                    {
                      rotate: '270deg',
                    },
                  ],
                },
              ]}
            />
            {index === 0 && (
              <TYText style={[styles.title, { color, marginTop: MARGIN }]}>{title}</TYText>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  render() {
    const { isDefault, isHorizontal, dpState, names } = this.props;
    const bg = isDefault ? Res.circleBg1 : Res.circleBg2;
    const isSingle = this.switches.length === 1;
    return (
      <View style={styles.root}>
        {isSingle ? (
          <ImageBackground source={bg} style={styles.bg}>
            <FlatList
              data={this.datas[0]}
              keyExtractor={(item: any) => item.key}
              scrollEnabled={false}
              renderItem={this.renderItem}
              horizontal={isHorizontal}
              contentContainerStyle={{ alignItems: 'center' }}
              extraData={this.props}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            />
          </ImageBackground>
        ) : (
          <DualCurtain
            isDefault={isDefault}
            isHorizontal={isHorizontal}
            dpState={dpState}
            names={names}
            datas={this.datas}
            codeSchema={this.switches}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bg: {
    width: cx(300),
    height: cx(300),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemContent: {
    width: cx(100),
    height: cx(100),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    fontSize: cx(14),
  },
});

export default connect(({ dpState, socketState }: any) => ({
  dpState,
  names: socketState.socketNames,
}))(Control);
