import { getUIValue } from '@tuya-rn/tuya-native-standard-hoc/lib/withUIConfig/utils';
import { ReduxState } from '@models/type';
import useSelector from './useSelector';

export default function useIoTUIValue(key: string, value?: string): any {
  return useSelector((state: ReduxState) => getUIValue(state.panelConfig.iot, key, value));
}
