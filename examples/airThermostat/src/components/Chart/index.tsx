import _ from 'lodash';
import { View, StyleSheet } from 'react-native';
import F2Chart from 'components/F2Chart';
import React, { PureComponent } from 'react';
import moment from 'moment';
import { TYSdk, Utils } from 'tuya-panel-kit';
import { fetch } from 'api/index';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

type TimeType = 'minute' | 'hour' | 'day' | 'month' | 'week';
type DataType = 'sum' | 'minux' | 'max' | 'avg';
interface Params {
  // 统计设备每15分钟上报的历史数据
  startMinute?: string; // 201805290000
  endMinute?: string; // 201805292359

  // 统计设备每小时上报的历史数据，只支持 avg 和 max
  date?: string; // 20180529

  // 统计设备每天上报的历史数据
  startDay?: string; // 20180529
  endDay?: string; // 20180531

  // 传入week的范围，返回这week范围内的数据
  startWeek?: string; // 20180531
  endWeek?: string; // 20180531

  // 设备的某个dp点的按月（一年）的统计结果
  startMonth?: string; // 20180531
  endMonth?: string; // 20180531

  auto?: 1 | 2;
  type?: DataType;
}
// 接口信息
const ApiConfig = {
  minute: 'tuya.m.dp.path.15minute.list',
  hour: 'tuya.m.dp.rang.stat.hour.list',
  day: 'tuya.m.dp.rang.stat.day.list',
  week: 'tuya.m.dp.rang.stat.week.list',
  month: 'tuya.m.dp.rang.stat.month.list',
};
// 返回的时间数据格式
const TimeFormater = {
  minute: 'YYYYMMDDHHmm',
  hour: 'YYYYMMDDHH',
  day: 'YYYYMMDD',
  month: 'YYYYMM',
  week: '',
};

const FormaterTitle = {
  minute: 'function(v){if (v<10) {return "0"+v;} return v; }',
  hour: 'function(v){if (v<10) {return "0"+v+":00";} return v+":00"; }',
  day: 'function(v){if (v<10) {return "0"+v;} return v; }',
  month: 'function(v){if (v<10) {return "0"+v;} return v; }',
  // todo
  week: `function(v){var weeks = ['','','','','','','']; return weeks[v];}`,
};

const defaultProps = {
  tooltipHeight: 44,
  tooltipGap: 8,
  tooltipClassName: 'f2-tooltip',
  contentTpl: '<span>{title}</span><span>{value}</span>',
  formatValue: 'function(x) {return x;}',
  min: 0,
  max: 50,
  timeType: 'hour' as TimeType,
  params: {} as Params,
};

type Props = Readonly<typeof defaultProps> & {
  dpCode: string;
  tooltipCss?: string;
  theme?: any;
  devId: string;
};

interface State {
  data: any[];
  loading: boolean;
  chartCodeTpl: string;
}

@withTheme
export default class Chart extends PureComponent<Props, State> {
  static defaultProps = defaultProps;
  constructor(props: Props) {
    super(props);
    this.state = { data: [], loading: true, chartCodeTpl: this.getChartCode(this.props) };
  }
  componentWillReceiveProps(nextProps: Props) {
    const { dpCode, params, timeType } = nextProps;
    const { dpCode: oldDpCode, params: oldParams, timeType: oldTimeType } = this.props;
    if (this.isChangeChartStyle(nextProps)) {
      this.setState({ chartCodeTpl: this.getChartCode(nextProps) });
    }
    if (dpCode !== oldDpCode || timeType !== oldTimeType || !_.isEqual(oldParams, params)) {
      !this.state.loading && this.fetchData({ dpCode, timeType, params });
    }
  }

  componentDidMount() {
    this.fetchData(this.props);
  }

  isChangeChartStyle(nextProps: Props) {
    const keys = [
      'theme.global.brand',
      'min',
      'max',
      'tooltipClassName',
      'tooltipCss',
      'tooltipGap',
      'tooltipHeight',
      'formatValue',
    ];
    return keys.some(key => {
      return _.get(nextProps, key) !== _.get(this.props, key);
    });
  }

  fetchData({ timeType, params, dpCode }: { timeType: TimeType; params: Params; dpCode: string }) {
    const { devId } = this.props;
    this.setState({ loading: true });
    const api = ApiConfig[timeType];
    const dpId = TYSdk.device.getDpIdByCode(dpCode);
    fetch(api, { devId, dpId, auto: 1, ...params })
      .then((data: any) => {
        let result: any[] = [];
        if (timeType === 'day') {
          result = data.days.map((time: string, index: number) => {
            const day = time.split('-')[1] || 0;
            return { time: day, value: data.values[index] };
          });
        } else {
          result = Object.keys(data).map(time => {
            const hour = moment(time, TimeFormater[timeType]).hour();
            return { time: hour, value: data[time] };
          });
        }
        this.setState({ loading: false, data: result });
      })
      .catch(() => {
        this.setState({ loading: false, data: [] });
      });
  }
  registerInsertCss = () => {
    return `
    (function(){
      var containers=[];var styleElements=[];var usage="insert-css: You need to provide a CSS string. Usage: insertCss(cssString[, options]).";function insertCss(css,options){options=options||{};if(css===undefined){throw new Error(usage)}var position=options.prepend===true?"prepend":"append";var container=options.container!==undefined?options.container:document.querySelector("head");var containerId=containers.indexOf(container);if(containerId===-1){containerId=containers.push(container)-1;styleElements[containerId]={}}var styleElement;if(styleElements[containerId]!==undefined&&styleElements[containerId][position]!==undefined){styleElement=styleElements[containerId][position]}else{styleElement=styleElements[containerId][position]=createStyleElement();if(position==="prepend"){container.insertBefore(styleElement,container.childNodes[0])}else{container.appendChild(styleElement)}}if(css.charCodeAt(0)===65279){css=css.substr(1,css.length)}if(styleElement.styleSheet){styleElement.styleSheet.cssText+=css}else{styleElement.textContent+=css}return styleElement}function createStyleElement(){var styleElement=document.createElement("style");styleElement.setAttribute("type","text/css");return styleElement};
      window.insertCss = insertCss;
    })();
    `;
  };
  getTimeRange(timeType: TimeType, params: Params) {
    switch (timeType) {
      case 'minute':
        return { min: 0, max: 60 };
      case 'hour':
        return { min: 0, max: 24 };
      case 'day':
        const { startDay, endDay } = params;
        return {
          min: moment(startDay, TimeFormater.day).date(),
          max: moment(endDay, TimeFormater.day).date(),
        };
      case 'month':
        return { min: 1, max: 12 };
      case 'week':
        return { min: 0, max: 6 };
    }
  }
  getChartCode = (props: Props) => {
    const {
      theme,
      timeType,
      min,
      max,
      tooltipClassName,
      tooltipCss,
      tooltipGap,
      tooltipHeight,
      params,
      formatValue,
    } = props;
    const {
      global: { brand: themeColor },
    } = theme;
    const { min: minTime, max: maxTime } = this.getTimeRange(timeType, params);
    const formatFun = FormaterTitle[timeType];
    const tooltipClassInfo =
      tooltipCss ||
      `.f2-tooltip{-webkit-box-shadow: 1px 1px 0.5px 0.5px rgba(0, 0, 0, 0.3);box-shadow: 1px 1px 0.5px 0.5px rgba(0, 0, 0, 0.3);position: absolute;z-index: 99;background-color:${themeColor};background-image: linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0));background-image: -webkit-linear-gradient(to right, rgba(255,255,255,0.4), rgba(255,255,255,0));background-blend-mode: soft-light;padding:5px 10px;border-radius: 6px;opacity: 0;box-sizing: border-box;height: ${tooltipHeight}px;transform:xtranslateX(-50%);}.f2-tooltip span {display: block;color: #fff;white-space:nowrap;}.f2-tooltip span:nth-child(1) {font-size: 12px !important;opacity: 0.5;}.f2-tooltip span:nth-child(2){font-size: 14px !important;}`;
    return `
      ${this.registerInsertCss()}
      insertCss('.chart-wrapper {position: relative;}${tooltipClassInfo}');
      var tooltipPanel = document.createElement('div');
      tooltipPanel.setAttribute('class', '${tooltipClassName}');
      document.body.appendChild(tooltipPanel);
      var formateTitle = ${formatFun};
      var formateValue= ${formatValue};
      chart.source(#{data}, {
        value: {
          type: 'linear',
          tickCount: 3,
          min: ${min},
          max: ${max},
        },
        time: {
          type: 'linear',
          min: ${minTime},
          max: ${maxTime},
          formatter: formateTitle,
          tickCount: 3,
        }
      });
      chart.tooltip({
        showCrosshairs: true,
        crosshairsStyle: {
          lineDash: [2],
          stroke: '${themeColor}',
        },
        tooltipMarkerStyle: {
          radius: 5,
          fill: '${themeColor}',
          lineWidth: 3,
          stroke: '#fff',
        },
        custom: true,
        onChange: function(ev) {
          var currentData = ev.items[0]; 
          var tr = ev.tooltip.plotRange.tr;
          var tl = ev.tooltip.plotRange.tl;
          tooltipPanel.style.left = currentData.x + 'px';
          tooltipPanel.style.top = currentData.y - ${tooltipGap} - ${tooltipHeight} + 'px';
          tooltipPanel.style.opacity = 1;
          tooltipPanel.innerHTML = '<span>'+ currentData.title + '</span><span>'+ formateValue(currentData.value) +'</span>';
          var contentWidth = tooltipPanel.clientWidth;
          var left = currentData.x - contentWidth / 2;
          if (left < tl.x ) {
            left = tl.x;
          } else if (left + contentWidth > tr.x ) {
            left = tr.x - contentWidth;
          }
          tooltipPanel.style.left = left + 'px';
        },
        onHide: function(ev) {
          tooltipPanel.style.opacity = 0;
        },
      });
      chart.axis('time', {
        line: null,
        label: function label(text, index, total) {
          var textCfg = {};
          if (index === 0) {
            textCfg.textAlign = 'left';
            textCfg.text = ' ' + text;
          } else if (index === total - 1) {
            textCfg.textAlign = 'right';
            textCfg.text =  text + ' ';
          }
          return textCfg;
        }
      });
      chart.axis('value', {
        labelOffset: -2,
        label: function label(text, index, total) {
          var textCfg = {textBaseline: 'bottom', fontStyle: '${themeColor}'};
          if (index === 0 || index === total - 1) {
            textCfg.opacity = 0 ;
          }
          return textCfg;
        },
        grid: function grid(text, index, total) {
          var textCfg = {};
          if (index === 0 || index === total - 1) {
            textCfg.strokeOpacity = 0 ;
          }
          return textCfg;
        },
      });
      chart.area().position('time*value').color('l(90) 0:${themeColor} 0.7:${themeColor} 1:#fff');
      chart.line().position('time*value').color('${themeColor}');
      chart.render();
    `;
  };
  renderBasicLineChart = (data: any) => {
    const { chartCodeTpl } = this.state;
    const dataJSON = JSON.stringify(data);
    return chartCodeTpl.replace('#{data}', dataJSON);
  };
  render() {
    const { theme, tooltipGap, tooltipHeight } = this.props;
    const { data } = this.state;
    return (
      <View style={styles.box}>
        <F2Chart
          width={chartWidth}
          height={chartHeight}
          data={data}
          chartConfig={{
            padding: [tooltipHeight + tooltipGap, 0, 28, 0],
            width: chartWidth,
            height: chartHeight,
          }}
          renderer={this.renderBasicLineChart}
        />
      </View>
    );
  }
}

const chartWidth = cx(327);
const chartHeight = cx(248);

const styles = StyleSheet.create({
  box: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    width: chartWidth,
    height: chartHeight,
  },
});
