/* eslint-disable max-len */
/* eslint-disable import/first */
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
// eslint-disable-next-line import/no-named-as-default
import Config from '../config';
import {
  View,
  Text,
  Image,
  InteractionManager,
  UIManager,
  ColorPropType,
  LayoutAnimation,
} from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import Dialog from '../../dialog';
import Strings from '../i18n';
import TYSdk from '../api';
import {
  formatRecipe,
  handleJson,
  clearAllTimer,
  jumpToSense,
  formatRecipeData,
  formatPublicRecipe,
  onPressTimeSet,
  getCountDownType,
  timeType,
  handleStartButtonPress,
} from '../utils';
import Topbar from '../top-bar';
import SegmentView from './segment-view';
import RecipeContentView from './recipe-content-view';
import SingleVideoPlayer from './video-display';
import MultiVideoPlayer from './video-lists';
import LoadingView from '../lazyload-view/loading';
import Bottom from '../recipe-setting/bottom';
import Star from '../star';
import { mainStyles as styles, Res } from '../assist/recipe-detail';

const { JsonUtils } = Utils;
const { DetailBaseHeight } = Config;
export default class CookbookDetail extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    themeColor: ColorPropType,
  };

  static defaultProps = {
    themeColor: '#4397D7',
  };
  // 初始化模拟数据
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      currentMenu: 0,
      recipeData: {
        data: {},
      },
      showButton: false,
      isManual: true,
      tabs: [],
      hideHeader: false,
      isCollect: false,
    };

    this.clearAllTimer = clearAllTimer.bind(this);
    this.jumpToSense = jumpToSense.bind(this);
    this._content = null;
    this._timerId1 = null;
    this._init = null;
    this.hideEmptyView = true;
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
    Config.setDevInfo(TYSdk.devInfo);
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(this.runActionsAfterRouteTransition);
  }

  componentWillUpdate() {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
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

  onPlay = flag => {
    this.setState({ hideHeader: flag });
  };

  onRefresh = () => {
    const { isError, loading } = this.state;
    const success = () => {
      isError && this.setState({ isError: false });
      this._content && this._content.onRefreshClose();
    };
    const error = () => {
      loading && this.setState({ loading: false });
      this._content && this._content.onRefreshClose();
    };
    this.fetchData(success, error);
  };

  onCollect = contentId => {
    TYSdk.getCollectDetail(contentId).then(data => {
      const flag = !this.state.isCollect;
      data &&
        Dialog.alert({
          title: Strings.getLang(`collect_${flag ? 'success' : 'failed'}`),
          confirmText: Strings.getLang('OK'),
        });
      TYSdk.event.emit('collectUpdate');
      this.setState({
        isCollect: flag,
      });
    });
  };

  onSwitchContent = (__, index, isManual = true) => {
    this.setState({ currentMenu: index, isManual }, () => {
      this._content && isManual && this._content._onItemSelect(index);
    });
  };

  runActionsAfterRouteTransition = () => {
    TYSdk.event.on('NAVIGATOR_ON_DID_FOCUS', ({ id } = {}) => {
      id === 'recipeDetail' && this.forceUpdate();
    });
    TYSdk.native.showLoading({ title: '' });
    this.fetchIsCollect();
    if ('recipeData' in this.props) {
      const { recipeData, index } = this.props;
      const data = {
        data: { ...formatPublicRecipe(recipeData) },
        itemIndex: index,
      };
      this.setState(
        {
          recipeData: data,
          showButton: false,
        },
        () => this._formatRecipeData()
      );
    } else {
      const { isError } = this.state;
      const success = () => {
        isError && this.setState({ isError: false });
      };
      const error = () => {
        !isError && this.setState({ isError: true });
      };
      this.fetchData(success, error);
    }
    TYSdk.native.hideLoading();
  };

  fetchData = async (resolve = null, reject = null) => {
    try {
      const data = await TYSdk.getRecipe(this.props.searchId);
      const recipeData = { ...data };
      recipeData.data = formatRecipe(JSON.parse(handleJson(recipeData.data)));
      this.setState(
        {
          recipeData: Object.assign({}, recipeData, {
            itemIndex: this.props.index,
          }),
          showButton: recipeData.data.isstart,
        },
        () => {
          this._formatRecipeData();
          resolve && resolve();
        }
      );
    } catch (error) {
      console.log('error :', error);
      reject && reject();
    }
  };

  handleCurIndex = (index, isManual = false) => {
    this.onSwitchContent([], index, isManual);
  };

  handleDrag = () => {
    this.setState({ isManual: false });
  };

  jumpToHome = () => {
    jumpToSense({
      id: 'main',
    });
  };

  mergeTopBar = () => {
    const { loading, receiveData } = this.state;
    const hideTopbar = !loading && receiveData;
    return { hideTopbar, style: { backgroundColor: '#fff' } };
  };

  mergeStyle = () => ({
    emptyContainer: {
      backgroundColor: '#fff',
    },
    emptyContent: {
      backgroundColor: '#fff',
    },
  });

  handleRecipeSettingPress = () => {
    this.props.navigator.push({
      id: 'recipeSetting',
      recipeData: this.state.recipeData,
      index: this.state.recipeData.itemIndex,
      recipeTitle: this.props.recipeTitle,
      themeColor: this.props.themeColor,
    });
  };

  fetchIsCollect = () => {
    TYSdk.getCollectInfo(this.props.searchId).then(ret =>
      this.setState({
        isCollect: !!ret.star,
      })
    );
  };

  _onPressTimer = () => {
    const { appointmentTime: aTimeCode } = Config.codes;
    const code = aTimeCode;
    const value = TYSdk.getState(aTimeCode);
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

  _formatRecipeData = () => {
    const { recipeData } = this.state;
    if (!recipeData) return;
    const isPublic = 'hard_level' in recipeData.data;
    const { dataSource, tabs } = formatRecipeData(recipeData, isPublic);
    this.setState({ dataSource, tabs });
  };

  _onPressStartButton = () => {
    handleStartButtonPress({
      recipeData: this.state.recipeData,
      navigator: this.props.navigator,
      executeAfterCommonStart: this.jumpToHome,
      codes: Config.codes,
      handleUnDevCtrl: this._handleUnDevCtrl,
    });
  };

  _handleUnDevCtrl = (recipeId = 0) => {
    const putData = {};
    const { start: startCode, cloudRecipeNumber: recipeCode } = Config.codes;
    putData[startCode] = true;
    putData[recipeCode] = recipeId;
    TYSdk.device.putDeviceData(putData);
    this.jumpToHome();
  };

  _getVideoStack = () => {
    if (!this.state.recipeData) return [];
    let videos = [];
    const { video, stepVideo, playUrl } = this.state.recipeData.data;
    const videoUrls = JsonUtils.parseJSON(playUrl);
    const { playURL, playURLA, playURLB } = videoUrls;
    const commonStack = [
      {
        stepTitle: Strings.getLang('video'),
        value: video,
      },
      {
        stepTitle: Strings.getLang('stepVideo'),
        value: stepVideo,
      },
    ].filter(({ value }) => value);
    const publicStack = [
      {
        stepTitle: Strings.getLang('playURL'),
        value: playURL,
      },
      {
        stepTitle: Strings.getLang('playURLA'),
        value: playURLA,
      },
      {
        stepTitle: Strings.getLang('playURLB'),
        value: playURLB,
      },
    ].filter(({ value }) => value);
    videos = commonStack.length > 0 ? commonStack : publicStack;
    return videos;
  };

  _renderEmptyView = () => {
    const { loading, dataSource, isError } = this.state;
    if (!loading && dataSource.length !== 0) return;
    return (
      // eslint-disable-next-line no-return-assign
      <View ref={ref => (this._empty = ref)} style={styles.emptyContainer}>
        <LoadingView
          itemNum={3}
          value={loading}
          showComplete={!isError}
          completeColor="#FA9601"
          sequenceColor="#FA9601"
          style={styles.loading}
        />
        {!loading && (
          <Text style={styles.tip}>
            {Strings.getLang(!isError ? 'recipeList_noData' : 'recipeList_error')}
          </Text>
        )}
      </View>
    );
  };

  renderTopbar() {
    const { goBack } = this.props;
    const { hideHeader } = this.state;
    if (hideHeader) return;
    return (
      <View style={styles.topbar}>
        <Topbar title=" " actions={[]} onBack={goBack || TYSdk.Navigator.pop} />
      </View>
    );
  }

  renderTopContentView() {
    if (!this.state.recipeData) return;
    const isPublic = 'hard_level' in this.state.recipeData.data;
    const videos = this._getVideoStack();
    if (videos.length > 0 && !isPublic) return;
    const { data } = this.state.recipeData;
    const { recipeTitle } = this.props;
    return (
      <View style={styles.topContentView}>
        <Image
          source={{ uri: data.image }}
          style={[styles.commonStyle, styles.initImageStyle, { resizeMode: 'cover' }]}
        />
        <Image
          source={Res.mask}
          style={[styles.commonStyle, styles.initImageStyle, { resizeMode: 'cover' }]}
        />
        <View style={styles.buttonImageStyle}>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={[styles.textTitleStyle]}
            accessibilityLabel="RecipeDetailPage_Text_Title"
          >
            {data.name || recipeTitle}
          </Text>
          {!isPublic && this.renderStarView()}
        </View>
      </View>
    );
  }

  renderBottomButtonView = () => {
    if (!this.state.showButton) return;
    const { appointmentTime: aTimeCode } = Config.codes;
    const { data = {} } = this.state.recipeData;
    const displayDevCtrl = _.get(data, 'hmsteps.devCtrl.displayDevCtrl', undefined);
    let hideOption = typeof displayDevCtrl !== 'undefined' && !displayDevCtrl;
    const { multisteps, hmsteps = {} } = data;
    const devCtrl = _.get(hmsteps, 'devCtrl', {});
    const { isdevctrl } = devCtrl;
    // 多步骤
    if (multisteps && isdevctrl) {
      hideOption = true;
    }
    const option = {
      setting: {
        onPress: this.handleRecipeSettingPress,
        hide: hideOption,
      },
      start: {
        onPress: this._onPressStartButton,
      },
      appointment: {
        onPress: this._onPressTimer,
        hide: !aTimeCode,
      },
    };
    return <Bottom buttonsConfig={option} themeColor={Config.themeColor} />;
  };

  renderAppointmentTitle = name => (
    <View style={styles.titleContainer}>
      <TYText style={styles.leftTitle}>{Strings.getLang('appointment_title_left')}</TYText>
      <TYText style={styles.appointTip}>{name}</TYText>
      <TYText style={styles.rightTitle}>{Strings.getLang('appointment_title_right')}</TYText>
    </View>
  );

  renderPublicTipContentView = () => {
    if (!this.state.recipeData) return;
    const { data } = this.state.recipeData;
    const { hard_level, cooking_time, taste } = data;
    if (!hard_level) return;
    const tips = [
      {
        tip: hard_level,
        dec: Strings.getLang('hard_level'),
      },
      {
        tip: cooking_time,
        dec: Strings.getLang('cooking_time'),
      },
      {
        tip: taste,
        dec: Strings.getLang('taste'),
      },
    ].filter(({ tip }) => tip);

    return <View style={styles.publicWrap}>{tips.map(tip => this.renderTipContainer(tip))}</View>;
  };

  renderStarView = (hasVideo = false) => (
    <Star
      onCollect={v => this.setState({ isCollect: v })}
      searchId={this.props.searchId}
      isCollect={this.state.isCollect}
      style={[hasVideo ? styles.videoModeStarContainer : {}, { zIndex: 99 }]}
    />
  );

  renderTipContainer = ({ tip, dec }) => (
    <View key={`${tip}`} style={styles.publicContainer}>
      <Text style={styles.publicTip}>{tip}</Text>
      <Text style={styles.publicDec}>{dec}</Text>
    </View>
  );

  renderVideo = () => {
    if (!this.state.recipeData) return;
    const isPublic = 'hard_level' in this.state.recipeData.data;
    const { image } = this.state.recipeData.data;
    const { data } = this.state.recipeData;
    const { recipeTitle } = this.props;
    const title = data.name || recipeTitle;
    const videos = this._getVideoStack();
    if (videos.length === 0 || isPublic) return;
    return this.renderMultipleVideo(videos, title, image);
  };

  renderSingleVideo = ({ title, stepTitle, originVideo, image }) => (
    <SingleVideoPlayer
      navigator={this.props.navigator}
      mainTitle={title}
      stepTitle={stepTitle}
      onPlay={this.onPlay}
      uri={originVideo}
      initImage={image}
    />
  );

  renderMultipleVideo = (videos, title, image) => (
    <MultiVideoPlayer
      data={videos}
      title={title}
      initImage={image}
      navigator={this.props.navigator}
      onPlay={this.onPlay}
    />
  );

  render() {
    const { dataSource, currentMenu, isManual, tabs, hideHeader } = this.state;
    const isPublic = 'hard_level' in this.state.recipeData.data;
    const datas = tabs.map((d, i) => ({
      menuTitle: d,
      isSelected: currentMenu === i,
    }));
    const segmentProps = {
      data: datas,
      onSwitchContent: this.onSwitchContent,
    };
    const videos = this._getVideoStack();
    return (
      <View style={styles.container}>
        {this.renderTopContentView()}
        {this.renderTopbar()}
        <View style={{ marginTop: DetailBaseHeight, flex: 1 }}>
          {this.renderPublicTipContentView()}
          <SegmentView {...segmentProps} style={styles.content} />
          <RecipeContentView
            // eslint-disable-next-line no-return-assign
            ref={ref => (this._content = ref)}
            select={currentMenu}
            isManual={isManual}
            sections={dataSource}
            onRefresh={this.onRefresh}
            handleDrag={this.handleDrag}
            handleCurIndex={this.handleCurIndex}
          />
          {this.renderBottomButtonView()}
        </View>
        {this.renderVideo()}
        {videos.length > 0 && !isPublic && !hideHeader && this.renderStarView(true)}
      </View>
    );
  }
}
