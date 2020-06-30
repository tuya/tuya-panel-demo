import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import { Utils } from "tuya-panel-kit";
import AlarmList from "./alarmList";

const { convertX: cx } = Utils.RatioUtils;

interface SettingProps {
  theme: any;
  devInfo: any;
}

export default class Setting extends Component<SettingProps> {
  render() {
    const { theme } = this.props;
    const themeColor = theme.global.themeColor;
    return (
      <View style={styles.container}>
        <View style={styles.main}>
          <View style={styles.content}>
            <AlarmList themeColor={themeColor} devInfo={this.props.devInfo} />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  },
  main: {
    flex: 1,
    width: cx(361),
    alignSelf: "center",
    borderTopLeftRadius: cx(14),
    borderTopRightRadius: cx(14),
    overflow: "hidden"
  },
  content: {
    flex: 1,
    paddingHorizontal: cx(20),
    backgroundColor: "#FFF"
  }
});
