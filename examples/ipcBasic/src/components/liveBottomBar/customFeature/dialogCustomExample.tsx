import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import { commonClick } from '@config';

interface DialogCustomExampleProps {}

const DialogCustomExample: React.FC<DialogCustomExampleProps> = (
  props: DialogCustomExampleProps
) => {
  const prssRn = () => {
    commonClick.enterFirstRnPage('customPage');
  };
  return (
    <View style={styles.dialogCustomExamplePage}>
      <TYText>Custom Dialog</TYText>
      <TouchableOpacity onPress={prssRn}>
        <TYText style={styles.txtStyle}>Jump Rn page</TYText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  dialogCustomExamplePage: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtStyle: {
    marginTop: 15,
    color: 'red',
    fontSize: 16,
  },
});

export default DialogCustomExample;
