/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import Tabs from '../../components/tab';
import Setting from './home-setting-view';
import ModeTab from '../../components/mode-tab-view';
import HomeRecipeView from './home-recipe-view';
import HomeCollectRecipeView from './home-collect-recipe-view';
import Config from '../../config';

const { convertX: cx } = Utils.RatioUtils;
export default class HomeBottomView extends Component {
  static propTypes = {
    power: PropTypes.bool,
    setTabState: PropTypes.func,
    tabIndex: PropTypes.number,
    mode: PropTypes.string,
    auto: PropTypes.bool,
    tabs: PropTypes.array,
    handleCollectRecipePress: PropTypes.func,
    handleModePress: PropTypes.func,
  };

  static defaultProps = {
    power: false,
    setTabState: () => {},
    tabIndex: 0,
    mode: '',
    auto: false,
    tabs: [],
    handleCollectRecipePress: () => {},
    handleModePress: () => {},
  };

  renderTabCell = (tab = '') => {
    const { mode, auto, tabIndex, tabs, handleCollectRecipePress, handleModePress } = this.props;
    const { themeColor } = Config.themeData;
    const { key } = tabs[tabIndex] || {};
    switch (tab) {
      case 'mode':
        return (
          <ModeTab themeColor={themeColor} modeSelect={mode} handleModePress={handleModePress} />
        );
      case 'other':
        return <Setting auto={auto} />;
      case 'homeRecipe':
        return <HomeRecipeView selected={key === 'homeRecipe'} />;
      case 'collect':
        return <HomeCollectRecipeView handleCollectRecipePress={handleCollectRecipePress} />;
      default:
        break;
    }
  };

  render() {
    const { tabIndex, setTabState, power, tabs } = this.props;
    const { key } = tabs[tabIndex] || {};
    const otherOption = power ? {} : { pointerEvents: 'box-only' };
    const { themeColor } = Config.themeData;
    return (
      <View style={styles.container} {...otherOption}>
        <Tabs
          underLineColor={themeColor}
          onTabClick={setTabState}
          selected={tabIndex}
          tabs={tabs}
        />
        {this.renderTabCell(key)}
        {!power && <View style={styles.modal} />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: cx(104),
    backgroundColor: '#fff',
  },

  modal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255, .5)',
  },
});
