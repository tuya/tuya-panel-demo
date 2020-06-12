/* eslint-disable max-len */
/* eslint-disable react/prop-types */
/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
import { TYSdk } from 'tuya-panel-kit';
import { StatusBar } from 'react-native';
import Config from '../../../../../config';
import TopHeader from '../../../../../components/publicComponents/topHeader';
import { backLivePlayWillUnmount, backNavigatorLivePlay } from '../../../../../config/click';

const { statusBarHeight, isIOS } = Config;
const TYNative = TYSdk.native;
const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

const __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
const __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod;
    const result = {};
    if (mod != null) {
      for (const k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    }
    result.default = mod;
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });

const color_1 = __importDefault(require('color'));
const React = __importStar(require('react'));
const react_native_1 = require('react-native');
const react_native_svg_1 = require('react-native-svg');
const tuya_panel_kit_1 = require('tuya-panel-kit');
const theme_get_1 = require('../../theme/theme-get');
const utils_1 = require('../utils');
const api_1 = require('../api');
const config_1 = require('../config');
const components_1 = require('../components');
const getTimerList_1 = __importDefault(require('./getTimerList'));
const i18n_1 = __importDefault(require('../i18n'));
const timerCell_1 = __importDefault(require('./timerCell'));
const style_1 = require('./style');

const { convertX: cx, convertY: cy, width, isIphoneX } = tuya_panel_kit_1.Utils.RatioUtils;
const { ThemeProvider, ThemeConsumer } = tuya_panel_kit_1.Utils.ThemeUtils;
class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.category = 'rnTimer';
    this.pushToAdd = (groupId, isEdit, index, timer) => {
      const { theme, is12Hours, isCollect, isSupportNotice } = this.props;
      const {
        addTimerRouter,
        repeatRouter,
        repeat,
        repeatType,
        limit = 30,
        isMainSwitch,
        loop,
        isPickerAlignCenter = true,
        isTimeZone,
        timeZoneType,
        fetchType = 'cloud',
        dpId,
        saveExtraHandler,
        renderDpItem,
      } = this.props.timerConfig;
      const config = this.props.timerConfig.data;
      if (!isEdit && this.state.dataSource.length >= limit) {
        TYNative.simpleTipDialog(i18n_1.default.formatValue('dpToMuchWarning', limit), () => {});
        return;
      }
      const TYNavigator = TYSdk.Navigator;
      TYNavigator.push({
        isCollect: isCollect || false,
        theme,
        is12Hours,
        isPickerAlignCenter,
        groupId,
        isEdit,
        timer,
        index,
        isMainSwitch,
        loop,
        isTimeZone,
        timeZoneType,
        fetchType,
        dpId,
        mainSwitch: this.state.mainSwitch,
        id: addTimerRouter,
        hideTopbar: true,
        repeatRouter,
        repeatType,
        hasRepeat: repeat === 0,
        dpDataList: config,
        category: this.category,
        fetchData: this.props.fetchData,
        dataSource: this.state.dataSource,
        isSupportNotice,
        saveExtraHandler,
        // sceneConfigs: config_1.FloatFromBottom,
        renderDpItem,
      });
    };

    this.goBack = () => {
      backNavigatorLivePlay();
    };
    this.handleMainSwitch = value => {
      const { fetchType = 'cloud', dpId } = this.props.timerConfig;
      if (fetchType === 'dp') {
        const sendData = this.state.dataSource.reduce(
          (total, current) => {
            return total + current.originalData;
          },
          value ? '01' : '00'
        );
        TYDevice.putDeviceData({
          [dpId]: sendData,
        });
        this.setState({
          mainSwitch: value,
        });
      } else {
        const promiseArr = this.state.dataSource.map(item => {
          return api_1.updateStatus(this.category, item.id, value);
        });
        Promise.all(promiseArr)
          .then(() => {
            const dataSource = [].concat(this.state.dataSource);
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < dataSource.length; i++) {
              dataSource[i].switchValue = value;
            }
            this.setState({
              mainSwitch: value,
              dataSource,
            });
            TYEvent.emit('linkageTimeUpdate', {});
          })
          .catch(err => {
            console.warn('handleMainSwitch Error :', err);
          });
      }
    };
    this.swipeoutOnOpen = index => {
      const { dataSource } = this.state;
      dataSource[index].rowOpen = !dataSource[index].rowOpen;
      this.setState({
        dataSource,
      });
    };
    this.onValueChange = async (groupId, index, status) => {
      const { fetchType = 'cloud', dpId } = this.props.timerConfig;
      if (fetchType === 'cloud') {
        try {
          const switchValue = status ? 1 : 0;
          const dataSource = [].concat(this.state.dataSource);
          dataSource[index].switchValue = status;
          this.setState({ dataSource });
          api_1.updateStatus(this.category, groupId, switchValue);
          TYEvent.emit('linkageTimeUpdate', {});
        } catch (error) {
          const dataSource = [].concat(this.state.dataSource);
          dataSource[index].switchValue = !status;
          this.setState({ dataSource });
        }
      } else {
        const sendData = this.state.dataSource.reduce((total, current, mindex) => {
          let { originalData } = current;
          if (mindex === index) {
            originalData = `${status ? '01' : '00'}${current.originalData.substring(2)}`;
          }
          return total + originalData;
        }, '');
        TYDevice.putDeviceData({
          [dpId]: sendData,
        });
      }
    };
    this.onCellLongPress = (...args) => {
      if (react_native_1.Platform.OS !== 'android') return;
      TYNative.simpleConfirmDialog(
        i18n_1.default.getLang('timerDelete'),
        i18n_1.default.getLang('timerDeleteTip'),
        () => this.deleteTimer(...args),
        () => {}
      );
    };
    this.deleteTimer = async (groupId, index) => {
      try {
        await api_1.removeTimer(groupId, this.category);
        TYEvent.emit('linkageTimeUpdate', {});
        const { dataSource } = this.state;
        dataSource.splice(index, 1);
        this.setState({
          dataSource,
        });
        // todo dpTimer
      } catch (error) {
        console.warn('deleteTimer Error: ', error);
      }
    };
    this.onCellPress = (...args) => {
      this.pushToAdd(...args);
    };
    this._onLayout = e => {
      const { height } = e.nativeEvent.layout;
      this.setState({
        flatHeight: height,
      });
    };
    this.renderItem = ({ item, index }) => {
      const { isMainSwitch } = this.props.timerConfig;
      const { id, formatTimeStr, tagStr, repeatStr, switchValue, dpStrArr } = item;
      const timerCell = (
        <ThemeConsumer>
          {theme => {
            const propsWithTheme = Object.assign(Object.assign({}, this.props), { theme });
            const cellLine = theme_get_1.timer.cellLine(propsWithTheme);
            return (
              <react_native_1.View
                key={id}
                onLayout={e => {
                  const { height } = e.nativeEvent.layout;
                  this.setState({
                    cellHeight: Math.round(height),
                  });
                }}
              >
                <timerCell_1.default
                  accessibilityLabel={`Timer_TimerCell${index}`}
                  style={[
                    index === 0 && {
                      borderColor: cellLine,
                      borderTopWidth: react_native_1.StyleSheet.hairlineWidth,
                    },
                    index === this.state.dataSource.length - 1 && {
                      borderColor: cellLine,
                      borderBottomWidth: react_native_1.StyleSheet.hairlineWidth,
                    },
                  ]}
                  theme={theme}
                  switchChange={value => this.onValueChange(id, index, value)}
                  switchValue={switchValue}
                  tagStr={tagStr}
                  timeStr={formatTimeStr}
                  repeatStr={utils_1.GetRepeatStr(repeatStr)}
                  dpStr={dpStrArr.length > 1 ? dpStrArr.join(' | ') : dpStrArr.join('')}
                  bordered={index !== this.state.dataSource.length - 1}
                  onLongPress={() => this.onCellLongPress(id, index)}
                  onPress={() => this.onCellPress(id, true, index, item.originalData)}
                  rightItem={isMainSwitch ? 'arrow' : 'switch'}
                />
              </react_native_1.View>
            );
          }}
        </ThemeConsumer>
      );
      return react_native_1.Platform.OS === 'ios' ? (
        <tuya_panel_kit_1.Swipeout
          autoClose={true}
          accessibilityLabel={`Timer_Swipeout${index}`}
          backgroundColor="transparent"
          onOpen={() => this.swipeoutOnOpen(index)}
          close={!this.state.dataSource[index].rowOpen}
          right={[
            {
              text: i18n_1.default.getLang('timerDelete'),
              onPress: () => this.deleteTimer(id, index),
              type: 'delete',
              fontStyle: { color: '#fff', fontSize: cx(16) },
            },
          ]}
        >
          {timerCell}
        </tuya_panel_kit_1.Swipeout>
      ) : (
        timerCell
      );
    };
    this.renderHeader = () => {
      return (
        <TopHeader
          hasRight={false}
          contentTitle={i18n_1.default.getLang('timerList')}
          leftPress={this.goBack}
        />
        //  <components_1.TopBar title={i18n_1.default.getLang('timerList')} onBack={this.goBack} />
      );
    };
    this.getMainSwitchRow = () => {
      return (
        <react_native_1.View style={{ marginBottom: cx(16) }}>
          <timerCell_1.default
            timeStr={`${i18n_1.default.getLang('timerSwitch')}`}
            switchValue={this.state.mainSwitch}
            onPress={() => {
              return false;
            }}
            rightItem="switch"
            switchChange={value => this.handleMainSwitch(value)}
          />
        </react_native_1.View>
      );
    };
    this.renderListHeaderComponent = () => {
      return (
        <style_1.StyledSubTitle
          onLayout={e => {
            const { height } = e.nativeEvent.layout;
            this.setState({
              titleHight: height,
            });
          }}
          style={{
            padding: cx(16),
            paddingBottom: cx(8),
          }}
        >
          {i18n_1.default.getLang('timerWarning')}
        </style_1.StyledSubTitle>
      );
    };
    this.state = {
      dataSource: props.dataSource,
      mainSwitch: true,
      scrolled: false,
    };
    this.category = props.timerConfig.category;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dataSource: nextProps.dataSource,
      mainSwitch: nextProps.mainSwitchValue,
    });
  }
  componentWillUnmount() {
    const { backLivePlay } = this.props;
    if (backLivePlay) {
      backLivePlayWillUnmount();
    }
  }
  get theme() {
    const theme = this.props.theme ? { timer: this.props.theme } : {};
    return theme;
  }
  render() {
    const { tintEmptyImage = true, timerConfig } = this.props;
    const isDisabled = !timerConfig && this.state.dataSource.length;
    const isEmpty = this.state.dataSource.length === 0;
    const footerDimension = { width, height: isIphoneX ? 118 : cx(88) };
    const { cellHeight, titleHight, flatHeight } = this.state;
    const scrollEnabled = Boolean(
      cellHeight * this.state.dataSource.length + titleHight > isIOS ? flatHeight - 30 : flatHeight
    );
    return (
      <ThemeProvider theme={this.theme}>
        <style_1.StyledContainer>
          {/* <ThemeConsumer>
            {theme => {
              const propsWithTheme = Object.assign(Object.assign({}, this.props), { theme });
              const statusBgStyle = theme_get_1.timer.statusBgStyle(propsWithTheme);
              return <react_native_1.StatusBar barStyle={statusBgStyle} />;
            }}
          </ThemeConsumer> */}
          <StatusBar
            barStyle={isIOS ? 'dark-content' : 'light-content'}
            translucent={true}
            backgroundColor="transparent"
          />
          <react_native_1.View
            style={{ paddingTop: isIOS ? 0 : statusBarHeight, backgroundColor: '#000000' }}
          >
            {this.renderHeader()}
          </react_native_1.View>
          {timerConfig.isMainSwitch && this.getMainSwitchRow()}
          <style_1.StyledListWrapper isDisabled={isDisabled}>
            {this.state.dataSource.length ? (
              <react_native_1.FlatList
                onLayout={this._onLayout}
                keyExtractor={item => item.id}
                data={this.state.dataSource}
                renderItem={this.renderItem}
                showsVerticalScrollIndicator={false}
                scrollEnabled={scrollEnabled}
                ListHeaderComponent={this.renderListHeaderComponent}
              />
            ) : (
              <style_1.Center>
                <style_1.StyledImage tintEmptyImage={tintEmptyImage} />
                <style_1.StyledSubTitle style={{ marginTop: cy(18), textAlign: 'center' }}>
                  {i18n_1.default.getLang('noTimerList')}
                </style_1.StyledSubTitle>
                {isEmpty && (
                  <style_1.StyledButton
                    accessibilityLabel="Timer_AddSchedule"
                    isEmpty={true}
                    onPress={() => this.pushToAdd()}
                  >
                    <style_1.StyledButtonText isEmpty={true}>
                      {i18n_1.default.getLang('addTimer')}
                    </style_1.StyledButtonText>
                  </style_1.StyledButton>
                )}
              </style_1.Center>
            )}
          </style_1.StyledListWrapper>

          {!isEmpty && (
            <react_native_1.View
              style={[
                footerDimension,
                {
                  position: 'absolute',
                  bottom: 0,
                  backgroundColor: 'transparent',
                },
              ]}
            >
              <ThemeConsumer>
                {theme => {
                  const propsWithTheme = Object.assign(Object.assign({}, this.props), { theme });
                  const boardBg = theme_get_1.timer.boardBg(propsWithTheme);
                  const c1 = color_1
                    .default(boardBg)
                    .alpha(0)
                    .rgbString();
                  return (
                    <tuya_panel_kit_1.LinearGradient
                      style={footerDimension}
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="40%"
                      stops={{
                        '0%': c1,
                        '100%': boardBg,
                      }}
                    >
                      <react_native_svg_1.Rect {...footerDimension} />
                    </tuya_panel_kit_1.LinearGradient>
                  );
                }}
              </ThemeConsumer>
            </react_native_1.View>
          )}
          {!isEmpty && (
            <style_1.StyledButton
              accessibilityLabel="Timer_AddSchedule"
              isEmpty={false}
              onPress={() => this.pushToAdd()}
            >
              <style_1.StyledButtonText isEmpty={false}>
                {i18n_1.default.getLang('addTimer')}
              </style_1.StyledButtonText>
            </style_1.StyledButton>
          )}
        </style_1.StyledContainer>
      </ThemeProvider>
    );
  }
}
Timer.defaultProps = {
  dataSource: [],
};
exports.default = getTimerList_1.default(Timer);
