/* eslint-disable max-len */
import _ from 'lodash';
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigatorLayout, TYSdk } from 'tuya-panel-kit';
import composeLayout from './composeLayout';
import configureStore from './redux/configureStore';
import LivePage from './containers/LivePlay/LivePage';
import PointDetail from './components/liveBottomBar/collectPointFeature/pointDetail';
import CruisePage from './components/liveBottomBar/customFeature/cruisePage';
import LullabyMusiclist from './components/liveBottomBar/customFeature/lullabyPage/lullabyMusicList';
import Timer from './components/featureComponents/timerPage/timer/timer/timer';
import AddTimer from './components/featureComponents/timerPage/timer/addTimer/addTimer';
// dpTimer 以及 dpAddTimer 为本地定时
import DpTimer from './components/featureComponents/timerPage/dpLocalTimer/timer';
import DpAddTimer from './components/featureComponents/timerPage/dpLocalTimer/addTimer';
// 通用dp点统计
import Statistics from './components/featureComponents/statisticPage';
import { formatUiConfig } from './utils';

console.disableYellowBox = true;
console.reportErrorsAsExceptions = false;

export const store = configureStore();

// const linearGradientBackground = {
//   '3%': '#FF7E38',
//   '90%': '#FF624C',
// };

class MainLayout extends NavigatorLayout {
  /**
   * @desc
   *   hookRoute 可以做一些控制处理，
   *   return 是一个 Object, 返回出去的Object将会被 FullView 所应用，
   *   FullView 即一个视图包裹组件，内置了头部栏，背景，离线提示，模态窗等功能，
   *   因此你可以通过return的object来自定义这些内容;
   * @param {Object} route - 路径对象，里面会包括路径id等路径信息，也会包含navigator.push()所附带的值
   * @example
   * {
   *   background: backgroundImage | linearGradientBackground, // 背景（可支持图片或渐变）
   *   backgroundColor: '#FCFCFC', // 背景颜色值
   *   style: ViewPropTypes.style,
   *   topbarStyle: ViewPropTypes.style, // 控制头部栏的样式
   *   topbarTextStyle: Text.propTypes.style, // 控制头部栏的文字样式
   *   hideFullView: true | false, // 控制是否隐藏 FullView
   *   showOfflineView: true | false, // 是否渲染 OfflineView
   *   renderFullView: (props) => {
   *     return (<FullView />);
   *   },
   *   FullView: ReactComponent, // 自定义的 FullView 组件, 如果使用自定义 FullView 组件，TopBar、OfflineView 也需要在 FullView 里面调用
   *   hideTopbar: true | false, // 控制是否隐藏 TopBar
   *   OfflineView: ReactComponent, // 自定义的 OfflineView 组件
   * }
   */
  hookRoute(route) {
    //   switch (route.id) {
    //     case 'main':
    //       // eslint-disable-next-line
    //       route.background = background;
    //       break;

    //     default:
    //       break;
    //   }

    // 这里将全屏的时候禁用手势
    const Stores = store.getState();
    const { isFullScreen } = Stores.ipcCommonState;
    const routeProps = {
      hideTopbar: true,
    };
    return {
      // showOfflineView: false,
      ...route,
      ...routeProps,
      // 全屏禁用手势
      enablePopGesture: !isFullScreen,
      style: styles.fullView,
      showOfflineView: false,
    };
  }

  /**
   * @desc 渲染指定的页面组件
   * @param {Object} route - 路径对象信息
   * @param {Object} navigator - Navigator对象，api check here https://facebook.github.io/react-native/docs/0.43/navigator.html#methods
   */
  renderScene(route, navigator) {
    let component;
    let schema = {};
    let uiConfig = {};
    const { dispatch, devInfo, dpState, logs } = this.props;

    if (!_.isEmpty(devInfo)) {
      schema = devInfo.schema || {};
      uiConfig = formatUiConfig(devInfo);
    }

    switch (route.id) {
      case 'main':
        // 不需要的 props 尽量不要传递下去，否则容易造成页面不必要的渲染
        component = <LivePage dpData={{ uiConfig }} {...route} />;
        break;
      case 'pointDetail':
        // 不需要的 props 尽量不要传递下去，否则容易造成页面不必要的渲染
        component = <PointDetail {...route} />;
        break;
      case 'cruisePage':
        // 不需要的 props 尽量不要传递下去，否则容易造成页面不必要的渲染
        component = <CruisePage {...route} />;
        break;
      case 'lullabyMusicList':
        // 不需要的 props 尽量不要传递下去，否则容易造成页面不必要的渲染
        component = <LullabyMusiclist {...route} />;
        break;
      case 'timer':
        component = <Timer {...route} />;
        break;
      case 'addTimer':
        component = <AddTimer {...route} navigator={navigator} />;
        break;
      case 'dpTimer':
        component = <DpTimer {...route} />;
        break;
      case 'dpAddTimer':
        component = <DpAddTimer {...route} navigator={navigator} />;
        break;
      case 'statistics':
        component = <Statistics {...route} navigator={navigator} />;
        break;
      default:
        break;
    }

    return component;
  }
}

const styles = StyleSheet.create({
  fullView: {
    backgroundColor: 'transparent',
  },
});

export default composeLayout(store, MainLayout);
