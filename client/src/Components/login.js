import React from 'react';
import { Form } from 'react-bootstrap';
import axios from 'axios';
import config from '../config';
import { NavLink } from 'react-router-dom';
import '../assets/style.scss';
import { connect } from 'react-redux';
import * as actions from '../store/actions/userActions';


class SignIn extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        email: '',
        password: '',
        isValid: {
            value: false,
            text: ''   
        },
      }
    }

    componentDidMount() {
        let local = localStorage.getItem('paper-trading-token');
        if (local) {
            this.props.history.push('/');
        }
    }


    handleTextChange(event) {
        this.setState({ [event.name]: event.value });
    }

    handleSubmit(e) {
        e.preventDefault();
        const { email, password } = this.state;
       
        if (!email && email.trim().length <= 0) {
            this.setState({ isValid: { value: true, text: 'Please enter valid Email', name: 'email' }});
            return;
        }

        if (!password && password.trim().length <= 0) {
            this.setState({ isValid: { value: true, text: 'Please enter valid Password', name: 'password' }});
            return;
        }
        axios.post(`${config.prod}/api/user/signin`, { email: email.trim(), password: password.trim() })
            .then(async result => {
                await localStorage.setItem('paper-trading-token', result.data.token);
                await this.props.signIn(result.data.user);
                this.props.history.push('/');
            })
            .catch(err => {
                console.log('Error: ', err.response);
                if (err.response && err.response.status && (err.response.status === 404 || err.response.status === 400 || err.response.status === 401 || err.response.status === 500)) {
                    this.setState({ isValid: { value: true, text: err.response.data.msg } });
                } else {
                    this.setState({ isValid: { value: true, text: 'Unknown Error' } });
                }
            });

    }

    render () {
        return(
            <>
                <div className="auth-wrapper">
                    <div className="auth-content">
                        <div className="auth-bg">
                            <span className="r"/>
                            <span className="r s"/>
                            <span className="r s"/>
                            <span className="r"/>
                        </div>
                        <div className="card">
                            <div className="card-body text-center">
                                <div className="mb-4">
                                    <i className="feather icon-unlock auth-icon"/>
                                </div>
                                <h3 className="mb-4">Login</h3>
                                <div className="input-group mb-3">
                                    <input 
                                        type="email" 
                                        className={this.state.isValid.value && this.state.isValid.name === 'email' ? 'form-control in-valid-input' : 'form-control'} 
                                        placeholder="Email"
                                        name="email"
                                        onFocus={() => this.setState({ isValid: { value: false, text: '', name: '' }})}
                                        onChange={(e) => this.handleTextChange(e.target) }
                                    />
                                </div>
                                <div className="input-group mb-4">
                                    <input 
                                        type="password" 
                                        className={this.state.isValid.value && this.state.isValid.name === 'password' ? 'form-control in-valid-input' : 'form-control'} 
                                        placeholder="password"
                                        name="password"
                                        onFocus={() => this.setState({ isValid: { value: false, text: '', name: '' }})}
                                        onChange={(e) => this.handleTextChange(e.target) }
                                    />
                                </div>
                                <div className="form-group text-left">
                                    {
                                        this.state.isValid.value ?
                                        <Form.Text style={{ color: 'red' }}>
                                            { this.state.isValid.text }
                                        </Form.Text> : ''
                                    }
                                </div>
                                <div>
                                    <button style={{ width: '100%' }} className="btn btn-primary shadow-2 mb-4" onClick={(e)=> this.handleSubmit(e)}>Login</button>
                                </div>
                                <p className="mb-0 text-muted">Create an account? <NavLink to="/signup">Signup</NavLink></p>
                            </div>
                        </div>
                    </div>
                </div>
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