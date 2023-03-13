import { getOtherUIValue } from '@tuya-rn/tuya-native-standard-hoc/lib/withUIConfig/utils';
import { ReduxState } from '@models/type';
import useSelector from './useSelector';

export default function useIoTOtherUIValue(key: string, value?: string): any {
  return useSelector((state: ReduxState) => getOtherUIValue(state.panelConfig.iot, key, value));
}
