import React from 'react';
import { View } from 'react-native';
import ContentLayout from './contentLayout';
import ConsoleLayout from './consoleLayout';

const Home: React.FC = () => {
  return (
    <View style={{ flex: 1 }}>
      <ContentLayout style={{ flex: 2, paddingTop: 5 }} />
      <ConsoleLayout style={{ flex: 1 }} />
    </View>
  );
};

export default Home;
