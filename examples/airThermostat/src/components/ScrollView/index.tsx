import React from 'react';
import { LayoutChangeEvent, ScrollView, ScrollViewProps } from 'react-native';

const defaultProps = {
  /**
   * 内容未超出可视区时是否滚动
   * auto 时将不滚动
   * scroll时将滚动
   */
  scrollType: 'auto',
};

type DefaultProps = Readonly<typeof defaultProps>;

type Props = DefaultProps & ScrollViewProps;

interface State {
  scrollEnabled: boolean;
}

/**
 * 对rn scrollView 做优化处理
 * 加入内容未超出可视区时是否滚动能力
 */
class MyScrollView extends React.Component<Props, State> {
  static defaultProps: DefaultProps = defaultProps;
  private scrollHeight: number;
  private contenetHeight: Number;
  private scrollRef: ScrollView;
  state = { scrollEnabled: false };
  constructor(props: Props) {
    super(props);
    this.state = {
      scrollEnabled: this.props.scrollType === 'scroll',
    };
  }
  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.scrollType !== this.props.scrollType) {
      if (nextProps.scrollType === 'auto') {
        this.updateScrollEnabled(nextProps.scrollType);
      } else {
        this.setState({ scrollEnabled: true });
      }
    }
  }
  getRef() {
    return this.scrollRef;
  }
  fireEvent(cb: Function, ...args: any[]) {
    if (typeof cb === 'function') {
      cb(...args);
    }
  }
  updateScrollEnabled = (scrollType: string) => {
    if (this.scrollHeight && this.contenetHeight && scrollType === 'auto') {
      this.setState({ scrollEnabled: this.scrollHeight < this.contenetHeight }, () => {
        if (!this.state.scrollEnabled) {
          this.scrollRef.scrollTo({ y: 0, x: 0 });
        }
      });
    }
  };
  handleScrollLayout = (e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    this.scrollHeight = height;
    this.updateScrollEnabled(this.props.scrollType);
    this.fireEvent(this.props.onLayout, e);
  };
  handleContentSize = (...args: any[]) => {
    const [width, height] = args;
    this.contenetHeight = height;
    this.updateScrollEnabled(this.props.scrollType);
    this.fireEvent(this.props.onContentSizeChange, ...args);
  };
  handleRef = (ref: ScrollView) => {
    this.scrollRef = ref;
  };
  render() {
    const { children, scrollType, ...other } = this.props;
    if (scrollType === 'auto') {
      other.scrollEnabled = this.state.scrollEnabled;
    }
    return (
      <ScrollView
        {...other}
        ref={this.handleRef}
        scrollEnabled={this.state.scrollEnabled}
        onContentSizeChange={this.handleContentSize}
        onLayout={this.handleScrollLayout}
      >
        {children}
      </ScrollView>
    );
  }
}

export default MyScrollView;
