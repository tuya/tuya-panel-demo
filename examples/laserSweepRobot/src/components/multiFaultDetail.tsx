import React, { PureComponent } from 'react';
import { TYSdk, Utils, TYText, IconFont } from 'tuya-panel-kit';
import I18N from '@i18n';
import { View, StyleSheet } from 'react-native';
import RxUtils from '../protocol/utils/rxUtil';

const { createDpValue$ } = RxUtils;
const { convertY: cy } = Utils.RatioUtils;

interface IProps {
  faultCode: string;
  onlyPrior: boolean;
  formatFaultDetailKey: (fault: string) => string;
}

interface IState {
  faultValue: number;
}

export default class MultiFaultDetail extends PureComponent<IProps, IState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    faultCode: 'fault',
    onlyPrior: false,
    formatFaultDetailKey: (fault: string) => {
      return `${fault}_detail`;
    },
  };

  constructor(props: IProps) {
    super(props);
    this.state = {
      faultValue: 0,
    };
  }

  subscriptionFault: any;

  componentDidMount() {
    const { faultCode } = this.props;
    this.subscriptionFault = createDpValue$(faultCode).subscribe(
      (faultValue: number) => {
        this.setState({ faultValue });
      },
      e => console.warn('MultiFaultDetail', e)
    );
  }

  componentWillUnmount() {
    this.subscriptionFault.unsubscribe();
  }

  getFaultDetail(faultCode: string, faultValue: number, onlyPrior: boolean) {
    const { formatFaultDetailKey } = this.props;
    const { label = [] } = TYSdk.device.getDpSchema(faultCode);
    const labels: Array<{
      title: string;
      subTitle: string;
    }> = [];
    for (let i = 0; i < label.length; i++) {
      const value = label[i];
      const isExist = Utils.NumberUtils.getBitValue(faultValue, i);
      if (isExist) {
        const title = I18N.getDpLang(faultCode, `${value}`);
        const subTitle = I18N.getDpLang(faultCode, formatFaultDetailKey(value));
        labels.push({ title, subTitle });
        if (onlyPrior) break;
      }
    }
    return onlyPrior ? [labels[0]] : labels;
  }

  renderCard(item) {
    const { title, subTitle } = item;
    if (!title || !subTitle) return null;
    return (
      <View style={styles.card} key={title}>
        <IconFont style={styles.icon} name="error" color="red" size={32} />
        <View style={styles.context}>
          <TYText style={styles.title} text={title} />
          <TYText style={styles.subTitle} text={subTitle} />
        </View>
      </View>
    );
  }

  render() {
    const { faultCode, onlyPrior } = this.props;
    const { faultValue } = this.state;

    const faultContext = this.getFaultDetail(faultCode, faultValue, onlyPrior);

    return <View style={styles.container}>{faultContext.map(item => this.renderCard(item))}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  card: {
    flex: 0,
    backgroundColor: '#FFF',
    alignItems: 'center',
    flexWrap: 'nowrap',
    flexDirection: 'row',
    borderColor: '#DFDFDF',
    borderWidth: 1,
    borderRadius: cy(10),
    padding: cy(10),
    marginHorizontal: cy(10),
    marginTop: cy(10),
  },
  context: {
    flexShrink: 1,
  },
  icon: {
    flexBasis: cy(32),
    flexShrink: 0,
  },
  title: {
    fontSize: cy(12),
    color: '#000',
  },
  subTitle: {
    fontSize: cy(12),
    color: 'rgba(0,0,0,0.4)',
  },
});
