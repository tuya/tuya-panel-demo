import React from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Dimensions } from 'react-native';
import Strings from '../i18n';

const { width, height } = Dimensions.get('window');
interface LoadingProps {
  loadingShow?: boolean;
}

const Loading: React.FC<LoadingProps> = props => {
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
      <View style={!props.loadingShow ? {} : styles.loadingStyle}>
        <ActivityIndicator animating={true} size="large" color="#bbb" />
        {!props.loadingShow && <Text style={styles.noSubtitle}>{Strings.getLang('loading')}</Text>}
      </View>
    </View>
  );
};

Loading.defaultProps = {
  loadingShow: false,
};

export default Loading;

const styles = StyleSheet.create({
  noSubtitle: {
    color: '#9B9B9B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
});
