/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-unresolved */
import * as React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { TYText, Utils, SwitchButton, Swipeout, GlobalToast } from 'tuya-panel-kit';
import Strings from '@i18n';
import Res from '@res';
import { formatColorText } from '@utils';
import { WORK_MODE, SupportUtils, repeatArrStr } from '@tuya/tuya-panel-lamp-sdk/lib/utils';
import Api from '@api';
import Icons from '@res/iconfont';
import _ from 'lodash';
import _scenes from '@config/default/scenes';
import { TimerType, ITimerData } from '@types';
import TimeFormatter from '@tuya/tuya-panel-lamp-sdk/lib/components/time-format-component';

const CloudTimerCategory = 'category_timer';
const { parseJSON } = Utils.JsonUtils;

interface TaskListProps {
  timerList: ITimerData[];
  is24Hour: boolean;
  taskKeyList: string[];
  onSave?: () => void;
  onBack?: () => void;
  onGetCloudTimerList: (showLoad?: boolean) => void;
  onEditItem: (args: any) => () => void;
  theme?: any;
  onScrollViewEnableChange: (enable: boolean) => void;
}

interface TaskListState {
  timerList: any[];
}

const { convertX: cx, isIphoneX, winHeight, topBarHeight } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

class TaskList extends React.Component<TaskListProps, TaskListState> {
  isZh: boolean;

  constructor(props: TaskListProps) {
    super(props);
    const { timerList } = this.props;
    this.state = { timerList: this.getStateList(timerList) };
    // @ts-ignore
    this.isZh = Strings.language?.startsWith('zh');
  }

  componentWillReceiveProps(nextProps: TaskListProps) {
    if (!_.isEqual(nextProps.timerList, this.props.timerList)) {
      this.setState({ timerList: this.getStateList(nextProps.timerList) });
    }
  }

  componentDidUpdate() {
    this.disableScrollView();
  }

  getStateList = (list: ITimerData[]) => {
    const newList = [...list]
      .sort((a: ITimerData, b: ITimerData) => a.startTime - b.startTime)
      .map(i => ({ ...i, open: false }));
    return newList;
  };

  getTaskList = (key: string) => {
    const { timerList } = this.props;
    let list: any = [];
    switch (key) {
      case TimerType.timer:
        list = timerList;
        break;
      default:
        break;
    }
    return list;
  };

  disableScrollView = () => {
    const { timerList } = this.state;
    let enable = true;
    timerList.forEach((item, index) => {
      if (item.open) {
        enable = false;
      }
    });
    enable ? this.handleEnableScrollView() : this.handleDisableScrollView();
  };

  handlePowerItem = (item: ITimerData) => async () => {
    const { power, type } = item;
    const { onGetCloudTimerList } = this.props;
    switch (type) {
      case TimerType.timer: {
        const switchValue = !power ? 1 : 0;
        const { id } = item;
        try {
          await Api.updateTimerStatus(CloudTimerCategory, id, switchValue);
          onGetCloudTimerList(false);
        } catch (error) {
          const err: { message?: string; errorMsg?: string } = parseJSON(error);
          GlobalToast.show({
            text: err.message || err.errorMsg,
            d: Icons.error,
            onFinish: GlobalToast.hide,
          });
        }
        break;
      }
      default:
    }
  };

  handleDelete = async (item: ITimerData) => {
    const { onGetCloudTimerList } = this.props;
    const { id } = item;
    try {
      await Api.removeTimer(id, CloudTimerCategory);
      onGetCloudTimerList(false);
    } catch (error) {
      const err: { message?: string; errorMsg?: string } = parseJSON(error);
      GlobalToast.show({
        text: err.message || err.errorMsg,
        d: Icons.error,
        onFinish: GlobalToast.hide,
      });
    }
  };

  handleDisableScrollView = () => {
    this.props.onScrollViewEnableChange(false);
  };

  handleEnableScrollView = () => {
    this.props.onScrollViewEnableChange(true);
  };

  handleSwipeoutOpen = (index: number) => () => {
    const { timerList } = this.state;
    const newList = timerList.map((i, idx) => ({
      ...i,
      open: idx === index,
    }));
    this.setState({ timerList: newList });
  };

  renderActionText = (data: ITimerData) => {
    const { dpPowerValue, workMode, hue, rgbSceneValue } = data;
    let text = Strings.getLang('timer_action_value_0');
    if (dpPowerValue) {
      if (workMode === WORK_MODE.COLOUR) {
        text = `${Strings.getLang('timer_action_dimmer')}: ${formatColorText(hue!)}`;
      } else if (workMode === WORK_MODE.SCENE) {
        const { id } = rgbSceneValue;
        let data: any = {};
        const sceneArr = [..._scenes[1], ..._scenes[2], ..._scenes[3], ..._scenes[4]];
        sceneArr.forEach(sceneItem => {
          if (sceneItem.sceneId === id) {
            data = sceneItem;
          }
        });
        text = `${Strings.getLang('timer_action_scene')}: ${Strings.getLang(data?.name)}`;
      }
    }
    return text;
  };

  renderTaskItem = (item: ITimerData, index: number) => {
    const {
      onEditItem,
      theme: {
        global: { isDefaultTheme, fontColor },
      },
      is24Hour,
    } = this.props;
    const { timerList } = this.state;
    const { type, power } = item;
    const isCloud = type === TimerType.timer;
    return (
      <Swipeout
        key={`${item.key}_${index}`}
        autoClose={true}
        close={!timerList[index].open}
        style={styles.swipe}
        backgroundColor="transparent"
        scroll={this.handleDisableScrollView}
        // @ts-ignore
        onScrollEnd={this.handleEnableScrollView}
        onOpen={this.handleSwipeoutOpen(index)}
        buttonWidth={cx(60)}
        right={[
          {
            onPress: () => {
              this.handleDelete(item);
            },
            backgroundColor: 'transparent',
            type: 'delete',
            content: (
              <View style={styles.deleteItemContent}>
                <Image source={Res.trash} style={styles.deleteIcon} resizeMode="contain" />
              </View>
            ),
          },
        ]}
      >
        <View
          style={[
            styles.item,
            {
              backgroundColor: isDefaultTheme ? 'rgba(255,255,255,0.07)' : '#fff',
            },
          ]}
        >
          <TouchableOpacity activeOpacity={1} onPress={onEditItem(item)} style={styles.touchStyle}>
            <View style={[styles.itemTitle, !power && { opacity: 0.4 }]}>
              <TimeFormatter.SingleTime
                time={
                  typeof item.startTime !== 'undefined'
                    ? item.startTime
                    : item.hour! * 60 + item.minute!
                }
                is24Hour={is24Hour}
                itemStyle={{
                  flexDirection: this.isZh ? 'row' : 'row-reverse',
                  alignItems: 'flex-end',
                }}
                timeStyle={{
                  marginRight: this.isZh ? 0 : cx(4),
                  fontSize: cx(28),
                  color: fontColor,
                }}
                unitStyle={[styles.uintStyle, { color: fontColor }]}
              />
            </View>
            <TYText style={[styles.itemDesc, styles.itemD, !power && { opacity: 0.4 }]}>
              {repeatArrStr(item.weeks)}
            </TYText>
            {isCloud && (
              <TYText style={[styles.itemDesc, !power && { opacity: 0.4 }]}>
                {this.renderActionText(item)}
              </TYText>
            )}
          </TouchableOpacity>
          <SwitchButton value={item.power} onValueChange={this.handlePowerItem(item)} />
        </View>
      </Swipeout>
    );
  };

  render() {
    const isShow = !SupportUtils.isGroupDevice() && SupportUtils.isSupportCountdown();
    const {
      theme: {
        global: { isDefaultTheme },
      },
    } = this.props;
    const { timerList } = this.state;
    if (timerList.length === 0) {
      return (
        <View
          style={[
            styles.main,
            {
              height:
                winHeight - topBarHeight - (isShow ? cx(230) : 0) - (isIphoneX ? cx(118) : cx(98)),
            },
          ]}
        >
          <View style={styles.imgBox}>
            <Image
              source={isDefaultTheme ? Res.schedule_empty : Res.schedule_empty_light}
              style={styles.img}
              resizeMode="contain"
            />
            <TYText>{Strings.getLang('schedule_empty_tip')}</TYText>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.taskCardContainer}>
        {timerList.map((node: ITimerData, idx: number) => {
          return this.renderTaskItem(node, idx);
        })}
      </View>
    );
  }
}

export default withTheme(TaskList);

const styles = StyleSheet.create({
  main: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    height: cx(104),
    marginLeft: cx(24),
    marginRight: cx(8),
    paddingVertical: cx(14),
    paddingHorizontal: cx(24),
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    marginBottom: cx(6),
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDesc: {
    fontSize: cx(12),
    opacity: 0.5,
    marginLeft: cx(4),
  },
  itemD: {
    marginBottom: cx(4),
  },
  taskCardContainer: {
    width: '100%',
    marginBottom: cx(16),
    overflow: 'hidden',
  },
  imgBox: {
    alignItems: 'center',
  },
  deleteItemContent: {
    width: cx(52),
    height: '100%',
    backgroundColor: '#DA3737',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchStyle: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  deleteIcon: {
    width: cx(20),
    height: cx(20),
    tintColor: '#fff',
  },
  uintStyle: {
    fontSize: cx(12),
    opacity: 0.5,
    marginRight: cx(4),
    paddingBottom: cx(4),
  },
  img: {
    width: cx(224),
    height: cx(162),
  },
  swipe: {
    marginBottom: cx(16),
    marginRight: cx(16),
  },
});
