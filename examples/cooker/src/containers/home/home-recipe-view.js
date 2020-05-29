/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { LazyLoadView } from '../../components/recipe';
import { Utils } from 'tuya-panel-kit';
import { Navigator } from 'react-native-deprecated-custom-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchRecipes } from '../../redux/modules/recipes';
import { jumpToSense } from '../../utils';
import Cell from './category-cell';
import TYSdk from '../../api';
import { MagicFlatList } from 'react-native-magic-list';

const { convertX: cx } = Utils.RatioUtils;
const Res = {
  bg: require('../../res/category_bg.png'),
};
class HomeRecipeView extends LazyLoadView {
  static propTypes = {
    auto: PropTypes.bool,
    data: PropTypes.array,
    fetchRecipes: PropTypes.func,
    productId: PropTypes.string.isRequired,
  };

  static defaultProps = {
    auto: false,
    data: [],
    fetchRecipes: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      loading: props.data.length === 0,
      data: props.data,
    };

    this.hideEmptyView = true;
    this.hideToast = true;
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.toastState !== nextProps.toastState) {
      this.errorText = nextProps.toastState.errorText;
      this.setState({ isError: nextProps.toastState.state });
    }
  }

  componentWillUnmount() {
    LayoutAnimation.configureNext(null);
  }

  handleCategoryPress = (category = '') => {
    jumpToSense({
      id: 'recipeList',
      category,
      sceneConfigs: {
        ...Navigator.SceneConfigs.FloatFromBottom,
        // gestures: null, // 阻止ios左滑
      },
    });
  };

  fetchData = async () => {
    try {
      const { isError } = this.state;
      const { categoryList = [] } = (await TYSdk.getCategoryList()) || {};
      const data = categoryList.map(({ name, picUrl } = {}) => ({
        category: name,
        picUrl: picUrl || Res.bg,
      }));
      isError && this.setState({ isError: false });
      const len = data.length;
      len === 0 && this.onDataReachedButEmpty();
      len > 0 &&
        this.onDataReachedWithCallBack(() => {
          this.setState({ data });
        });
    } catch (error) {
      this.onError();
    }
  };

  mergeTopBar = () => ({
    hideTopbar: true,
  });

  renderItem = ({ picUrl, category }, index) => (
    <Cell
      category={category}
      index={index}
      pic={picUrl}
      onPress={() => this.handleCategoryPress(category)}
    />
  );

  renderBody = () => {
    const { loading, data } = this.state;
    return (
      <MagicFlatList
        style={styles.container}
        initialNumToRender={6}
        keyExtractor={(__, index) => `cell_${index}`}
        snapToAlignment="start"
        decelerationRate="fast"
        data={data}
        renderItem={({ item, index }) => this.renderItem(item, index)}
        refreshing={loading}
        onRefresh={this.fetchData}
        showsVerticalScrollIndicator={false}
        animateType="fadeInUp"
        delay={2}
      />
    );
  };
}

const styles = StyleSheet.create({
  container: {
    marginTop: cx(10),
  },
});

export default connect(
  ({ toastState, devInfo }) => ({
    toastState,
    productId: devInfo.productId,
  }),
  dispatch =>
    bindActionCreators(
      {
        fetchRecipes,
      },
      dispatch
    )
)(HomeRecipeView);
