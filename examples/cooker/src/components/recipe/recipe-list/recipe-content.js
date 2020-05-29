/* eslint-disable indent */
/* eslint-disable max-len */
/* eslint-disable no-return-assign */
import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, LayoutAnimation, UIManager } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import Strings from '../i18n';
import TYSdk from '../api';
import Tabs from './recipe-tabs';
import RecipeLists from './recipe-lists';
import RecipeIndexer from './recipe-indexer';
import { formatRecipeList, formatRecipeDetail } from '../utils';
import LazyLoadView from '../lazyload-view';
import Config from '../../../config';

const { convertY: cy } = Utils.RatioUtils;
const PUBLIC = Strings.getLang('public_tab');
export default class RecipeList extends LazyLoadView {
  static propTypes = {
    iconTitle: PropTypes.string,
    image: PropTypes.number,
    recipes: PropTypes.array,
    navigator: PropTypes.any,
    category: PropTypes.string,
  };

  static defaultProps = {
    iconTitle: '',
    image: null,
    recipes: [],
    navigator: null,
    category: Strings.getLang('all'),
  };

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      recipes: props.recipes,
      selected: 0,
      selectIndexer: 0,
      isManual: false,
    };
    this._list = null;
    this._init = null;
    this.disableInterAction = true;
    this.layout = _.once(this._onLayout);
    // this.hideEmptyView = true;
    // this.hideEmptyView = true;
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  componentWillUnmount() {
    this.onDestroy();
    LayoutAnimation.configureNext(null);
  }

  runActionsAfterRouteTransition = () => {
    this._fetchData();
  };

  onDestroy = () => {
    clearTimeout(this._init);
  };

  onRefresh = () => {
    const callBack = () => {
      this.setState({ loading: true });
      this._content && this._content.onRefreshClose();
    };
    this._fetchData(callBack, callBack);
  };

  onTabClick = (index, manual) => {
    const { isManual } = this.state;
    const m = manual || isManual;
    this.onIndexerScroll({ index, isManual: m });
  };

  onClickIndexer = index => this.onIndexerScroll({ index, isManual: true });

  onIndexerScroll = ({ index, isManual }) => {
    const { selectIndexer } = this.state;
    const { indexer } = this.formatDatas();
    const i = Math.min.apply(null, [index, indexer.length - 1]);
    selectIndexer !== i &&
      this.setState({ selectIndexer: i }, () => {
        this._list && isManual && this._list._onItemSelect(i);
      });
  };

  handleCurIndex = (...args) => {
    this.onTabClick(...args);
  };

  formatDatas = () => {
    const { recipes } = this.state;
    const tabs = recipes.length === 0 ? [] : this._getTabDatas();
    const datas = recipes.length === 0 ? [] : this._getRecipeList();
    const sections = formatRecipeList(datas);
    const indexer = sections.map(({ title }) => title);
    return { datas, sections, indexer, tabs };
  };

  mergeStyle = () => ({
    emptyContainer: {
      backgroundColor: '#fff',
    },
    emptyContent: {
      backgroundColor: '#fff',
    },
  });

  mergeTopBar = () => ({
    style: { backgroundColor: 'black', color: '#fff' },
    barStyle: 'light-content',
    title: ' ',
    actions: [],
    onBack: TYSdk.Navigator.pop,
  });

  _fetchData = async () => {
    const { isError } = this.state;
    try {
      // error 时回调中会带userInfo
      const recipeLists = await TYSdk.getRecipes('', 2000, Config.devInfo.productId);
      if ('contentList' in recipeLists) {
        isError && this.setState({ isError: false });
        const fetchDatas = recipeLists.contentList;
        const recipes = formatRecipeDetail(recipeLists, fetchDatas);
        const indexer = recipes.map(({ pinyin }) => pinyin);
        this.onDataReachedWithCallBack(() => {
          this.setState({ recipes, indexer });
        });
      } else if ('totalRecords' in recipeLists) {
        recipeLists.totalRecords === 0 && this.onDataReachedButEmpty();
      }
    } catch (error) {
      console.log('error', error);
      this.onError();
    }
  };

  _getTabDatas = () => {
    let tabs = [Strings.getLang('all')];
    const { recipes } = this.state;
    tabs = _.flattenDeep([
      ...tabs,
      ...recipes.map(({ categoryName, hard_level }) => categoryName || (hard_level && PUBLIC)),
    ]);
    return _.uniq(tabs);
  };

  handleTabClick = id => {
    this.setState({ selected: id, selectIndexer: 0 });
  };

  handleDrag = () => {
    const { isManual } = this.state;
    isManual && this.setState({ isManual: false });
  };

  _getRecipeList = tab => {
    const tabs = tab || this._getTabDatas();
    const { selected, recipes } = this.state;
    const mergeRecipes = recipes.map((d, i) => Object.assign({}, d, { index: i }));
    const selectType = tabs[selected];
    const datas =
      selected === 0
        ? mergeRecipes
        : mergeRecipes.filter(({ categoryName, hard_level }) =>
            _.isArray(categoryName)
              ? categoryName.includes(selectType)
              : categoryName === selectType || (selectType === PUBLIC && hard_level)
          );
    return datas;
  };

  _onLayout = e => {
    const { width, height } = e.nativeEvent.layout;
    this._empty &&
      this._empty.setNativeProps({
        width,
        height,
      });
    this._indexer &&
      this._indexer.setNativeProps({
        height,
      });
  };

  _onHandleEvent = flag => {
    const { isManual } = this.state;
    isManual !== flag && this.setState({ isManual: flag });
  };

  renderBody = () => {
    const { navigator, category } = this.props;
    const { selectIndexer, isManual, loading } = this.state;
    const { tabs, sections, indexer } = this.formatDatas();
    return (
      <View onLayout={this.layout} style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.tabContainer}>
          <Tabs onTabClick={this.handleTabClick} initSelected={category} tabs={tabs} />
        </View>
        <RecipeLists
          ref={ref => (this._list = ref)}
          onRefresh={this.onRefresh}
          navigator={navigator}
          sections={sections}
          select={selectIndexer}
          isManual={isManual}
          handleDrag={this.handleDrag}
          handleCurIndex={this.handleCurIndex}
          showsVerticalScrollIndicator={false}
          loading={loading}
          onPress={this.handleCellPress}
        />
        <RecipeIndexer
          ref={ref => (this._indexer = ref)}
          datas={indexer}
          selected={selectIndexer}
          onTabClick={this.onClickIndexer}
          onResponseRelease={() => this._onHandleEvent(false)}
          onResponseMove={() => this._onHandleEvent(true)}
        />
      </View>
    );
  };
}

const styles = StyleSheet.create({
  tabContainer: {
    height: cy(41),
  },
});
