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
  // eslint-disable-next-line react/static-property-placement
  static defaultProps: DefaultProps = defaultProps;

  private scrollHeight: number;

  private contenetHeight: number;

  private scrollRef: ScrollView;

  constructor(props: Props) {
    super(props);
    const { scrollType } = this.props;
    this.state = {
      scrollEnabled: scrollType === 'scroll',
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const { scrollType } = this.props;
    if (nextProps.scrollType !== scrollType) {
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

  fireEvent(cb?: (...rest: any[]) => void, ...args: any[]) {
    if (typeof cb === 'function') {
      cb(...args);
    }
  }

  updateScrollEnabled = (scrollType: string) => {
    const { scrollEnabled } = this.state;
    if (this.scrollHeight && this.contenetHeight && scrollType === 'auto') {
      this.setState({ scrollEnabled: this.scrollHeight < this.contenetHeight }, () => {
        if (!scrollEnabled) {
          this.scrollRef.scrollTo({ y: 0, x: 0 });
        }
      });
    }
  };

  handleScrollLayout = (e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    this.scrollHeight = height;
    const { scrollType, onLayout } = this.props;
    this.updateScrollEnabled(scrollType);
    this.fireEvent(onLayout, e);
  };

  handleContentSize = (...args: any[]) => {
    const [width, height] = args;
    this.contenetHeight = height;
    const { onContentSizeChange, scrollType } = this.props;
    this.updateScrollEnabled(scrollType);
    this.fireEvent(onContentSizeChange, ...args);
  };

  handleRef = (ref: ScrollView) => {
    this.scrollRef = ref;
  };

  render() {
    const { children, scrollType, ...other } = this.props;
    const { scrollEnabled } = this.state;
    if (scrollType === 'auto') {
      other.scrollEnabled = scrollEnabled;
    }
    return (
      <ScrollView
        {...other}
        ref={this.handleRef}
        scrollEnabled={scrollEnabled}
        onContentSizeChange={this.handleContentSize}
        onLayout={this.handleScrollLayout}
      >
        {children}
      </ScrollView>
    );
  }
}

export default MyScrollView;
