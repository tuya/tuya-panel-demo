/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { LayoutAnimation, UIManager, Platform, StyleSheet } from 'react-native';
import { LazyLoadView } from '../../components/recipe';
import { Utils } from 'tuya-panel-kit';
import { Navigator } from 'react-native-deprecated-custom-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setCollectRecipes } from '../../redux/modules/recipes';
import { setLogoState } from '../../redux/modules/workState';
import _ from 'lodash';
import { jumpToSense, formatRecipeDetail } from '../../utils';
import Cell from './recipe-cell';
import TYSdk from '../../api';
import { MagicFlatList } from 'react-native-magic-list';
import Config from '../../config';

const { convertX: cx } = Utils.RatioUtils;
class HomeRecipeView extends LazyLoadView {
  static propTypes = {
    auto: PropTypes.bool,
    data: PropTypes.array,
    setCollectRecipes: PropTypes.func,
    currentRecipe: PropTypes.object.isRequired,
    handleCollectRecipePress: PropTypes.func,
  };

  static defaultProps = {
    auto: false,
    data: [],
    setCollectRecipes: () => {},
    handleCollectRecipePress: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      loading: true,
      recipes: [],
      id: _.get(props.currentRecipe, 'id', 0),
      showSelect: false,
    };

    this.hideEmptyView = true;
    this.hideToast = true;
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  componentDidMount() {
    this.fetchData();
    TYSdk.event.on('collectUpdate', this.fetchData);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.toastState !== nextProps.toastState) {
      this.errorText = nextProps.toastState.errorText;
      this.setState({ isError: nextProps.toastState.state });
    }
    if (this.props.currentRecipe !== nextProps.currentRecipe) {
      this.setState({ id: _.get(nextProps.currentRecipe, 'id', 0) });
    }
  }

  componentWillUnmount() {
    LayoutAnimation.configureNext(null);
  }

  onPressItem = ({ ownId, image }) => {
    const { handleCollectRecipePress, setLogoState } = this.props;
    setLogoState(image);
    this.setState({ id: ownId, showSelect: true }, () => {
      handleCollectRecipePress && handleCollectRecipePress(ownId);
    });
  };

  gotoRecipe = data => {
    if (data['hard_level']) {
      jumpToSense({
        id: 'recipeDetail',
        searchId: data.id,
        index: data.index,
        recipeData: data,
        recipeTitle: data.recipeTitle,
        sceneConfigs: {
          ...Navigator.SceneConfigs.FloatFromBottom,
          // gestures: null, // 阻止ios左滑
        },
      });
    } else {
      jumpToSense({
        id: 'recipeDetail',
        searchId: data.id,
        index: data.index,
        sceneConfigs: {
          ...Navigator.SceneConfigs.FloatFromBottom,
          // gestures: null, // 阻止ios左滑
        },
      });
    }
  };

  fetchData = async () => {
    const { productId } = this.props;
    try {
      // error 时回调中会带userInfo
      const recipeLists = await TYSdk.getCollects(productId);
      if ('contentList' in recipeLists) {
        const { setCollectRecipes } = this.props;
        this.state.isError && this.setState({ isError: false });
        const fetchDatas = recipeLists.contentList;
        const recipes = formatRecipeDetail(recipeLists, fetchDatas);
        setCollectRecipes(recipes);
        this.onDataReachedWithCallBack(() => {
          this.setState({ recipes });
        });
      } else if ('totalRecords' in recipeLists) {
        recipeLists.totalRecords === 0 && this.onDataReachedButEmpty();
      }
    } catch (error) {
      this.onError();
    }
  };

  mergeTopBar = () => ({
    hideTopbar: true,
  });

  renderItem = ({ image: I, homeImage, recipeTitle, ownId, ...rest }, index) => {
    const image = homeImage || I;
    const { id, showSelect } = this.state;
    return (
      <Cell
        recipeTitle={recipeTitle}
        index={index}
        pic={image}
        onPress={() => this.onPressItem({ image, recipeTitle, ownId, ...rest })}
        isSelect={ownId === id && showSelect}
        gotoRecipe={() => this.gotoRecipe({ image, recipeTitle, ownId, ...rest })}
      />
    );
  };

  renderBody = () => {
    const { loading, recipes } = this.state;
    return (
      <MagicFlatList
        style={styles.container}
        columnWrapperStyle={styles.columnWrapperStyle}
        initialNumToRender={6}
        keyExtractor={(__, index) => `cell_${index}`}
        snapToAlignment="start"
        decelerationRate="fast"
        data={recipes}
        renderItem={({ item, index }) => this.renderItem(item, index)}
        refreshing={loading}
        onRefresh={this.fetchData}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        animateType={Platform.OS === 'ios' ? 'zoomUpIn' : 'floatFromBottomBig'}
        delay={50}
      />
    );
  };
}

const styles = StyleSheet.create({
  container: {
    marginTop: cx(10),
  },
  columnWrapperStyle: {
    width: cx(343),
    justifyContent: 'space-between',
  },
});

export default connect(
  ({ toastState, recipes = {}, dpState, devInfo }) => ({
    toastState,
    currentRecipe: recipes.currentRecipe || {},
    recipeId: dpState[Config.codes.recipeCode],
    productId: devInfo.productId,
  }),
  dispatch =>
    bindActionCreators(
      {
        setCollectRecipes,
        setLogoState,
      },
      dispatch
    )
)(HomeRecipeView);
