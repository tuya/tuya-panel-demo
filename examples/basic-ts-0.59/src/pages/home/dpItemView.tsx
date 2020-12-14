import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useDispatch } from 'react-redux';
import { DpSchema, DpValue } from 'tuya-panel-kit';
import { actions } from '@models';
import BoolView from './boolView';
import ValueView from './valueView';
import EnumView from './enumView';
import StringView from './stringView';
import RawView from './rawView';
import BitView from './bitView';
import DpInfoView from './dpInfoView';

interface Props {
  style?: StyleProp<ViewStyle>;
  dpState: DpValue;
  dpSchema: DpSchema;
}

const readonly = (mode: string) => {
  return mode === 'ro';
  // return false; // 只上报也让可以下发, 用于可能需要的调试测试
};

// 只有在 dpState 变更时才重新渲染该组件
const isDpStateEqual = (prevProps: Props, nextProps: Props) =>
  prevProps.dpState === nextProps.dpState;

const DpItemView = React.memo<Props>(props => {
  const { style, dpSchema, dpState } = props;

  const dispatch = useDispatch();

  const handleChange = (value: DpValue) => {
    const { code } = dpSchema;
    dispatch(actions.common.updateDp({ [code]: value }));
  };

  return (
    <View style={[styles.container, style]}>
      <DpInfoView dpSchema={dpSchema} />
      {dpSchema.type === 'bool' && (
        <BoolView
          style={styles.itemView}
          disabled={readonly(dpSchema.mode)}
          value={dpState as boolean}
          onValueChange={handleChange}
        />
      )}
      {dpSchema.type === 'value' && (
        <ValueView
          style={styles.itemView}
          readonly={readonly(dpSchema.mode)}
          max={dpSchema.max!}
          min={dpSchema.min!}
          step={dpSchema.step!}
          value={dpState as number}
          onChange={handleChange}
        />
      )}
      {dpSchema.type === 'enum' && (
        <EnumView
          style={styles.itemView}
          readonly={readonly(dpSchema.mode)}
          values={dpSchema.range!}
          selected={dpState as string}
          onChange={handleChange}
        />
      )}
      {dpSchema.type === 'string' && (
        <StringView
          style={styles.itemView}
          readonly={readonly(dpSchema.mode)}
          value={dpState as string}
          onChange={handleChange}
        />
      )}
      {dpSchema.type === 'raw' && (
        <RawView
          style={styles.itemView}
          readonly={readonly(dpSchema.mode)}
          value={dpState as string}
          onChange={handleChange}
        />
      )}
      {dpSchema.type === 'bitmap' && (
        <BitView
          style={styles.itemView}
          readonly={readonly(dpSchema.mode)}
          code={dpSchema.code}
          value={dpState as number}
          label={dpSchema.label!}
          onChange={handleChange}
        />
      )}
    </View>
  );
}, isDpStateEqual);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderColor: 'red',
    borderRadius: 2,
    borderWidth: 0,
  },

  itemView: {},
});

DpItemView.displayName = 'DpItemView';

export default DpItemView;
