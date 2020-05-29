/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native';
import { TYText, Utils } from 'tuya-panel-kit';

const { convertX: cx } = Utils.RatioUtils;
const CATEGORY_WIDTH = cx(163);
const CATEGORY_HEIGHT = cx(80);
const star = require('../../res/star.png');

const RecipeCell = ({ recipeTitle, onPress, pic, isSelect, gotoRecipe }) => (
  <TouchableWithoutFeedback onPress={onPress}>
    <View style={[styles.categoryContainer, isSelect && styles.selectWrap]}>
      <Image source={typeof pic === 'string' ? { uri: pic } : pic} style={styles.bgImage} />
      <View style={styles.modal} />
      <View style={styles.displayContainer}>
        <TYText style={styles.text}>{recipeTitle}</TYText>
        <TouchableWithoutFeedback onPress={gotoRecipe}>
          <Image source={star} style={styles.star} />
        </TouchableWithoutFeedback>
      </View>
    </View>
  </TouchableWithoutFeedback>
);

RecipeCell.propTypes = {
  recipeTitle: PropTypes.string,
  onPress: PropTypes.func,
  pic: PropTypes.oneOfType(PropTypes.string, PropTypes.number),
  isSelect: PropTypes.bool,
  gotoRecipe: PropTypes.func,
};

RecipeCell.defaultProps = {
  recipeTitle: '',
  onPress: null,
  pic: '',
  isSelect: false,
  gotoRecipe: null,
};

const styles = StyleSheet.create({
  categoryContainer: {
    width: CATEGORY_WIDTH,
    height: CATEGORY_HEIGHT,
    borderRadius: cx(16),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: cx(8),
  },

  modal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,.2)',
  },

  displayContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: cx(10),
    paddingRight: cx(20),
  },

  bgImage: {
    width: CATEGORY_WIDTH,
    height: CATEGORY_HEIGHT,
    position: 'absolute',
  },

  text: {
    backgroundColor: 'transparent',
    fontSize: cx(20),
    color: '#fff',
    fontWeight: '500',
    width: cx(100),
    textAlign: 'left',
  },

  selectWrap: {
    borderWidth: 3,
    borderColor: '#4A90E2',
  },

  star: {
    width: cx(20),
    height: cx(20),
  },
});

export default RecipeCell;
