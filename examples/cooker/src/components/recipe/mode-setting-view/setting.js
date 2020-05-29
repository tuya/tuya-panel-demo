/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Utils, TYText, Divider } from 'tuya-panel-kit';
import MagicText from 'react-native-magic-text';
import { MagicFlatList } from 'react-native-magic-list';

const { convertX: cx } = Utils.RatioUtils;
const ROW_WIDTH = cx(327);
const ROW_HEIGHT = cx(72);
export default class Setting extends Component {
  static propTypes = {
    data: PropTypes.array,
    hideTopSeparator: PropTypes.bool,
  };

  static defaultProps = {
    data: [],
    hideTopSeparator: false,
  };

  renderItem = ({ item }) => {
    const {
      title,
      content,
      image,
      onPress,
      onRightPress,
      rightIconStyle,
      onPressIn,
      onPressOut,
    } = item;
    const RightComponent = onRightPress ? TouchableOpacity : View;
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={onPress ? 0.6 : 1}
      >
        <View style={styles.rowStyle}>
          <View style={styles.leftContainer}>
            {title && (
              <TYText style={[styles.title, content && { marginBottom: cx(8) }]}>{title}</TYText>
            )}
            <MagicText text={content} textStyle={styles.contentText} animateType="timing" />
          </View>
          <RightComponent onPress={onRightPress}>
            <Image source={image} style={[styles.rowImageStyle, rightIconStyle]} />
          </RightComponent>
        </View>
      </TouchableOpacity>
    );
  };

  renderSeparator = () => (
    <Divider
      width={ROW_WIDTH}
      backgroundColor="rgba(255,255,255,..8)"
      style={{ alignSelf: 'center' }}
    />
  );

  render() {
    const { data, hideTopSeparator } = this.props;
    return (
      <View style={styles.container}>
        {!hideTopSeparator && this.renderSeparator()}
        <MagicFlatList
          data={data}
          animateType="fadeInUp"
          keyExtractor={(__, index) => `setting_cell_${index}`}
          showsHorizontalScrollIndicator={false}
          renderItem={this.renderItem}
          contentContainerStyle={styles.contentContainerStyle}
          ItemSeparatorComponent={this.renderSeparator}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
    marginTop: cx(16),
  },

  leftContainer: {
    justifyContent: 'center',
  },

  contentContainerStyle: {
    marginLeft: cx(16),
    paddingRight: cx(24),
    paddingBottom: cx(100),
  },

  rowStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: ROW_WIDTH,
    height: ROW_HEIGHT,
    alignSelf: 'center',
  },

  rowImageStyle: {
    width: cx(40),
    height: cx(40),
    resizeMode: 'stretch',
  },

  title: {
    fontSize: cx(14),
    color: '#666666',
  },

  contentText: {
    fontSize: cx(20),
    color: '#333333',
    fontWeight: '500',
  },
});
