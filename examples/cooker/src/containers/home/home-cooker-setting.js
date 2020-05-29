/* eslint-disable import/no-extraneous-dependencies */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';

const { convertX: cx, width } = Utils.RatioUtils;
export default class HomeCookerSetting extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
  };

  renderItem = ({ image, onPress, content }) => (
    <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
      <Image source={image} style={{ tintColor: 'rgba(255,255,255,.5)' }} />
      <TYText numberOfLines={1} style={styles.contentText}>
        {content}
      </TYText>
    </TouchableOpacity>
  );

  render() {
    const { data } = this.props;
    return (
      <View style={styles.container}>
        <FlatList
          data={data}
          horizontal={true}
          contentContainerStyle={styles.contentContainerStyle}
          renderItem={({ item }, index) => this.renderItem(item, index)}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: width - cx(32),
    height: cx(48),
    marginTop: cx(16),
  },

  contentContainerStyle: {
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  buttonContainer: {
    width: cx(98),
    height: cx(48),
    borderRadius: cx(24),
    paddingHorizontal: cx(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginRight: cx(22),
  },

  contentText: {
    fontSize: cx(18),
    color: 'rgba(255,255,255,.5)',
    backgroundColor: 'transparent',
    marginLeft: cx(10),
  },
});
