import React, { FC, useMemo, useRef, useImperativeHandle } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Utils, TabBar, Button, TopBar, useTheme } from 'tuya-panel-kit';
import { BlurView } from '@react-native-community/blur';
import { useControllableValue } from 'ahooks';
import color from 'color';
import { SceneCategory, SceneCategoryTab } from '@types';
import Strings from '@i18n';
import Icons from '@res/icons';

const { convertX: cx } = Utils.RatioUtils;

interface TopProps {
  style?: StyleProp<ViewStyle>;
  innerRef?: React.Ref<{ blurRef: React.MutableRefObject<null> }>;
  hasDiyScene?: boolean;
  activeTab?: SceneCategoryTab;
  defaultActiveTab?: SceneCategoryTab;
  onTabChange?: (activeTab: SceneCategoryTab) => void;
  onTabSelect?: (activeTab: SceneCategoryTab) => void;
}

const SceneTop: FC<TopProps> = props => {
  const { innerRef, onTabSelect } = props;

  const blurRef = useRef(null);

  const navigation = useNavigation();

  const { isDarkTheme, themeColor, fontColor, subFontColor, boxBgColor }: any = useTheme();

  const [activeTab, setActiveTab] = useControllableValue<SceneCategoryTab>(props, {
    valuePropName: 'activeTab',
    trigger: 'onTabChange',
    defaultValuePropName: 'defaultActiveTab',
  });

  const handleToAddScene = () => {
    navigation.navigate('diyScene', { isEdit: false });
  };

  const SceneCategorys = useMemo(
    () =>
      [
        { key: SceneCategory[4], title: Strings.getLang(`scene_category_${SceneCategory[4]}`) },
        { key: SceneCategory[0], title: Strings.getLang(`scene_category_${SceneCategory[0]}`) },
        { key: SceneCategory[1], title: Strings.getLang(`scene_category_${SceneCategory[1]}`) },
        { key: SceneCategory[2], title: Strings.getLang(`scene_category_${SceneCategory[2]}`) },
        { key: SceneCategory[3], title: Strings.getLang(`scene_category_${SceneCategory[3]}`) },
      ].map(item => ({ ...item, onPress: () => onTabSelect?.(item.key as SceneCategoryTab) })),
    [onTabSelect]
  );

  useImperativeHandle(innerRef, () => ({ blurRef }));

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' ? (
        <BlurView
          ref={blurRef}
          style={styles.blurView}
          blurType={isDarkTheme ? 'dark' : 'xlight'}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: boxBgColor }]} />
      )}
      <View style={styles.barContainer}>
        <TabBar
          style={styles.tabBar}
          underlineStyle={{
            width: cx(9),
            bottom: cx(8),
            borderRadius: cx(1.5),
            backgroundColor: fontColor,
          }}
          tabStyle={{ backgroundColor: 'transparent', width: 'auto', marginRight: cx(16) }}
          tabTextStyle={{ fontSize: cx(16), color: subFontColor }}
          tabActiveTextStyle={{ color: fontColor }}
          tabs={SceneCategorys}
          activeKey={activeTab}
          defaultActiveKey={SceneCategory[0]}
          onChange={setActiveTab}
        />
        <Button
          wrapperStyle={[
            styles.addBtn,
            {
              backgroundColor: color(isDarkTheme ? fontColor : themeColor)
                .alpha(0.1)
                .rgbaString(),
            },
          ]}
          textStyle={{
            color: isDarkTheme ? fontColor : themeColor,
            fontWeight: 'bold',
            fontSize: cx(14),
            marginRight: cx(5),
          }}
          iconPath={Icons.plus}
          iconColor={isDarkTheme ? fontColor : themeColor}
          iconSize={cx(10)}
          textDirection="left"
          text={Strings.getLang('title_add')}
          onPress={handleToAddScene}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: cx(46) + TopBar.height,
    overflow: 'hidden',
  },
  blurView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  barContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: cx(46),
    paddingHorizontal: cx(16),
  },
  tabBar: {
    backgroundColor: 'transparent',
    width: cx(254),
  },
  addBtn: {
    width: 'auto',
    height: cx(30),
    paddingHorizontal: cx(16),
    borderRadius: cx(15),
  },
});

export default SceneTop;
