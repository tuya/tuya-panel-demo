export interface RuleItemProps {
  themeColor: string;
  isSelect?: boolean;
  devLength: number;
  showIcon: any;
  name: string;
  onPress?: any;
  enabled?: boolean;
  changeEnabled?: any;
  needEnable?: boolean;
  index?: number;
  scrollEnabledChange?: any;
  removeRule?: any;
  isNewApp: boolean;
  isDefaultTheme: boolean;
  needBackground?: boolean;
  background?: any;
  editRule?: any;
}

export interface RuleItemState {
  curOpenSwipeOutIdx?: number;
}