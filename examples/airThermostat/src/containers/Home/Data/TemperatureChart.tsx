import _ from 'lodash';
import { View, StyleSheet } from 'react-native';
import F2Chart from 'components/F2Chart';
import React, { PureComponent } from 'react';
import moment from 'moment';
import dpCodes from 'config/default/dpCodes';
import { TYSdk, Utils } from 'tuya-panel-kit';

const { tempIndoorCode } = dpCodes;
const { convertX: cx, convertY: cy } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

interface Props {
  theme?: any;
}

const tooltipHeight = 44;
const GAP = 8;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
@withTheme
export default class TemperatureChart extends PureComponent<Props> {
  getRandomData() {
    return _.times(_.random(10, 99), n => ({
      value: _.random(30, 50),
      date: moment().subtract(6, 'months').add(n, 'days').format('YYYY-MM-DD'),
    }));
  }

  registerInsertCss = () => {
    return `
    (function(){
      var containers=[];var styleElements=[];var usage="insert-css: You need to provide a CSS string. Usage: insertCss(cssString[, options]).";function insertCss(css,options){options=options||{};if(css===undefined){throw new Error(usage)}var position=options.prepend===true?"prepend":"append";var container=options.container!==undefined?options.container:document.querySelector("head");var containerId=containers.indexOf(container);if(containerId===-1){containerId=containers.push(container)-1;styleElements[containerId]={}}var styleElement;if(styleElements[containerId]!==undefined&&styleElements[containerId][position]!==undefined){styleElement=styleElements[containerId][position]}else{styleElement=styleElements[containerId][position]=createStyleElement();if(position==="prepend"){container.insertBefore(styleElement,container.childNodes[0])}else{container.appendChild(styleElement)}}if(css.charCodeAt(0)===65279){css=css.substr(1,css.length)}if(styleElement.styleSheet){styleElement.styleSheet.cssText+=css}else{styleElement.textContent+=css}return styleElement}function createStyleElement(){var styleElement=document.createElement("style");styleElement.setAttribute("type","text/css");return styleElement};
      window.insertCss = insertCss;
    })();
    `;
  };

  renderBasicLineChart = (data: any) => {
    const { theme } = this.props;
    const {
      global: { brand: themeColor },
    } = theme;
    const { min, max } = TYSdk.device.getDpSchema(tempIndoorCode) || { min: 0, max: 50 };
    return `
      ${this.registerInsertCss()}
      insertCss('.chart-wrapper {position: relative;}.f2-tooltip{-webkit-box-shadow: 1px 1px 0.5px 0.5px rgba(0, 0, 0, 0.3);box-shadow: 1px 1px 0.5px 0.5px rgba(0, 0, 0, 0.3);position: absolute;z-index: 99;background-color:${themeColor};background-image: linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0));background-image: -webkit-linear-gradient(to right, rgba(255,255,255,0.4), rgba(255,255,255,0));background-blend-mode: soft-light;padding:5px 10px;border-radius: 6px;opacity: 0;box-sizing: border-box;height: ${tooltipHeight}px;transform:xtranslateX(-50%);}.f2-tooltip span {display: block;color: #fff;white-space:nowrap;}.f2-tooltip span:nth-child(1) {font-size: 12px !important;opacity: 0.5;}.f2-tooltip span:nth-child(2){font-size: 14px !important;}')
      var tooltipPanel = document.createElement('div');
      tooltipPanel.setAttribute('class', 'f2-tooltip');
      document.body.appendChild(tooltipPanel);
      chart.source(${JSON.stringify(data)}, {
        value: {
          ticks: [${min}, ${Math.round((min + max) / 2)}, ${max}],
          tickCount: 3,
          min: ${min},
          max: ${max}
        },
        date: {
          type: 'timeCat',
          range: [0, 1],
          tickCount: 3
        }
      });
      chart.tooltip({
        custom: false,
        showTitle: true,
        showXTip: false,
        showCrosshairs: true,
        crosshairsStyle: {
          lineDash: [2]
        },
        offsetY: -10,
        tooltipMarkerStyle: {
          radius: 5,
          fill: '${themeColor}',
          lineWidth: 3,
          stroke: '#fff'
        },
        layout: 'vertical',
        background: {
          radius: 6,
          fill: '#1890FF',
          padding: [ 4, 10 ],
          fill: '${themeColor}',
        },
        custom: true,
        onChange: function(ev) {
          var currentData = ev.items[0]; 
          var tr = ev.tooltip.plotRange.tr;
          var tl = ev.tooltip.plotRange.tl;
          tooltipPanel.style.left = currentData.x + 'px';
          tooltipPanel.style.top = currentData.y - ${GAP} - ${tooltipHeight} + 'px';
          tooltipPanel.style.opacity = 1;
          // tooltipPanel.innerHTML = JSON.stringify(currentData);
          tooltipPanel.innerHTML = '<span>'+ currentData.title + '</span><span>'+ currentData.value +'</span>';
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
      chart.axis('date', {
        line: null,
        label: function label(text, index, total) {
          var textCfg = {};
          if (index === 0) {
            textCfg.textAlign = 'left';
          } else if (index === total - 1) {
            textCfg.textAlign = 'right';
          }
          textCfg.textAlign = 'start';
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
      chart.area().position('date*value').color('l(90) 0:${themeColor} 0.7:${themeColor} 1:#fff');
      chart.line().position('date*value').color('${themeColor}');
      chart.render();
    `;
  };

  render() {
    return (
      <View style={styles.box}>
        <F2Chart
          data={this.getRandomData()}
          chartConfig={{
            padding: [tooltipHeight + GAP, 0, 24, 0],
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
