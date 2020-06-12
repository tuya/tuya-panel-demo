/* eslint-disable max-len */
/* eslint-disable no-case-declarations */
/* eslint-disable new-cap */
/* eslint-disable no-undef */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Image } from 'react-native';
import DatePicker from 'react-native-datepicker';
import { TYText } from 'tuya-panel-kit';
import PropTypes from 'prop-types';
import moment from 'moment';
import TopHeader from '../../../components/publicComponents/topHeader';
import CurveChart from './chart';
import Config from '../../../config';
import { backNavigatorLivePlay, backLivePlayWillUnmount } from '../../../config/click';
import Strings from '../../../i18n';
import TYSdk from '../../../api';
import Res from '../../../res';
import { weekData } from './weekConfig';

const { cx, isIOS, statusBarHeight, winWidth } = Config;

class StatisticPage extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    dpId: PropTypes.string.isRequired,
    legened: PropTypes.string,
  };
  static defaultProps = {
    title: Strings.getLang('ipc_statisics_page_default_title'),
    legened: Strings.getLang('ipc_statisics_page_default_legened'),
  };
  constructor(props) {
    super(props);
    this.state = {
      classDate: [
        { id: 'day', name: Strings.getLang('ipc_statisics_page_dateday'), active: true },
        { id: 'week', name: Strings.getLang('ipc_statisics_page_dateWeek'), active: false },
        { id: 'month', name: Strings.getLang('ipc_statisics_page_dateMonth'), active: false },
      ],
      datetime: moment(new Date()).format('YYYYMMDD'),
      dateFormat: 'YYYY-MM-DD',
      isWeek: false,
      // 前一天// 前一周 // 前一月
      prevDisable: false,
      nextDisable: true,
      weekNumber: 0,
      xData: [{ data: '02' }, { data: '04' }],
      yData: [{ data: 0 }, { data: 0 }],
      ymax: 10,
      weekXdata: [
        { data: Strings.getLang('ipc_statisics_page_dateMon') },
        { data: Strings.getLang('ipc_statisics_page_dateTue') },
        { data: Strings.getLang('ipc_statisics_page_dateWed') },
        { data: Strings.getLang('ipc_statisics_page_dateThu') },
        { data: Strings.getLang('ipc_statisics_page_dateFri') },
        { data: Strings.getLang('ipc_statisics_page_dateSat') },
        { data: Strings.getLang('ipc_statisics_page_dateSun') },
      ],
    };
  }
  componentDidMount() {
    this.getDayData();
  }
  componentWillUnmount() {
    // RN页面返回也应进行监听
    backLivePlayWillUnmount();
  }
  // 获取月数据
  getMonthData = () => {
    const { datetime } = this.state;
    const { dpId } = this.props;
    const month = moment(datetime).format('YYYYMM');
    const startMonthDay = `${month}01`;
    const endMonthDay = moment(datetime)
      .endOf('month')
      .format('YYYYMMDD');
    TYSdk.queryDayData(dpId, startMonthDay, endMonthDay).then(data => {
      const { result } = data;
      const xData = [];
      const yData = [];
      for (const item in result) {
        const stringx = item.substr(6, 2);
        xData.push({ data: stringx });
        yData.push({ data: Number(result[item]) });
      }
      const max = Math.max(...yData.map(x => x.data));
      this.setState({
        xData: xData.map((item, index) => ({
          ...item,
          label: (
            <TYText
              key={item.data}
              style={{
                color: 'rgb(157,158,170)',
                fontSize: 12,
                textAlign: 'center',
              }}
            >
              {index % 2 === 0 ? '' : item.data}
            </TYText>
          ),
        })),
        yData,
        ymax: max + 5,
      });
    });
  };

  // 获取日按时统计数据
  getDayData = () => {
    const { dpId } = this.props;
    const dateTime = moment(this.state.datetime).format('YYYYMMDD');
    TYSdk.queryHourData(dpId, dateTime).then(data => {
      const obj = Object.keys(data);
      if (obj.length === 0) {
        this.setState({
          xData: [
            { data: '00' },
            { data: '02' },
            { data: '04' },
            { data: '06' },
            { data: '08' },
            { data: '10' },
            { data: '12' },
            { data: '14' },
            { data: '16' },
            { data: '18' },
            { data: '20' },
            { data: '22' },
            { data: '24' },
          ],
          yData: [
            { data: 0 },
            { data: 0 },
            { data: 0 },
            { data: 0 },
            { data: 0 },
            { data: 0 },
            { data: 0 },
            { data: 0 },
            { data: 0 },
            { data: 0 },
            { data: 0 },
            { data: 0 },
            { data: 0 },
          ],
          ymax: 10,
        });
      } else {
        const xData = [];
        const yData = [];
        for (const item in data) {
          const stringx = item.substr(8, 2);
          xData.push({ data: stringx });
          yData.push({ data: Number(data[item]) });
        }
        const max = Math.max(...yData.map(x => x.data));
        this.setState({
          xData: xData.map((item, index) => ({
            ...item,
            label: (
              <TYText
                key={item.data}
                style={{
                  color: 'rgb(157,158,170)',
                  fontSize: 12,
                  textAlign: 'center',
                }}
              >
                {index % 2 !== 0 || index === 23 ? '' : item.data}
              </TYText>
            ),
          })),
          yData,
          ymax: max + 5,
        });
      }
    });
  };

  // 获取周数据
  getWeekData = () => {
    const { dpId } = this.props;
    const { weekNumber, weekXdata } = this.state;
    TYSdk.queryDayData(
      dpId,
      weekData[weekNumber].weekStartTime,
      weekData[weekNumber].weekEndTime
    ).then(data => {
      const { result } = data;
      const yData = [];
      for (const item in result) {
        yData.push({ data: Number(result[item]) });
      }
      const max = Math.max(...yData.map(x => x.data));
      this.setState({
        xData: weekXdata,
        yData,
        ymax: max + 5,
      });
    });
  };
  // 获取具体数据
  getDetailData = (id, index) => {
    const { classDate, dateFormat, datetime } = this.state;
    const oldClassDate = classDate;
    for (let i = 0; i < oldClassDate.length; i++) {
      if (i === index) {
        oldClassDate[i].active = true;
      } else {
        oldClassDate[i].active = false;
      }
    }
    switch (id) {
      case 'day':
        this.setState(
          {
            isWeek: false,
            dateFormat: 'YYYY-MM-DD',
            classDate: oldClassDate,
          },
          () => {
            this.setState(
              {
                datetime: moment(new Date()).format(dateFormat),
              },
              () => {
                this.changTimePicker(datetime, 'day');
              }
            );
          }
        );
        break;
      case 'week':
        this.setState(
          {
            isWeek: true,
            classDate: oldClassDate,
            weekNumber: 0,
            nextDisable: true,
            prevDisable: false,
          },
          () => {
            this.getWeekData();
          }
        );

        break;
      case 'month':
        this.setState(
          {
            isWeek: false,
            dateFormat: 'YYYY-MM',
            classDate: oldClassDate,
          },
          () => {
            this.setState(
              {
                datetime: moment(new Date()).format(dateFormat),
              },
              () => {
                this.changTimePicker(datetime, 'month');
              }
            );
          }
        );
        break;
      default:
        return false;
    }
  };
  backLivePage = () => {
    backNavigatorLivePlay();
  };
  // 切换日期
  changTimePicker = (datetime, id) => {
    const todayStamp = moment(moment(new Date()).format(this.state.dateFormat)).valueOf();
    const datetimeStamp = moment(datetime).valueOf();
    const findId = this.state.classDate.find((item, index) => item.active === true);
    // classId为按什么类型进行查询
    const classId = findId.id;
    if (classId === 1) {
      return false;
    }

    if (datetimeStamp - todayStamp >= 0) {
      // 这里需要提示
      this.setState(
        {
          datetime,
          nextDisable: true,
          prevDisable: false,
        },
        () => {
          // 有传id 和没传id 作区分， 传id为切换前后日期，不传id为切换日期弹框
          if (id !== undefined) {
            if (id === 'day') {
              this.getDayData();
            } else if (id === 'month') {
              this.getMonthData();
            }
          } else if (classId === 'day') {
            this.getDayData();
          } else if (classId === 'month') {
            this.getMonthData();
          }
        }
      );
    } else {
      this.setState(
        {
          datetime,
          nextDisable: false,
          prevDisable: false,
        },
        () => {
          if (id !== undefined) {
            if (id === 'day') {
              this.getDayData();
            } else if (id === 'month') {
              this.getMonthData();
            }
          } else if (classId === 'day') {
            this.getDayData();
          } else if (classId === 'month') {
            this.getMonthData();
          }
        }
      );
    }
  };
  _renderDateClassTab = () => {
    const { classDate } = this.state;
    return (
      <View style={styles.tabContainer}>
        {classDate.map((item, index) => (
          <TouchableOpacity
            style={styles.classItem}
            activeOpacity={0.9}
            key={item.id}
            onPress={() => this.getDetailData(item.id, index)}
          >
            <TYText style={[styles.classText, { color: item.active ? '#000' : '#a4a4a4' }]}>
              {item.name}
            </TYText>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // 日期往前推一天
  prevDate = () => {
    const { classDate, datetime, dateFormat } = this.state;
    const findId = classDate.find(item => item.active === true);
    switch (findId.id) {
      case 'day':
        const dateTime = moment(datetime)
          .subtract(1, 'days')
          .format(dateFormat);
        this.changTimePicker(dateTime, 'day');
        break;
      case 'week':
        let { weekNumber } = this.state;
        if (++weekNumber >= 10) {
          this.setState({
            prevDisable: true,
            nextDisable: false,
          });
        } else {
          this.setState({
            prevDisable: false,
            nextDisable: false,
          });
        }
        this.setState(
          {
            weekNumber,
          },
          () => {
            this.getWeekData();
          }
        );
        break;
      case 'month':
        const dateTime2 = moment(this.state.datetime)
          .subtract(1, 'months')
          .format(this.state.dateFormat);
        this.changTimePicker(dateTime2, 'month');
        break;
      default:
        return false;
    }
  };

  // 日期往后推一天
  nextDate = () => {
    const { classDate, datetime, dateFormat } = this.state;
    const findId = classDate.find((item, index) => item.active === true);
    switch (findId.id) {
      case 'day':
        const dateTime = moment(datetime)
          .add(1, 'days')
          .format(this.state.dateFormat);
        this.changTimePicker(dateTime, 'day');
        break;
      case 'week':
        let { weekNumber } = this.state;
        if (--weekNumber <= 0) {
          this.setState({
            prevDisable: false,
            nextDisable: true,
          });
        } else {
          this.setState({
            prevDisable: false,
            nextDisable: false,
          });
        }
        this.setState(
          {
            weekNumber,
          },
          () => {
            this.getWeekData();
          }
        );
        break;
      case 'month':
        const dateTime2 = moment(datetime)
          .add(1, 'months')
          .format(dateFormat);
        this.changTimePicker(dateTime2, 'month');
        break;
      default:
        return false;
    }
  };

  _renderDatePicker = () => {
    const { isWeek, datetime, dateFormat, prevDisable, weekNumber } = this.state;
    return (
      <View style={styles.datePickerContainer}>
        <TouchableOpacity style={styles.arrowIcon} onPress={this.prevDate} disabled={prevDisable}>
          <Image
            style={[styles.arrowImg, { tintColor: prevDisable ? '#a4a4a4' : '#000000' }]}
            source={Res.statisics.arrow}
          />
        </TouchableOpacity>
        {isWeek ? (
          <View style={styles.dateContent}>
            <TYText style={styles.dateText}>{weekData[weekNumber].weekName}</TYText>
          </View>
        ) : (
          <DatePicker
            btnTextConfirm={{ color: 'red' }}
            maxDate={new Date()}
            style={{ minWidth: cx(100) }}
            date={datetime}
            mode="date"
            format={dateFormat}
            androidMode="calendar"
            confirmBtnText={Strings.getLang('confirm_btn')}
            cancelBtnText={Strings.getLang('cancel_btn')}
            showIcon={false}
            customStyles={{
              dateInput: {
                borderWidth: 0,
              },
            }}
            onDateChange={datetime => this.changTimePicker(datetime)}
          />
        )}
        <TouchableOpacity
          style={styles.arrowIcon}
          onPress={this.nextDate}
          disabled={this.state.nextDisable}
        >
          <Image
            source={Res.statisics.arrow}
            style={[
              styles.reverse,
              styles.arrowImg,
              { tintColor: this.state.nextDisable ? '#a4a4a4' : '#000000' },
            ]}
          />
        </TouchableOpacity>
      </View>
    );
  };
  render() {
    const { title, legened } = this.props;
    const { xData, yData, ymax } = this.state;
    return (
      <View style={styles.statisticPage}>
        <StatusBar
          barStyle={isIOS ? 'dark-content' : 'light-content'}
          translucent={true}
          backgroundColor="transparent"
        />
        <View style={{ paddingTop: isIOS ? 0 : statusBarHeight, backgroundColor: '#000000' }}>
          <TopHeader hasRight={false} contentTitle={title} leftPress={this.backLivePage} />
        </View>
        {this._renderDateClassTab()}
        {this._renderDatePicker()}
        <CurveChart
          yData={yData}
          xData={xData}
          yMax={ymax}
          yMin={0}
          title={{
            title: legened,
            style: {
              borderWidth: 1,
              borderColor: '#333',
              padding: 10,
              left: 12,
              color: '#000',
            },
          }}
          chartHeight={336}
          chartWidth={winWidth}
          style={{ backgroundColor: '#ffffff' }}
          hasShadow={true}
          activeCircle={true}
          hasCircle={true}
          dashLine={{
            color: 'red',
            show: true,
            dashLineConfig: [
              { type: 'custom', custom: 10 },
              { type: 'custom', custom: 0 },
            ],
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  statisticPage: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    height: cx(40),
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#efefef',
    backgroundColor: '#fff',
  },
  classItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classText: {
    fontSize: cx(12),
  },
  datePickerContainer: {
    height: cx(36),
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    width: cx(48),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowImg: {
    width: '100%',
    resizeMode: 'contain',
  },
  dateContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    // paddingLeft: cx(20),
    // paddingRight: cx(20),
    minWidth: cx(100),
    textAlign: 'center',
    color: '#000000',
    fontSize: cx(14),
  },
  reverse: {
    transform: [{ rotateY: '180deg' }],
  },
});

export default StatisticPage;
