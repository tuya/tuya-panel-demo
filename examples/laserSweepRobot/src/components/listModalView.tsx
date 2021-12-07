import React, { Component } from 'react';
import {
  View,
  ListView,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Strings, TYText } from 'tuya-panel-kit';

const Res = {
  selected: require('../res/commonSelected.png'),
};

interface IProps {
  name: string;
  onCancel: () => void;
  onValueChange: (v: number) => void;
  contentContainerStyle: StyleProp<ViewStyle>;
  contentContainerTextStyle: StyleProp<TextStyle>;
  values?: any;
  value?: boolean | number | string;
  isNewStyle?: boolean;
  hideCancel: boolean;
  scrollEnabled?: boolean;
}
interface IState {
  selected: number;
  dataSource: any;
}

export default class ListModalView extends Component<IProps, IState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    values: {},
    value: '',
    isNewStyle: false,
    hideCancel: false,
    scrollEnabled: true,
  };

  constructor(props) {
    super(props);
    this._renderRow = this._renderRow.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      dataSource: ds.cloneWithRows(props.values),
      selected: props.value.toString(),
    };
  }

  componentWillReceiveProps(nextProps) {
    const { dataSource } = this.state;
    this.setState({
      dataSource: dataSource.cloneWithRows(nextProps.values),
      selected: nextProps.value.toString(),
    });
  }

  handleCancel() {
    const { onCancel } = this.props;
    if (onCancel) onCancel();
  }

  handleValueChange(v) {
    this.setState({ selected: v });
    const { onValueChange } = this.props;
    if (onValueChange) {
      onValueChange(v);
    }
  }

  _renderRow(rowData, sectionID, rowID, highlightRow) {
    const { contentContainerStyle, contentContainerTextStyle, isNewStyle } = this.props;
    const { selected } = this.state;
    const isSelected = selected === rowID;
    const contentStyle = isSelected ? contentContainerStyle : {};
    const textStyle = isSelected ? contentContainerTextStyle : {};

    return (
      <TouchableWithoutFeedback onPress={() => this.handleValueChange(rowID)}>
        <View style={[styles.itemContainer, contentStyle]}>
          <TYText style={[styles.itemText, textStyle]}>{rowData}</TYText>
          {isSelected && !isNewStyle && <Image style={styles.selected} source={Res.selected} />}
        </View>
      </TouchableWithoutFeedback>
    );
  }

  render() {
    const { values, scrollEnabled, hideCancel, name } = this.props;
    const { dataSource } = this.state;
    const itemLength = Object.keys(values).length;
    const sEnabled = scrollEnabled ? itemLength > 5 : false;
    const listViewHeight = scrollEnabled ? 256 : itemLength * 48;
    return (
      <View style={styles.container}>
        <View style={styles.itemContainer}>
          <TYText style={styles.title}>{name}</TYText>
        </View>
        <ListView
          style={{ height: listViewHeight }}
          dataSource={dataSource}
          renderRow={this._renderRow}
          bounces={false}
          scrollEnabled={sEnabled}
          enableEmptySections={true}
          initialListSize={6}
        />
        {!hideCancel && (
          <TouchableWithoutFeedback onPressOut={this.handleCancel}>
            <View style={[styles.itemContainer, styles.cancelContainer]}>
              <TYText style={styles.cancelText}>{Strings.getLang('complete')}</TYText>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#D6D6DE',
  },

  itemContainer: {
    // flex: 1,
    flexDirection: 'row',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginBottom: StyleSheet.hairlineWidth,
  },

  cancelContainer: {
    marginTop: 6,
  },

  title: {
    color: '#9B9B9B',
    fontSize: 12,
  },

  itemText: {
    color: '#303030',
    fontSize: 16,
  },

  cancelText: {
    color: '#303030',
    fontSize: 16,
  },

  selected: {
    height: 24,
    width: 24,
    position: 'absolute',
    right: 28,
    top: 12,
  },
});
