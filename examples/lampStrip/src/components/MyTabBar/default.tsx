/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-types */
import React from 'react';

import {
  View,
  ScrollView,
  Animated,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import wrapper from './tabHoc';

const { convertX: cx, winWidth } = Utils.RatioUtils;
const defaultProps = {
  underlineStyle: {},
  defaultActiveKey: 0,
  tabs: [],
  tabStyle: {},
  tabActiveStyle: {},
  tabTextStyle: {},
  tabActiveTextStyle: {},
  wrapperStyle: {},
  style: {},
  onChange: () => {},
  isUnderlineCenter: true,
};
type TabBarProps = {
  /**
   * 下划线的样式
   */
  underlineStyle?: StyleProp<ViewStyle>;
  /**
   * 每个tab的样式
   */
  tabStyle?: StyleProp<ViewStyle>;
  /**
   * 高亮tab的样式
   */
  tabActiveStyle?: StyleProp<ViewStyle>;
  /**
   * 每个tab内文字的样式
   */
  tabTextStyle?: StyleProp<TextStyle>;
  /**
   * 高亮tab的文字样式
   */
  tabActiveTextStyle?: StyleProp<TextStyle>;
  /**
   * tab内层容器样式
   */
  wrapperStyle?: StyleProp<ViewStyle>;
  /**
   * tab外层容器样式
   */
  style?: StyleProp<ViewStyle>;
  /**
   * 高亮tab的key
   */
  activeKey: string | number;
  /**
   * 默认高亮tab的key
   */
  defaultActiveKey?: string | number;
  /**
   * tab数据
   */
  tabs?: any[];
  /**
   * 下划线是否居中
   */
  isUnderlineCenter?: boolean;
  /**
   * tab切换的回调
   */
  onChange?: (params: any) => {};
} & Readonly<typeof defaultProps>;

interface TabBarState {
  activeKey: string | number;
  underlineLeft: any;
  underlineWidth: any;
}
class TabBar extends React.PureComponent<TabBarProps, TabBarState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = defaultProps;

  tab: never[];

  tabBar: null;

  scrollView: any;

  activeIndex: number;

  tabBarContainerWidth: any;

  underlineLeftAnimation: any;

  underlineWidthAnimation: any;

  constructor(props: TabBarProps) {
    super(props);
    this.state = {
      activeKey: props.activeKey || props.defaultActiveKey,
      underlineLeft: new Animated.Value(0),
      underlineWidth: new Animated.Value(0),
    };
    this.tab = [];
    this.tabBar = null;
    const { activeKey } = this.state;
    this.getActiveIndexByKey(activeKey);
  }

  componentWillReceiveProps(nextProps: TabBarProps) {
    if ('activeKey' in nextProps) {
      const { activeKey } = this.state;
      if (nextProps.activeKey === activeKey) return;
      this.getActiveIndexByKey(nextProps.activeKey);
      this.setState({ activeKey: nextProps.activeKey }, () => {
        this.updateView(false);
      });
    }
  }

  onTabClick = (key, callback) => {
    const { onChange } = this.props;
    if (!('activeKey' in this.props)) {
      this.setState({ activeKey: key }, () => {
        this.updateView(false);
      });
    }
    onChange && onChange(key);
    callback && callback(key);
  };

  getTabs = () => {
    const { tabs, tabStyle, tabActiveStyle, tabTextStyle, tabActiveTextStyle } = this.props;
    const { activeKey } = this.state;
    return tabs.map((tab, index) => {
      const tabKey = typeof tab.key === 'undefined' ? `tab_${index}` : tab.key;
      const isActive = tabKey === activeKey;
      const style = [
        styles.tabStyle,
        tabStyle,
        tab.style && tab.style,
        isActive && tabActiveStyle,
        isActive && tab.activeStyle && tab.activeStyle,
      ];
      const textStyle = [
        styles.tabTextStyle,
        tabTextStyle,
        tab.textStyle && tab.textStyle,
        isActive && styles.tabTextActiveStyle,
        isActive && tabActiveTextStyle,
        isActive && tab.activeTextStyle && tab.activeTextStyle,
      ];
      const { title } = tab;
      return (
        <TouchableOpacity
          key={tabKey}
          style={style}
          onPress={() => this.onTabClick(tabKey, tab.onPress)}
          onLayout={e => this.tabLayout(index, e)}
          accessibilityLabel={tab.accessibilityLabel}
        >
          {typeof title !== 'string' ? (
            title
          ) : (
            <TYText style={textStyle} accessibilityLabel={tab.textAccessibilityLabel}>
              {title}
            </TYText>
          )}
        </TouchableOpacity>
      );
    });
  };

  getUnderline = () => {
    const { underlineStyle } = this.props;
    const { underlineLeft, underlineWidth } = this.state;
    const style = [
      styles.underlineStyle,
      { width: underlineWidth },
      underlineStyle,
      { left: underlineLeft },
    ];
    return <Animated.View style={style} />;
  };

  setRef = ref => {
    this.scrollView = ref;
  };

  getActiveIndexByKey = activeKey => {
    const { tabs } = this.props;
    let activeIndex = 0;
    for (let i = 0; i < tabs.length; i++) {
      // @ts-ignore
      const tabKey = typeof tabs[i].key !== 'undefined' ? tabs[i].key : `tab_${i}`;
      if (activeKey === tabKey) {
        activeIndex = i;
        break;
      }
    }
    this.activeIndex = activeIndex;
  };

  updateScrollView = isSysUpdate => {
    const { left, width } = this.tab[this.activeIndex];
    const tempWidth = this.tabBarContainerWidth - width;
    // @ts-ignore
    const newScrollX = Math.max(Math.min(left - tempWidth / 2, this.tabBar.width - winWidth), 0);
    this.scrollView.scrollTo({ x: newScrollX, y: 0, animated: !isSysUpdate });
  };

  updateUnderline = isSysUpdate => {
    const { underlineStyle, isUnderlineCenter } = this.props;
    const { underlineLeft, underlineWidth } = this.state;
    const newUnderLineWidth: any = StyleSheet.flatten([
      styles.underlineStyle,
      underlineStyle,
    ]).width;
    this.underlineLeftAnimation && this.underlineLeftAnimation.stop();
    this.underlineWidthAnimation && this.underlineWidthAnimation.stop();
    let { left } = this.tab[this.activeIndex];
    const { width } = this.tab[this.activeIndex];
    if (isUnderlineCenter) {
      // @ts-ignore
      left += (width - newUnderLineWidth) / 2;
    }
    if (isSysUpdate) {
      underlineLeft.setValue(left);
      underlineWidth.setValue(width);
    } else {
      this.underlineLeftAnimation = Animated.timing(underlineLeft, {
        toValue: left,
        duration: 200,
      });
      this.underlineWidthAnimation = Animated.timing(underlineWidth, {
        toValue: width,
        duration: 200,
      });
      this.underlineLeftAnimation.start();
      this.underlineWidthAnimation.start();
    }
  };

  updateView = isSysUpdate => {
    const { tabs } = this.props;
    if (!this.tabBar) return;
    if (!this.tabBarContainerWidth) return;
    if (this.tab.length <= 0) return;
    const tabIsReady = this.tab.filter(value => value).length === tabs.length;
    if (tabIsReady) {
      this.updateScrollView(isSysUpdate);
      this.updateUnderline(isSysUpdate);
    }
  };

  tabBarContainerLayout = e => {
    this.tabBarContainerWidth = e.nativeEvent.layout.width;
    this.updateView(true);
  };

  tabBarLayout = e => {
    this.tabBar = e.nativeEvent.layout;
    this.updateView(true);
  };

  tabLayout = (index, e) => {
    const { x, width, height } = e.nativeEvent.layout;
    // @ts-ignore
    this.tab[index] = { left: x, right: x + width, width, height };
    this.updateView(true);
  };

  render() {
    const { wrapperStyle, style } = this.props;
    const cWrapperStyle = [styles.tabContainerStyle, wrapperStyle];
    const cStyle = [styles.tabWrapperStyle, style];
    return (
      <View style={cStyle} onLayout={this.tabBarContainerLayout}>
        <ScrollView ref={this.setRef} showsHorizontalScrollIndicator={false} horizontal={true}>
          <View onLayout={this.tabBarLayout} style={cWrapperStyle}>
            {this.getTabs()}
          </View>
          {this.getUnderline()}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  underlineStyle: {
    height: 2,
    backgroundColor: '#108ee9',
    width: cx(80),
    position: 'absolute',
    bottom: 0,
  },
  tabContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 43,
    backgroundColor: '#fff',
    width: cx(80),
  },
  tabTextStyle: {
    color: '#333',
    fontSize: 16,
  },
  tabTextActiveStyle: {
    color: '#108ee9',
  },
  tabWrapperStyle: {
    backgroundColor: '#fff',
  },
});

export default wrapper(TabBar);
