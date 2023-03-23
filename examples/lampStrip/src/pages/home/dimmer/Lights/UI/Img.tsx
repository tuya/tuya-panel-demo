import React, { useRef } from 'react';
import { StyleSheet, View, Image, StyleProp, ImageStyle, ImageSourcePropType } from 'react-native';
import { useTheme } from 'tuya-panel-kit';

interface ImgProps {
  containerStyle?: StyleProp<ImageStyle>;
  style?: StyleProp<ImageStyle>;
  source: ImageSourcePropType;
}

const Img: React.FC<ImgProps> = ({ containerStyle, style, source }) => {
  const { background }: any = useTheme();

  const containerRef = useRef(null);

  const handleLoaded = () => {
    containerRef.current?.setNativeProps?.({
      style: { backgroundColor: 'transparent' },
    });
  };

  return (
    <View
      ref={containerRef}
      style={[styles.container, containerStyle, { backgroundColor: background }]}
    >
      <Image style={style} source={source} onLoadEnd={handleLoaded} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default Img;
