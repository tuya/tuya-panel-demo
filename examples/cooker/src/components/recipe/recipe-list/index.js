import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import RecipeList from './recipe-content';
import Strings from '../i18n';

export default class HomeRecipeView extends PureComponent {
  static propTypes = {
    data: PropTypes.array,
    category: PropTypes.string,
  };

  static defaultProps = {
    data: [],
    category: Strings.getLang('all'),
  };

  render() {
    const { data, category } = this.props;
    return <RecipeList category={category} recipes={data} />;
  }
}
