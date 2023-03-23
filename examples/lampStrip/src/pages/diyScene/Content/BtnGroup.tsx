/* eslint-disable react/require-default-props */
/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import { View } from 'react-native';
import { TYText, Divider, TabBar, useTheme, Utils } from 'tuya-panel-kit';
import { useControllableValue } from 'ahooks';

const { convertX: cx } = Utils.RatioUtils;

interface BtnGroupProps {
  dataSource: any[];
  title: string;
  valueText: string;
  value?: string;
  onChange: (value: string) => void;
}

const BtnGroup: React.FC<BtnGroupProps> = props => {
  const { title, valueText, dataSource } = props;

  const { isDarkTheme, themeColor, fontColor, dividerColor, boxBgColor }: any = useTheme();

  const [value, setValue] = useControllableValue(props);

  return (
    <View style={{ paddingHorizontal: cx(16), marginTop: cx(24) }}>
      <TYText style={{ flexDirection: 'row', fontSize: cx(15) }}>
        <TYText>{title}</TYText>
        {!!valueText && (
          <>
            <TYText color={themeColor}>{' · '}</TYText>
            <TYText color={themeColor}>{valueText}</TYText>
          </>
        )}
      </TYText>
      <Divider
        style={{ marginTop: cx(4), marginBottom: cx(23) }}
        color={dividerColor}
        height={cx(1)}
      />
      <TabBar
        type="radio"
        activeColor={themeColor}
        tabStyle={{ backgroundColor: isDarkTheme ? boxBgColor : '#fff' }}
        tabActiveStyle={{ backgroundColor: themeColor }}
        tabTextStyle={{ color: isDarkTheme ? fontColor : themeColor }}
        tabActiveTextStyle={{ color: '#fff' }}
        style={{
          height: cx(60),
          borderRadius: cx(10),
          backgroundColor: boxBgColor,
        }}
        tabs={dataSource}
        activeKey={String(value)}
        onChange={setValue}
      />
    </View>
  );
};

export default BtnGroup;
