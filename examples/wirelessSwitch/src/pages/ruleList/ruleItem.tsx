/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { PureComponent } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { Utils, TYText, IconFont, Swipeout } from 'tuya-panel-kit';
import { RuleItemProps, RuleItemState } from '../../components/index.dt';
import Strings from '../../i18n';
import Icon from '../../icons';
import Res from '../../res';

const { convertX: cx } = Utils.RatioUtils;

export default class RuleItem extends PureComponent<RuleItemProps, RuleItemState> {
  constructor(props: RuleItemProps) {
    super(props);
    this.state = {
      curOpenSwipeOutIdx: -1,
    };
  }

  render() {
    const {
      needBackground,
      background,
      isSelect,
      isDefaultTheme,
      isNewApp,
      index,
      needEnable,
      changeEnabled,
      devLength,
      showIcon,
      enabled,
      themeColor,
      name,
      onPress,
      scrollEnabledChange,
      removeRule,
      editRule,
    } = this.props;
    const { curOpenSwipeOutIdx } = this.state;
    const closeColor = isDefaultTheme ? '#6F6F6F' : '#C4C4C4';
    const isOpacity = enabled ? 1 : 0.8;
    const isOp = needEnable ? isOpacity : 1;
    const hasNoDev = devLength === 0;
    const devList = devLength === 1 ? 'devList' : 'devLists';
    const noDevice = Strings.getLang('notDevice');
    return (
      <Swipeout
        autoClose={true}
        style={styles.swipeoutStyle}
        disabled={!needEnable}
        backgroundColor="transparent"
        close={index !== curOpenSwipeOutIdx}
        onOpen={() => {
          this.setState({ curOpenSwipeOutIdx: index });
          scrollEnabledChange({ scrollEnabled: false });
        }}
        onClose={() => scrollEnabledChange({ scrollEnabled: true })}
        right={[
          {
            type: 'delete',
            backgroundColor: 'red',
            onPress: () => removeRule(),
            content: (
              <View style={styles.deleteContent}>
                <Image source={Res.deletes} style={styles.deleteIcon} />
              </View>
            ),
          },
        ]}
      >
        <ImageBackground
          // @ts-ignore
          source={needBackground ? { uri: background } : null}
          style={{ width: cx(343), minHeight: cx(96), opacity: 0.9 }}
        >
          <TouchableOpacity
            style={[
              styles.ruleItem,
              {
                backgroundColor: needEnable ? (enabled ? themeColor : closeColor) : themeColor,
                opacity: 0.9,
              },
            ]}
            onPress={onPress}
            activeOpacity={0.8}
            disabled={!enabled}
          >
            <View style={styles.leftContent}>
              <View>
                <TYText style={[styles.name, { opacity: isOp }]} numberOfLines={2}>
                  {name}
                </TYText>
                <TYText style={styles.devList} numberOfLines={1}>
                  {/* @ts-ignore */}
                  {hasNoDev ? noDevice : Strings.formatValue(devList, devLength)}
                </TYText>
              </View>
              <View style={styles.iconContent}>
                {showIcon.map((d: any, idx: number) => (
                  <View key={`icon_${idx + 1}`} style={[styles.imgContent, { opacity: isOp }]}>
                    <Image source={d} style={styles.iconImg} />
                  </View>
                ))}
              </View>
            </View>
            <View
              style={[
                styles.rightContent,
                isNewApp && {
                  justifyContent: 'space-between',
                },
                !isNewApp && {
                  justifyContent: needEnable ? 'center' : 'flex-end',
                },
              ]}
            >
              {isNewApp && (
                <TouchableOpacity style={styles.edit} onPress={() => editRule()}>
                  <View style={styles.icon}>
                    <IconFont d={Icon.more} color="#FFFFFF" size={cx(18)} />
                  </View>
                </TouchableOpacity>
              )}
              <View style={styles.cicleContent}>
                {needEnable ? (
                  <View>
                    {enabled ? (
                      <TouchableOpacity style={styles.open} onPress={changeEnabled}>
                        <View style={styles.pointOpen} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.close} onPress={changeEnabled}>
                        <View style={styles.point} />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View
                    style={[
                      styles.cicle,
                      { backgroundColor: isSelect ? '#FFFFFF' : 'transparent' },
                    ]}
                  >
                    {isSelect && <IconFont d={Icon.select} color={themeColor} size={cx(10)} />}
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </ImageBackground>
      </Swipeout>
    );
  }
}

const styles = StyleSheet.create({
  ruleItem: {
    width: cx(343),
    minHeight: cx(96),
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingLeft: cx(12),
    paddingRight: cx(10),
    paddingTop: cx(12),
    paddingBottom: cx(14),
    opacity: 0.9,
  },
  swipeoutStyle: {
    width: '100%',
    minHeight: cx(96),
    marginVertical: 5,
    borderRadius: cx(12),
    overflow: 'hidden',
  },
  leftContent: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  name: {
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    fontSize: cx(16),
    maxWidth: cx(267),
    lineHeight: cx(22),
    marginBottom: cx(2),
  },
  devList: {
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,.7)',
    fontSize: cx(12),
    maxWidth: cx(267),
    marginBottom: cx(10),
  },
  iconContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  iconImg: {
    width: cx(33),
    height: cx(33),
    borderRadius: cx(8),
  },
  imgContent: {
    width: cx(35),
    height: cx(35),
    marginRight: cx(8),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: cx(8),
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  rightContent: {
    height: '100%',
    minHeight: cx(70),
    width: cx(41),
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  edit: {
    width: cx(41),
    height: cx(36),
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  icon: {
    width: cx(26),
    height: cx(26),
    backgroundColor: 'rgba(255,255,255,.2)',
    borderRadius: cx(13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cicle: {
    width: cx(16),
    height: cx(16),
    borderRadius: cx(8),
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: cx(5),
  },
  cicleContent: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  deleteIcon: {
    width: cx(30),
    height: cx(30),
    marginRight: cx(5),
  },
  deleteContent: {
    width: cx(75),
    minHeight: cx(96),
    alignItems: 'center',
    justifyContent: 'center',
  },
  close: {
    width: 51,
    height: 28,
    paddingLeft: 7,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,.2)',
    justifyContent: 'center',
  },
  open: {
    width: 51,
    height: 28,
    paddingRight: 2,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,.6)',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  pointOpen: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  point: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
});
