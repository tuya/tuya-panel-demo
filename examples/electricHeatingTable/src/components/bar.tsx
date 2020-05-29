import _ from 'lodash';
import React, { Component } from 'react';
import F2Chart from './f2-chart';
import { CurvData } from '../config/interface';
import { i18n, average } from '../utils';

interface ContentProps {
  width: number;
  height: number;
  curvData: CurvData[];
  unit: string;
  mykey: any;
  themeColor: string;
}

export default class Bar extends Component<ContentProps> {
  _renderBasicLineChart(data: CurvData[], unit: string, themeColor: string) {
    const max = Math.max(...data.map(item => item.value));
    const valueMax = max + parseInt(`${max / 3}`, 10);
    const averData = average(data.map(item => +item.value));
    return `
    chart.source(${JSON.stringify(data)}, {
      sales: {
        tickCount: 5
      },
      value: {
        min: 0,
        max: ${valueMax},
        ticks: ['${averData}'],
      }
    });
    chart.axis('date', {
      labelOffset: 10,
      line: null,
      label: function label(text, index, total) {
        var textCfg = {};
        if (index === 0) {
          textCfg.textAlign = 'left';
        } else if (index === total - 1) {
          textCfg.textAlign = 'right';
        }
        textCfg.text = (text.slice(3,5)) % Math.ceil(total/2)===0|| (text.slice(3,5)) == total ||text.slice(3,5)==='01' ? text : null;
        return textCfg;
      }
    });
    chart.axis('value', {
      label: function label(text, index, total) {
        var textCfg = {};
        textCfg.text = text == '${averData}' ? text : null;
        return textCfg;
      }
    });
    chart.tooltip({
      showTitle: true,
      showItemMarker: false,
      offsetY: 30, 
      showTooltipMarker:false,
      background: {
        radius: 4,
        fill: '${themeColor}',
        padding: 10
      },
      valueStyle: {
        fontSize: 20,
        fill: '#fff',
        textAlign: 'start',
        textBaseline: 'middle'
      },
      onShow: function onShow(ev) {
        var items = ev.items;
        items[0].name = null;
        items[0].value = items[0].value + '${unit}';
      }
    });
    chart.interval().position('date*value').color('${themeColor}');
    chart.render();
  `;
  }

  render() {
    return (
      <F2Chart
        key={this.props.mykey}
        data={this.props.curvData}
        renderer={(data: CurvData[]) =>
          this._renderBasicLineChart(data, this.props.unit, this.props.themeColor)
        }
        height={this.props.height}
        type="light"
        placeholder={i18n('noData')}
        width={this.props.width}
      />
    );
  }
}
