/* eslint-disable max-len */
/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Utils, Toast, TYText } from 'tuya-panel-kit';
import { View, UIManager, StyleSheet, LayoutAnimation, Platform } from 'react-native';
import { bindActionCreators } from 'redux';
import { fetchRecipes as fetchRecipesAction, setCurrentRecipe } from '../../redux/modules/recipes';
import {
  keys,
  setPowerState as setPowerAction,
  setTab as setTabAction,
  setLogoState as setLogoAction,
} from '../../redux/modules/workState';
import { HeaderView } from '../../components/recipe';
import FaultToast from '../../components/fault-toast';
import HomeBottomView from './home-bottom-view';
import HomeContentView from './home-content-view';
import HomeCookerContent from './home-cooker-content';
import ShadowImage from '../../components/shadow-image';
import Config from '../../config';
import Strings from '../../i18n';
import TYSdk from '../../api';
import { onPressTimeSet, getCountDownType, timeType } from '../../utils';
import { store } from '../../main';

const TYEvent = TYSdk.event;
const { convertX: cx, width } = Utils.RatioUtils;
const Res = {
  topImage: require('../../res/bgImg.png'),
};
class HomeSense extends Component {
  static propTypes = {
    power: PropTypes.bool,
    setPowerState: PropTypes.func,
    setTab: PropTypes.func,
    tabIndex: PropTypes.number,
    recipeId: PropTypes.number,
    mode: PropTypes.string,
    recipes: PropTypes.array,
    toastState: PropTypes.object,
    logo: PropTypes.oneOfType(PropTypes.string, PropTypes.number),
    auto: PropTypes.bool,
    navigator: PropTypes.any.isRequired,
    status: PropTypes.string.isRequired,
    start: PropTypes.bool.isRequired,
    aTime: PropTypes.number,
    setRecipe: PropTypes.func,
    fault: PropTypes.oneOfType(PropTypes.number, PropTypes.string),
  };

  static defaultProps = {
    power: false,
    setPowerState: () => {},
    setTab: () => {},
    setRecipe: () => {},
    tabIndex: 0,
    recipeId: 0,
    mode: '',
    recipes: [],
    logo: '',
    auto: false,
    aTime: 0,
    fault: 0,
    toastState: {
      info: '',
      state: false,
    },
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedRecipeId: props.recipeId,
      hideBottomWhenEnterCollect: true,
    };
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  componentDidMount() {
    this.buildRecipeData();
    TYEvent.on('updateRecipeStatus', this.buildRecipeData);
  }

  componentWillReceiveProps(nextProps) {
    const stack = ['mode', 'recipeId'];
    let shouldLogoChange = false;
    stack.forEach(e => {
      if (!shouldLogoChange) {
        shouldLogoChange = this.props[e] !== nextProps[e];
      }
    });
    if (!shouldLogoChange) {
      shouldLogoChange = this.props.recipes.length !== nextProps.recipes.length;
    }
    // eslint-disable-next-line no-undef
    shouldLogoChange && requestAnimationFrame(() => this.buildRecipeData(nextProps));

    if (this.props.recipeId !== nextProps.recipeId) {
      this.onCollectRecipeIdChange(nextProps.recipeId);
    }

    if (
      this.props.mode !== nextProps.mode &&
      typeof nextProps.recipeId === 'number' &&
      nextProps.recipeId !== 0
    ) {
      this.onModeStateChange(nextProps.mode);
    }
  }

  componentWillUpdate() {
    LayoutAnimation.configureNext({
      duration: 300,
      /**
       * @description 安卓开create收藏菜谱flatList会莫名变透明
       */
      ...Platform.select({
        ios: {
          create: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
        },
        android: {},
      }),
      update: {
        type: LayoutAnimation.Types.linear,
        duration: 300,
        initialVelocity: 2,
      },
    });
  }

  componentWillUnmount() {
    LayoutAnimation.configureNext(null);
  }

  onCollectRecipeIdChange = id => {
    const state = { selectedRecipeId: id, hideBottomWhenEnterCollect: false };
    this.setState(state);
  };

  onModeStateChange = mode => {
    const { setRecipe } = this.props;
    const postData = { [this.codes.modeCode]: mode };
    if (this.codes.recipeCode) postData[this.codes.recipeCode] = 0;
    TYSdk.device.putDeviceData(postData);
    setRecipe({});
    this.setState({ selectedRecipeId: 0 });
  };

  get codes() {
    const {
      mode: modeCode,
      fault: faultCode,
      power: powerCode,
      switch: switchCode,
      start: startCode,
      cloudRecipeNumber: recipeCode,
      appointmentTime: aTimeCode,
      autoClean: autoCode,
    } = Config.codes;
    const pCode = switchCode || powerCode;
    return {
      modeCode,
      faultCode,
      startCode,
      recipeCode,
      aTimeCode,
      autoCode,
      pCode,
    };
  }

  getLogo = props => {
    const { mode, recipeId, recipes, setLogoState, collect, setRecipe } = props || this.props;
    let logo = Res.topImage;
    if (mode && !recipeId) {
      logo = Config.getUiValue(this.codes.modeCode, mode);
    } else if (typeof recipeId === 'number') {
      const collectRecipe = collect.find(({ ownId }) => ownId === recipeId) || {};
      const recipe = recipes.find(({ id }) => id === recipeId) || {};
      logo = recipe.image;
      if (Object.keys(collectRecipe).length > 0) {
        logo = collectRecipe.image;
      }
      setRecipe(recipe);
    }
    setLogoState(logo);
  };

  getTabDatas = () => {
    const ret = [];
    const cloud = Config.cloudFun.cloudFunData;
    const hasDps = Config.dpFun.settingDps.length > 0;
    const hasExtraDps = Config.dpFun.settingExtraDps.length > 0;
    const hasSettings = hasDps || cloud.length > 0 || hasExtraDps;
    ret.push({
      key: 'mode',
      title: Strings.getLang('tab_mode'),
      onPress: () => this.handleTabPress('mode'),
    });
    if (this.codes.recipeCode) {
      ret.push({
        key: 'collect',
        title: Strings.getLang('tab_collect'),
        onPress: () => this.handleTabPress('collect'),
      });
      ret.push({
        key: 'homeRecipe',
        title: Strings.getLang('tab_homeRecipe'),
        onPress: () => this.handleTabPress('homeRecipe'),
      });
    }
    (this.codes.recipeCode || hasSettings) &&
      ret.push({
        key: 'other',
        title: Strings.getLang('tab_other'),
        onPress: () => this.handleTabPress('other'),
      });
    return ret;
  };

  setPower = () => {
    const { power, setPowerState } = this.props;
    this.codes.pCode && TYSdk.device.putDeviceData({ [this.codes.pCode]: !power });
    !this.codes.pCode && setPowerState(!power);
  };

  setStartState = () => {
    // 先下发基础参数，再发预约时间，再发启动
    const { start, power } = this.props;
    const { selectedRecipeId } = this.state;
    const { cookSettingDps } = Config.dpFun;
    if (!power) return;
    const state = store.getState().dpState;
    if (cookSettingDps.length > 0) {
      TYSdk.device.putDeviceData(
        cookSettingDps.reduce(
          (pre, cur) => ({
            ...pre,
            [cur]: state[cur],
          }),
          {}
        )
      );
    }
    if (this.codes.aTimeCode) {
      TYSdk.device.putDeviceData({
        [this.codes.aTimeCode]: state[this.codes.aTimeCode],
      });
    }
    const postData = { [this.codes.startCode]: !start };
    if (this.codes.recipeCode) {
      postData[this.codes.recipeCode] = selectedRecipeId;
    }
    TYSdk.device.putDeviceData(postData);
  };

  setTabState = id => {
    const { setTab, recipeId } = this.props;
    const { selectedRecipeId } = this.state;
    if (recipeId === 0 && selectedRecipeId > 0) {
      this.setState({ selectedRecipeId: 0 });
    }
    this.setState({ hideBottomWhenEnterCollect: true });
    setTab(id);
    this.buildRecipeData();
  };

  handleAppointmentPress = () => {
    const { aTime, power } = this.props;
    if (!power) return;
    const code = this.codes.aTimeCode;
    const value = aTime;
    const type = getCountDownType(code);
    let name = '';
    let v = value || 0;
    v = type === timeType.sec ? v : v * 60;
    const [h, m, s] = Utils.TimeUtils.parseSecond(v);
    switch (type) {
      case timeType.sec:
        name = Strings.formatString(Strings.getLang('appointment_sec'), h, m, s);
        break;
      case timeType.min:
        name = Strings.formatString(Strings.getLang('appointment_min'), m);
        break;
      default:
        name = Strings.formatString(Strings.getLang('appointment_hm'), h, m);
        break;
    }
    const titleRender = this.renderAppointmentTitle(name);
    onPressTimeSet(code, value, null, titleRender);
  };

  buildRecipeData = async props => {
    const p = props || this.props;
    const { fetchRecipes, productId } = p;
    if (this.codes.recipeCode) {
      await fetchRecipes(productId);
    }
    this.getLogo(p);
  };

  _renderFaultToast = () => {
    if (!this.codes.faultCode) return;
    const { fault } = this.props;
    return (
      <FaultToast
        style={styles.faultStyle}
        textStyle={styles.faultTextStyle}
        visible={Number.isInteger(fault) ? fault : false}
        faultText={Strings.getFaultStrings(this.codes.faultCode, fault)}
      />
    );
  };

  renderAppointmentTitle = name => (
    <View style={styles.titleContainer}>
      <TYText style={styles.leftTitle}>{Strings.getLang('appointment_title_left')}</TYText>
      <TYText style={styles.appointTip}>{name}</TYText>
      <TYText style={styles.rightTitle}>{Strings.getLang('appointment_title_right')}</TYText>
    </View>
  );

  renderTopLogo = (logo = null, showCookerView) => (
    <ShadowImage
      containerStyle={[
        styles.logoContainer,
        !showCookerView && { top: 0 },
        showCookerView && styles.bottomImage,
      ]}
      source={logo}
      imageStyle={styles.topImage}
      width={width}
      height={cx(250)}
    />
  );

  render() {
    const {
      power,
      logo,
      tabIndex,
      start,
      auto,
      toastState,
      navigator,
      recipeId,
      mode,
      status,
    } = this.props;
    const { selectedRecipeId, hideBottomWhenEnterCollect } = this.state;
    const showCookerView = __DEV__ ? start && power : start && power && status !== 'standby';
    const source = typeof logo === 'string' ? { uri: logo } : logo;
    const tabs = this.getTabDatas();
    const { key: tab } = tabs[tabIndex];
    const hideBottomKeys = ['homeRecipe', 'other'];
    const hideBottom =
      showCookerView ||
      hideBottomKeys.includes(tab) ||
      (selectedRecipeId === 0 && tab === 'collect') ||
      (hideBottomWhenEnterCollect && tab === 'collect');
    return (
      <View style={styles.container}>
        {this.renderTopLogo(source, showCookerView)}
        <HeaderView />
        <View style={styles.content}>
          {this._renderFaultToast()}
          {!showCookerView && (
            <HomeContentView
              mode={mode && !recipeId ? mode : ''}
              tabs={tabs}
              power={power}
              tabIndex={tabIndex}
              setTabState={this.setTabState}
              auto={auto}
              handleCollectRecipePress={this.onCollectRecipeIdChange}
              handleModePress={this.onModeStateChange}
            />
          )}
          <HomeBottomView
            power={power}
            isHidden={hideBottom}
            // eslint-disable-next-line no-return-assign
            ref={ref => (this._bottom = ref)}
            setStartState={this.setStartState}
            setPowerState={this.setPower}
            handleAppointmentPress={this.handleAppointmentPress}
          />
          {showCookerView && <HomeCookerContent navigator={navigator} logo={source} />}
        </View>
        <Toast show={toastState.state} text={toastState.info} onFinish={() => {}} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  faultStyle: {
    zIndex: 16,
  },

  faultTextStyle: {
    textAlign: 'center',
    color: '#F56361',
  },

  logoContainer: {
    position: 'absolute',
  },

  topImage: {
    width,
    height: cx(250),
    resizeMode: 'stretch',
  },

  bottomImage: {
    bottom: 0,
    position: 'absolute',
  },

  titleContainer: {
    flexDirection: 'row',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },

  leftTitle: {
    fontSize: cx(14),
    color: '#666666',
    backgroundColor: 'transparent',
  },

  rightTitle: {
    fontSize: cx(14),
    color: '#666666',
    backgroundColor: 'transparent',
  },

  appointTip: {
    fontSize: cx(14),
    color: '#F85A00',
    backgroundColor: 'transparent',
    fontWeight: '500',
  },
});

export default connect(
  ({ workState, dpState, recipes = {}, toastState, devInfo }) => {
    const {
      mode: modeCode,
      power: powerCode,
      switch: switchCode,
      start: startCode,
      cloudRecipeNumber: recipeCode,
      appointmentTime: aTimeCode,
      autoClean: autoCode,
    } = Config.codes;
    const pCode = switchCode || powerCode;

    return {
      power: pCode ? dpState[pCode] : true,
      fault: workState[keys.fault],
      status: workState[keys.status],
      mode: dpState[modeCode],
      start: dpState[startCode],
      logo: workState.logo,
      tabIndex: workState.tab,
      recipeId: dpState[recipeCode],
      recipes: recipes.all || [],
      collect: recipes.collect || [],
      aTime: dpState[aTimeCode],
      auto: dpState[autoCode],
      toastState,
      productId: devInfo.productId,
    };
  },
  dispatch =>
    bindActionCreators(
      {
        setPowerState: setPowerAction,
        setTab: setTabAction,
        setLogoState: setLogoAction,
        fetchRecipes: fetchRecipesAction,
        setRecipe: setCurrentRecipe,
      },
      dispatch
    )
)(HomeSense);
