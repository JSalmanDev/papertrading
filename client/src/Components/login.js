import React from 'react';

class SignIn extends React.Component {

    constructor(props) {
      super(props);
      
    }

   
    render () {
        return(
            <>
               </>
        );
    }
}


const mapStateToProps = state => {
    return {
        user: state.userDetails
    }
};

export default connect(mapStateToProps, actions)(SignIn);