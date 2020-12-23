import React, { PureComponent } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { TYSdk, Utils } from 'tuya-panel-kit';
import moment from 'moment';
import apiRequestHandle from '../api';
import Res from '../res';
import Strings from '../i18n';
import dpConfig from '../config/dpCodes';

const { convertX } = Utils.RatioUtils;
interface AlarmTipProps {
  onClick: () => void;
  iconColor?: string;
}
interface AlarmTipState {
  alarm: string;
  time: string;
  number: number;
}
export default class AlarmTip extends PureComponent<AlarmTipProps, AlarmTipState> {
  constructor(props: AlarmTipProps) {
    super(props);
    this.state = {
      alarm: '',
      number: 0,
      time: '',
    };
  }

  componentDidMount() {
    TYSdk.event.on('dpDataChange', this.getNumber);
    this.alarm();
    apiRequestHandle
      .getUnReadNum()
      .then((d: any) => {
        console.log(d);
        this.setState({
          number: d,
        });
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  componentWillUnmount() {
    TYSdk.event.off('dpDataChange', this.getNumber);
  }

  onClick = () => {
    this.setState({
      number: 0,
    });
    this.props.onClick();
  };

  getNumber = (data: any) => {
    if (JSON.stringify(data).length > 50) {
      return;
    }
    setTimeout(() => {
      const info = data[dpConfig.alarmLock];
      if (info) {
        apiRequestHandle
          .getUnReadNum()
          .then((d: any) => {
            console.log(d);
            this.setState({
              number: d,
            });
          })
          .catch((err: any) => {
            console.log(err);
          });
        this.alarm();
      }
    }, 1000);
  };

  alarm = () => {
    apiRequestHandle
      .getAlarmList(0, 1)
      .then((d: any) => {
        let alarm = '';
        if (d.datas.length > 0) {
          Object.keys(d.datas[0].dps[0]).forEach(element => {
            // 具体值获取文本生成逻辑可自行编写
            alarm += Strings.getDpLang(`alarm_lock_${d.datas[0].dps[0][element]}`);
          });
          this.setState({
            alarm,
            time:
              moment().format('YYYY-MM-DD').toString() ===
              moment(d.datas[0].gmtCreate).format('YYYY-MM-DD')
                ? moment(d.datas[0].gmtCreate).format('HH:mm')
                : moment(d.datas[0].gmtCreate).format('MM-DD HH:mm'),
          });
        } else {
          this.setState({
            alarm: Strings.getLang('noneAlarm'),
            time: '',
          });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  render() {
    const { alarm, time, number } = this.state;
    const { iconColor } = this.props;
    return (
      <TouchableOpacity onPress={this.onClick}>
        <View style={styles.root}>
          <View style={styles.infoView}>
            <View style={[styles.alarm, styles.space]}>
              <Image source={Res.alarm} style={[{ tintColor: iconColor }]} />
            </View>
            {time !== '' && <Text style={styles.time}>{time}</Text>}
            <Text style={styles.alarmInfo} numberOfLines={1}>
              {alarm}
            </Text>
          </View>
          {number > 1 && (
            <View style={styles.alarmNumView}>
              <Text style={styles.alarmNumText}>{number}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    width: convertX(352),
    height: convertX(56),
    borderRadius: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  space: {
    marginRight: 16,
  },
  infoView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    color: '#878787',
    fontSize: 14,
    marginRight: 10,
  },
  alarmInfo: {
    color: '#878787',
    fontSize: 14,
    width: convertX(200),
  },
  alarm: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alarmNumView: {
    minWidth: 20,
    maxWidth: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FC4747',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  alarmNumText: {
    fontSize: convertX(12),
    color: '#fff',
  },
});
