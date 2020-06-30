import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

type ChildrenType = (props: any) => void;

const Connect = ({ children, ...props }: { children: ChildrenType }) => children(props);

export default connect(
  (state: any, { mapStateToProps }: { mapStateToProps: any }) => mapStateToProps(state),
  (dispatch: any, { mapDispatchToProps }: { mapDispatchToProps: any }) => {
    if (typeof mapDispatchToProps === 'object') {
      return bindActionCreators(mapDispatchToProps, dispatch);
    }
    if (typeof mapDispatchToProps === 'function') {
      return mapDispatchToProps(dispatch);
    }
    return {};
  }
)(Connect);

