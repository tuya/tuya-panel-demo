import { useNavigation, useRoute, RouteProp, ParamListBase } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const useNav = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route: RouteProp<ParamListBase, string> = useRoute();
  return {
    route,
    navigation,
    navigationReplace: navigation.replace,
    navigationPush: navigation.push,
    navigationPop: navigation.pop,
  };
};
export default useNav;
