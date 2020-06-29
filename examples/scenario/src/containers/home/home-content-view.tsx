import React from 'react';
import _ from 'lodash';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Utils, TYSdk, TYText, IconFont } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import Strings from '../../i18n';
import { getSceneData, executeSense } from '../../api';
import IconFonts from '../../res/iconfont.json';

const { convertX: cx } = Utils.RatioUtils;
const TYEvent = TYSdk.event;
const HEIGHT = cx(126);

interface HomeContentViewProps {
  schema: any;
}

interface HomeContentViewState {
  datas: any;
  data: any;
}

class HomeContentView extends React.PureComponent<HomeContentViewProps, HomeContentViewState> {
  constructor(props: HomeContentViewProps) {
    super(props);
    const { schema } = this.props;
    const scenes = _.filter(schema, d => /^scene_[0-9]/.test(d.code));
    this.scenes = _.sortBy(scenes, d => _.parseInt(d.id)) || [];
    this.state = {
      data: [],
      datas: [],
    };
  }

  componentDidMount() {
    this.getData();
    TYEvent.on('NAVIGATOR_ON_DID_FOCUS', () => {
      this.getData();
    });
  }

  componentWillUnmount() {
    TYEvent.off('NAVIGATOR_ON_DID_FOCUS');
  }

  getData = () => {
    getSceneData()
      .then((d: any) => {
        const data = typeof d === 'string' ? JSON.parse(d) : d;
        const datas = this.scenes.map((dt: any, index: number) => {
          const sceneData = data.find((v: any) => v.btnId === index);
          const { code } = dt;
          return {
            ruleId: sceneData ? sceneData.ruleId : '',
            name: sceneData ? sceneData.ruleName : Strings.getDpLang(code),
            code,
          };
        });
        this.setState({
          datas,
          data,
        });
      })
      .catch((err: any) => console.error(err));
  };
  scenes: any;

  _handleToScene = (code: string, index: number) => {
    const TYNavigator = TYSdk.Navigator;
    const { data } = this.state;
    TYNavigator.push({
      id: 'scene',
      title: Strings.getLang('sceneSet'),
      code,
      queryData: data,
      btnId: index,
      dpValue: 'scene', // 触发条件
    });
  };

  _handleToSetScene = (ruleId = '') => {
    if (ruleId !== '') {
      executeSense(ruleId)
        .then((d: any) => d)
        .catch((error: any) => console.log('err', error));
    }
  };

  renderItems = ({ item, index }: { item: any; index: number }) => {
    const { name, ruleId, code } = item;
    return (
      <TouchableOpacity
        style={styles.switch}
        activeOpacity={0.5}
        onPress={() => this._handleToSetScene(ruleId)}
        onLongPress={() => this._handleToScene(code, index)}
      >
        <IconFont useART={true} d={IconFonts.moren} color="#FFFFFF" size={42} />
        <TYText style={styles.mame}>{name}</TYText>
      </TouchableOpacity>
    );
  };

  render() {
    const { datas } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={[styles.scenes, { height: (datas.length / 2) * HEIGHT }]}>
            <FlatList
              data={datas}
              extraData={this.state}
              numColumns={2}
              renderItem={this.renderItems}
              keyExtractor={item => item.code}
              scrollEnabled={false}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scenes: {
    width: cx(375),
    alignItems: 'center',
    justifyContent: 'center',
  },
  switch: {
    width: cx(110),
    height: cx(110),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#bbb',
    borderWidth: 1,
    marginVertical: cx(1),
    marginHorizontal: cx(1),
  },
  mame: {
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    fontSize: cx(12),
  },
});

const mapStateToProps = (state: any) => {
  return {
    schema: state.devInfo.schema,
  };
};

export default connect(mapStateToProps)(HomeContentView);
