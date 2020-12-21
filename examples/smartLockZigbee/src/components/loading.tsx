import React, { Component } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Dimensions } from 'react-native';
import Strings from '../i18n';
const { width, height } = Dimensions.get('window');
interface LoadingProps {
  loadingShow?: boolean;
}
export default class Loading extends Component<LoadingProps> {
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          width,
          height,
          position: 'absolute',
        }}
      >
        <View
          style={
            !this.props.loadingShow
              ? {}
              : {
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 120,
                  height: 120,
                  borderRadius: 16,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                }
          }
        >
          <ActivityIndicator animating={true} size="large" color="#bbb" />
          {!this.props.loadingShow && (
            <Text style={styles.noSubtitle}>{Strings.getLang('loading')}</Text>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  noSubtitle: {
    color: '#9B9B9B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
});
