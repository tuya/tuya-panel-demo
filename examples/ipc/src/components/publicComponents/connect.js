import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

const Connect = ({ children, ...props }) => children(props);

export default connect(
  (state, { mapStateToProps }) => mapStateToProps(state),
  (dispatch, { mapDispatchToProps }) => {
    if (typeof mapDispatchToProps === 'object') {
      return bindActionCreators(mapDispatchToProps, dispatch);
    }
    if (typeof mapDispatchToProps === 'function') {
      return mapDispatchToProps(dispatch);
    }
    return {};
  }
)(Connect);
