import { useSelector } from '@models';
import Res from '@res';

const useGetState = () => {
  const themeColor = '#239C8E';
  const fontColor = '#FFFFFF';

  const allState = useSelector(state => state);
  return {
    ...allState,
    themeColor,
    themeImage: Res.themeImage,
    fontColor,
  };
};
export default useGetState;
