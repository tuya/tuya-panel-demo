import React, { PureComponent } from 'react';
import _filter from 'lodash/filter';
import _isEmpty from 'lodash/isEmpty';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { View, StyleSheet, Image, ImageBackground, TouchableOpacity, FlatList } from 'react-native';
import { Utils, TYText, TYSdk } from 'tuya-panel-kit';
import { updateDpNames } from '../models/modules/cloudState';
import Res from '../res';
import Strings from '../i18n';

const { convertX: cx } = Utils.RatioUtils;

interface DualCurtainProps {
  isDefault: boolean;
  dpState: any;
  names: any;
  isHorizontal: any;
  datas: any;
  codeSchema: any;
  updateNames: any;
}

class DualCurtain extends PureComponent<DualCurtainProps> {
  _handleToEdit = (code: string, name: string) => {
    const { updateNames } = this.props;
    TYSdk.native.showEditDialog(
      Strings.getLang('edit'),
      name,
      (value: string) => {
        const finalName = value.substr(0, 16);
        updateNames({
          code,
          name: finalName,
        });
      },
      () => { }
    );
  };

  renderItem = ({ item, index }: any) => {
    const { title, icon, onPress, needAnimate, element, code, disabled } = item;
    const { isDefault, isHorizontal, names } = this.props;
    const color = isDefault ? '#FFFFFF' : '#858585';
    const nameColor = isDefault ? 'rgba(255,255,255,.5)' : 'rgba(133,133,133,.5)';
    const isStop = index === 1;
    const MARGIN = isHorizontal ? 0 : cx(20);
    const name = names[code] || Strings.getDpLang(code);
    return (
      <TouchableOpacity
        style={styles.itemContent}
        onPress={onPress}
        onLongPress={isStop ? () => this._handleToEdit(code, name) : () => { }}
        disabled={disabled}
      >
        {needAnimate ? (
          element
        ) : (
          <View style={[styles.itemContent, isHorizontal && { flexDirection: 'row' }]}>
            {index === 2 && (
              <TYText style={[styles.title, { color, marginBottom: MARGIN }]}>{title}</TYText>
            )}
            <Image
              source={icon}
              style={[
                {
                  width: isStop ? cx(66) : cx(28),
                  height: isStop ? cx(66) : cx(13),
                },
                !isStop && { tintColor: color },
                !isStop && isHorizontal && { transform: [{ rotate: '270deg' }] },
              ]}
            />
            {index === 0 && (
              <TYText style={[styles.title, { color, marginTop: MARGIN }]}>{title}</TYText>
            )}
          </View>
        )}
        {isStop && isHorizontal && (
          <TYText style={[styles.nameTxt, { color: nameColor }]} numberOfLines={1}>
            {name}
          </TYText>
        )}
      </TouchableOpacity>
    );
  };

  renderList = ({ item, index }: any) => {
    const { isHorizontal, datas, isDefault } = this.props;
    const isLast = index === datas.length - 1;
    return (
      <View style={isHorizontal ? styles.listContent2 : styles.listContent}>
        <FlatList
          data={item}
          keyExtractor={(data: any) => data.key}
          scrollEnabled={false}
          renderItem={this.renderItem}
          contentContainerStyle={{ alignItems: 'center' }}
          horizontal={isHorizontal}
          extraData={this.props}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
        {!isLast && (
          <View
            style={[
              {
                width: isHorizontal ? cx(295) : 1,
                height: isHorizontal ? 1 : cx(300),
                backgroundColor: isDefault ? '#323232' : '#E1E1E1',
                position: 'absolute',
              },
              !isHorizontal && { right: 0 },
              isHorizontal && { bottom: 0 },
            ]}
          />
        )}
      </View>
    );
  };

  renderName = ({ item }: any) => {
    const { code } = item;
    const { names, isDefault } = this.props;
    const name = names[code] || Strings.getDpLang(code);
    return (
      <TouchableOpacity style={styles.nameBtn} onLongPress={() => this._handleToEdit(code, name)}>
        <TYText style={[styles.name, !isDefault && { color: 'rgba(0,0,0,.5)' }]} numberOfLines={1}>
          {name}
        </TYText>
      </TouchableOpacity>
    );
  };

  render() {
    const { isDefault, datas, isHorizontal, codeSchema } = this.props;
    const defaultBg = isHorizontal ? Res.rectanH1 : Res.rectan1;
    const notDefaultBg = isHorizontal ? Res.rectanH2 : Res.rectan2;
    const bg = isDefault ? defaultBg : notDefaultBg;
    return (
      <View style={styles.content}>
        <View style={styles.nameContent}>
          {!isHorizontal && (
            <FlatList
              data={codeSchema}
              renderItem={this.renderName}
              horizontal={true}
              keyExtractor={(item: any) => item.code}
              extraData={this.props}
            />
          )}
        </View>
        <View style={isHorizontal ? styles.root2 : styles.root}>
          <ImageBackground source={bg} style={isHorizontal ? styles.root2 : styles.root}>
            <FlatList
              data={datas}
              renderItem={this.renderList}
              horizontal={!isHorizontal}
              keyExtractor={(item: any, index: number) => index}
              extraData={this.props}
              contentContainerStyle={{
                alignItems: 'center',
              }}
            />
          </ImageBackground>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContent: {
    height: cx(50),
    width: cx(322),
    alignItems: 'center',
  },
  root: {
    width: cx(322),
    height: cx(300),
  },
  root2: {
    width: cx(322),
    height: cx(262),
  },
  itemContent: {
    width: cx(100),
    height: cx(100),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    fontSize: cx(14),
  },
  listContent: {
    width: cx(160),
    height: cx(300),
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent2: {
    width: cx(300),
    height: cx(131),
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBtn: {
    width: cx(160),
    height: cx(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,.5)',
    fontSize: cx(14),
    marginTop: cx(10),
  },
  nameTxt: {
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,.5)',
    fontSize: cx(12),
    marginTop: cx(10),
    position: 'absolute',
    top: cx(-10),
  },
});

export default connect(
  () => ({}),
  dispatch =>
    bindActionCreators(
      {
        updateNames: updateDpNames,
      },
      dispatch
    )
)(DualCurtain);
