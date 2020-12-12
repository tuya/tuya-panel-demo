import React, { PureComponent } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import Carousel from '../Carousel';
import Button from './Button';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

interface IProp {
  value: string;
  dataSource: { icon: string; label: string; value: string }[];
  theme?: any;
  onChange: (value: string) => void;
}

@withTheme
export default class PopBody extends PureComponent<IProp> {
  renderButtons() {
    const { onChange, value: current, dataSource, theme } = this.props;
    const exist = dataSource.find(({ value: x }) => x === current) || { icon: '', label: '' };
    const childrens = [];
    for (let i = 0; i < dataSource.length / 3; i++) {
      const data = dataSource.slice(i * 3, i * 3 + 3);
      childrens.push(
        <TouchableOpacity activeOpacity={1} style={styles.box} key={i}>
          {data.map(({ label, value, icon }) => {
            return (
              <Button
                key={value}
                style={{ opacity: exist.value === value ? 1 : 0.4 }}
                text={label}
                icon={icon}
                onPress={() => onChange(value)}
              />
            );
          })}
        </TouchableOpacity>
      );
    }
    return childrens;
  }
  render() {
    const { onChange, value, dataSource, theme } = this.props;
    const {
      global: { brand: themeColor },
    } = theme;
    let selectedIndex = 0;
    dataSource.some(({ value: x }, i) => {
      selectedIndex = i;
      return x === value;
    });
    const pageIndex = Math.floor(selectedIndex / 3);
    return (
      <View
        style={[
          styles.panel,
          {
            backgroundColor: themeColor,
          },
        ]}
      >
        <Carousel selectIndex={pageIndex} dotStyle={styles.dot} swipeEnabled={true} space={cx(22)}>
          {this.renderButtons()}
        </Carousel>
      </View>
      // <ControllerBar.Group
      //   type="swiper"
      //   style={}
      //   swiperConfig={{
      //     style: { height: 198, backgroundColor: themeColor },
      //     dotActiveStyle: { backgroundColor: '#fff' },
      //     dotStyle: { backgroundColor: 'rgba(255,255,255,.4)', width: cx(20), height: 4 },
      //   }}
      //   size={44}
      // >
      //   <ControllerBar
      //     backgroundColor="transparent"
      //     style={{ height: '100%' }}
      //     wrapperStyle={{ marginHorizontal: cx(12), justifyContent: 'center', height: '100%' }}
      //     button={dataSource.slice(0, 3).map(({ label, value, icon }) => {
      //       return {
      //         key: value,
      //         text: label,
      //         iconPath: icon,
      //         size: cx(76),
      //         iconColor: themeColor,
      //         iconSize: cx(40),
      //         style: {
      //           backgroundColor: '#fff',
      //         },
      //         textStyle: { fontSize: 14, color: '#fff', marginTop: 12 },
      //       };
      //     })}
      //   />
      //   {/* {dataSource.length > 3 && (
      //       <ControllerBar
      //         backgroundColor="transparent"
      //         style={{ height: '100%' }}
      //         wrapperStyle={{ marginHorizontal: cx(12), justifyContent: 'center', height: '100%' }}
      //         button={dataSource.slice(3).map(({ label, value, icon }) => {
      //           return {
      //             key: value,
      //             text: label,
      //             iconPath: icon,
      //             size: cx(76),
      //             iconColor: themeColor,
      //             iconSize: cx(40),
      //             style: {
      //               backgroundColor: '#fff',
      //             },
      //             textStyle: { fontSize: 14, color: '#fff', marginTop: 12 },
      //           };
      //         })}
      //       />
      //     )} */}
      // </ControllerBar.Group>
    );
  }
}

const styles = StyleSheet.create({
  panel: {
    paddingHorizontal: cx(22),
    borderRadius: 20,
    flex: 0,
    width: '100%',
    height: 198,
  },
  box: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,.4)',
    width: cx(20),
    height: 4,
    marginBottom: cx(16),
  },
  activeDot: { backgroundColor: '#fff' },
});
