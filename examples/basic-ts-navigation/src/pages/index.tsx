import React from 'react';
import { View } from 'react-native';
import { BrickButton } from 'tuya-panel-kit';
import { useNavigation } from '@react-navigation/native';

const Home: React.FC = () => {
  const navigation = useNavigation();
  const data = [
    { text: 'page1', path: 'page1' },
    { text: 'page3', path: 'page3' },
  ];

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      {data.map(({ text, path }) => {
        return (
          <BrickButton
            style={{ marginTop: 50 }}
            key={path}
            text={text}
            onPress={() => {
              navigation.navigate(path, { name: path });
            }}
          />
        );
      })}
    </View>
  );
};

export default Home;
