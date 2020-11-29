import React from 'react';

class History extends React.Component {

    constructor(props) {
      super(props);
     
    }


    render() {
        return (
            <>
                <NavBar username={ this.props.user.firstName ? this.props.user.firstName : 'NA' } />
            </>
        );
    }
  }

const mapStateToProps = state => {
    return {
        user: state.userDetails.user
    }
};

export default connect(mapStateToProps, actions)(History);
  