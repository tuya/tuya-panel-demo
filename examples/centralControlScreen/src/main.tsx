import React from 'react';
import { StatusBar } from 'react-native';
import { Dispatch } from 'redux';
import {
  NavigatorLayout,
  NavigationOptions,
  DeprecatedNavigator,
  DeprecatedNavigatorRoute,
} from 'tuya-panel-kit';
import Strings from '@i18n';
import composeLayout from './composeLayout';
import { store, ReduxState } from './models';
import Home from './pages/home';
import VoiceControlSkill from './pages/voiceControlSkill';

import CreateScene from './pages/voiceScene/createScene';
import AddStatement from './pages/voiceScene/addStatement';
import AddAction from './pages/voiceScene/addAction';
import SceneList from './pages/voiceScene/sceneList';
import ChooseDevice from './pages/voiceScene/chooseDevice';
import ChooseDeviceDp from './pages/voiceScene/chooseDeviceDp';
import ChooseScene from './pages/voiceScene/chooseScene';

import Scene from './pages/scene';
import SceneHide from './pages/scene/hide';
import SceneRestore from './pages/scene/restore';

import Device from './pages/device';
import DeviceHide from './pages/device/hide';
import DeviceRestore from './pages/device/restore';

import Gateway from './pages/gateway';
import Switch from './pages/switch';

import MoreFunction from './pages/moreFunction';
import SetNickname from './pages/moreFunction/setNickname';
import Shortcut from './pages/moreFunction/shortcut';

console.disableYellowBox = true;

type Props = ReduxState & { dispatch: Dispatch };

// 慎用，生成环境上不要开启，console 打印层次过深会导致性能问题
// if (__DEV__) {
//   console.log('TYSdk :', TYSdk);
// }

// 路由配置
const getRouteConfig = (route: DeprecatedNavigatorRoute) => {
  const routeProps: NavigationOptions = {};
  routeProps.hideTopbar = true;
  let component;
  switch (route.id) {
    // 首页
    case 'main':
      component = <Home />;
      routeProps.hideTopbar = false;
      break;
    // 中控语音技能说明
    case 'voiceControlSkill':
      component = <VoiceControlSkill />;
      break;
    // 场景列表
    case 'scene':
      component = <Scene />;
      break;
    // 隐藏场景
    case 'sceneHide':
      component = <SceneHide />;
      break;
    // 场景恢复显示
    case 'sceneRestore':
      component = <SceneRestore />;
      break;
    // 设备列表
    case 'device':
      component = <Device />;
      break;
    // 隐藏设备
    case 'deviceHide':
      component = <DeviceHide />;
      break;
    // 设备恢复显示
    case 'deviceRestore':
      component = <DeviceRestore />;
      break;
    // 网关
    case 'gateway':
      component = <Gateway />;
      routeProps.hideTopbar = false;
      routeProps.topbarStyle = { backgroundColor: '#FFF' };
      routeProps.title = Strings.getLang('gateway');
      break;
    // 继电器开关
    case 'switch':
      component = <Switch />;
      routeProps.hideTopbar = false;
      routeProps.title = Strings.getLang('switch');
      break;
    // 更多功能
    case 'moreFunction':
      component = <MoreFunction />;
      routeProps.hideTopbar = false;
      routeProps.title = Strings.getLang('moreFunction');
      break;
    // 快捷指令
    case 'shortcut':
      component = <Shortcut />;
      routeProps.hideTopbar = false;
      routeProps.title = Strings.getLang('shortcut');
      break;
    // 唤醒词设置
    case 'setNickname':
      component = <SetNickname />;
      break;
    // 语音场景页面
    case 'sceneList':
      component = <SceneList {...route} />;
      break;
    case 'createScene':
      component = <CreateScene {...route} />;
      routeProps.gesture = false;
      routeProps.enablePopGesture = false;
      break;
    case 'addStatement':
      component = <AddStatement />;
      break;
    case 'addAction':
      component = <AddAction {...route} />;
      break;
    // 选择控制的设备
    case 'chooseDevice':
      component = <ChooseDevice {...route} />;
      break;
    case 'chooseDeviceDp':
      component = <ChooseDeviceDp {...route} />;
      break;
    case 'chooseScene':
      component = <ChooseScene {...route} />;
      break;
    default:
      break;
  }
  return {
    routeProps,
    component,
  };
};

class MainLayout extends NavigatorLayout<Props> {
  /**
   *
   * @desc hookRoute 可以在这里针对特定路由做一些控制处理，
   * 具体可控制的参数可参考 NavigationOptions 类型描述
   */
  hookRoute(route: DeprecatedNavigatorRoute): NavigationOptions {
    const { routeProps } = getRouteConfig(route);
    routeProps.topbarStyle = { backgroundColor: 'transparent' };
    return {
      ...routeProps,
      renderStatusBar: () => <StatusBar barStyle="default" />,
    };
  }

  /**
   * @desc
   * 在此您可以通过 route 中的 ID 来判断使用哪个页面组件
   * 如果有额外的 props 需要传递给页面组件的，可以在此进行传递
   * 注意：route 参数来自于 TYSdk.Navigator.push，
   * 如果调用了 TYSdk.Navigator.push({ id: 'setting', title: 'Setting Page' });
   * 则会在推入路由栈时 hookRoute 和 renderScene 这个周期里会接受到 route = { id: 'setting', title: 'Setting Page' }，
   * 但要注意的是，首页的 route 参数是固定的，为 { 'id': 'main', 'initialRoute': true }
   *
   * @param {Object} route - route对象
   * @param {object} navigator - Navigator对象，具体使用方法可参考https://facebook.github.io/react-native/docs/0.43/navigator.html
   */
  renderScene(route: DeprecatedNavigatorRoute, navigator: DeprecatedNavigator) {
    const { component } = getRouteConfig(route);
    return component;
  }
}

export default composeLayout(store, MainLayout);
