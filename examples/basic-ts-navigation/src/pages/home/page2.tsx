import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BrickButton } from 'tuya-panel-kit';

function Page2() {
  const navigation = useNavigation<StackNavigationProp<any, any>>();
  return (
    <BrickButton
      text="Page2"
      onPress={() => {
        navigation.push('main');
      }}
    />
  );
}

export default Page2;
