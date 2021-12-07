import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { inject, observer } from 'mobx-react';
import { TYSdk, TYSectionList } from 'tuya-panel-kit';
import Strings from '@i18n';
import { createDpValue$ } from '../protocol/utils';
import { DPCodes } from '../config';
import { VoiceRow, SettingsSectionList } from '../components';
import { encodeVoiceData, encodeVoiceSuccess } from '../utils';
import { getVoiceList } from '../api';

interface IProps {
  dpState: any;
}
interface VoiceItem {
  id: string | number;
  auditionUrl: string;
  imgUrl: string;
  name: string;
  status: number;
  schedule: number;
  extendData: any;
}

interface IState {
  voiceList: Array<VoiceItem>;
  voiceRes: any;
  showVoiceData: boolean;
}
@inject(({ dpState }) => {
  const { data } = dpState;
  return {
    dpState: data,
  };
})
@observer
export default class Volume extends PureComponent<IProps, IState> {
  byDpCode: boolean;

  msgSubscription: any;

  constructor(props: IProps) {
    super(props);
    this.state = {
      voiceList: [],
      showVoiceData: true,
      voiceRes: encodeVoiceSuccess(props.dpState[DPCodes.voiceData]) || {},
    };
  }

  async componentDidMount() {
    if (
      TYSdk.device.checkDpExist(DPCodes.voiceData) ||
      TYSdk.device.checkDpExist(DPCodes.language)
    ) {
      TYSdk.mobile.showLoading();
      const { datas } = await getVoiceList();
      if (datas && datas.length) {
        this.setState({
          voiceList: datas,
          showVoiceData: true,
        });
        // 如果语音包生效，则设置监听
        this.msgSubscription = createDpValue$(DPCodes.voiceData, false).subscribe((v: string) => {
          if (v) {
            const res = encodeVoiceSuccess(v);
            res &&
              this.setState({
                voiceRes: res,
              });
          }
        });
      } else {
        const { range = [] } = TYSdk.device.getDpSchema(DPCodes.language) || {};
        this.setState({
          voiceList: range,
          showVoiceData: false,
        });
      }
      TYSdk.mobile.hideLoading();
    } else {
      this.setState({ showVoiceData: false });
    }
  }

  componentWillUnmount() {
    this.msgSubscription && this.msgSubscription.unsubscribe();
  }

  handleSelect = (data: { id: number | string; language: string }) => {
    const { language, id } = data;
    const { voiceList, showVoiceData } = this.state;
    if (showVoiceData) {
      const lang: any = voiceList.find(i => i.id === id);
      lang &&
        TYSdk.device.putDeviceData({
          [DPCodes.voiceData]: encodeVoiceData(lang),
        });
    } else {
      TYSdk.device.putDeviceData({
        [DPCodes.language]: language,
      });
    }
  };

  get sections() {
    const { dpState } = this.props;
    const { voiceList, showVoiceData } = this.state;
    const data: Array<any> = [];
    // 音量dp数据
    const { step: volumeStep = 1, max: volumeMax = 10, min: volumeMin = 0 } =
      TYSdk.device.getDpSchema(DPCodes.volume) || {};

    TYSdk.device.checkDpExist(DPCodes.volume) &&
      data.push({
        title: Strings.getDpLang(DPCodes.volume),
        data: [
          {
            key: DPCodes.volume,
            dpCode: DPCodes.volume,
            value: dpState[DPCodes.volume],
            title: Strings.getDpLang(DPCodes.volume),
            arrow: false,
            canTouchTrack: true,
            actionType: 'iconfont',
            Icon: 'volume-sharp-off',
            Action: 'volume-sharp-max',
            stepValue: volumeStep,
            minimumValue: volumeMin,
            maximumValue: volumeMax,
            minimumTrackTintColor: '#0065FF',
            onSlidingComplete: (value: number) => {
              TYSdk.device.putDeviceData({ [DPCodes.volume]: value });
            },
            renderItem: ({ item }) => {
              return <TYSectionList.SliderItem {...item} />;
            },
          },
        ],
      });

    let list: any = [];
    if (voiceList && voiceList.length > 0) {
      list = voiceList.map(itm => {
        if (showVoiceData) {
          return {
            ...itm,
            status: this.renderStatus(itm).status,
            schedule: this.renderStatus(itm).schedule,
          };
        }

        return {
          key: itm,
          id: itm,
          name: itm,
          status: itm === dpState[DPCodes.language] ? 3 : -1,
          schedule: 0,
        };
      });
    }
    const voiceData = list.map((itm: VoiceItem) => ({
      key: itm.id,
      id: itm.id,
      title: itm.name,
      imgUrl: itm.imgUrl,
      status: itm.status,
      schedule: itm.schedule,
      onPress: this.handleSelect,
      renderItem: ({ item }) => {
        return <VoiceRow {...item} />;
      },
    }));
    !!voiceData.length &&
      data.push({
        title: Strings.getDpLang(DPCodes.voiceData || DPCodes.language),
        data: voiceData,
      });
    return data;
  }

  renderStatus = (itm: VoiceItem) => {
    const { voiceRes } = this.state;
    const { extendId, status, schedule } = voiceRes;
    const { extendData } = itm;
    if (extendId === extendData.extendId) {
      return {
        status,
        schedule,
      };
    }
    return {
      status: -1,
      schedule: 0,
    };
  };

  render() {
    return (
      <View style={styles.container}>
        <SettingsSectionList sections={this.sections} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
});
