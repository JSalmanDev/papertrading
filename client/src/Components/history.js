import React from 'react';
import NavBar from './NavBar';
import * as actions from '../store/actions/userActions';
import { connect } from 'react-redux';
import { Row, Col, Card, Table, Form, Button } from 'react-bootstrap';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import config from '../config';
import Select from 'react-select';

// Load Highcharts modules
require('highcharts/indicators/indicators')(Highcharts)
require('highcharts/indicators/pivot-points')(Highcharts)
require('highcharts/indicators/macd')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/map')(Highcharts)

class History extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        isValid: {
            value: false,
            text: ''   
        },
        transactions: [],
        isLoading: false,
        stockOptions: {
            title: {
                text: 'All Trades history'
            },
            series: [{
                data: []
            }]
        }
      }
    }
    
    async UNSAFE_componentWillMount() {
        if (!Object.keys(this.props.user).length) {
            let local = localStorage.getItem('paper-trading-token');
            if (local) {
                let decode = jwt.decode(local);
                let payload = {
                    id: decode.id,
                    firstName: decode.firstName,
                    lastName: decode.lastName,
                    email: decode.email,
                    balance: decode.balance
                }
                await this.props.signIn(payload);
            }
        }
    }

    componentDidMount = async () => {
        let local = localStorage.getItem('paper-trading-token');
        if (local) {
            let decode = jwt.decode(local);
            let promiseArray = [];
            promiseArray.push(axios.get(`${config.prod}/api/transaction/${decode.id}/list`));
            
            Promise.all(promiseArray)
                .then(res => {
                    let data = []; 
                    let data1 = [];
                    
                    res[0].data.data.forEach(elem => {
                        data.push(elem.value * elem.quantity);
                        data1.push(elem.buy_sell ?  `${elem.stock}-BUY` : `${elem.stock}-SELL`);    
                    });

                    let stockOptions = {
                        xAxis: {
                            categories: data1,
                        },
                        title: {
                            text: 'All Trades history'
                        },
                        series: [{
                            data: data,
                        }]
                    };
                    this.setState({ 
                        transactions: res[0].data.data, stockOptions: stockOptions  
                    });
                })
                .catch(err => {
                    console.log(err);
                });
            }
    }

    changeBuySell(e) {
        this.setState({ dropDownSelected: e.value });
    }

    resetBalance(e) {
        e.preventDefault();
        this.setState({ isLoading: false });
        
        axios.post(`${config.prod}/api/user/balance/reset`, { user_id: this.props.user.id })
            .then(res => {
                localStorage.setItem('paper-trading-token', res.data.token);
                let decode = jwt.decode(res.data.token);
                let payload = {
                    id: decode.id,
                    firstName: decode.firstName,
                    lastName: decode.lastName,
                    email: decode.email,
                    balance: decode.balance
                }
                this.props.signIn(payload);
                this.setState({ isLoading: false }); 
            })
            .catch(err => {
                console.log(err);
                if (err.response && err.response.status && (err.response.status === 404 || err.response.status === 400 || err.response.status === 401 || err.response.status === 500)) {
                    this.setState({ isValid: { value: true, text: err.response.data.msg, name:'server_error' } });
                } else {
                    this.setState({ isValid: { value: true, text: 'Unknown Error', name: 'server_error' } });
                }
            })
    }

    render() {
        return (
            <>
                <NavBar username={ this.props.user.firstName ? this.props.user.firstName : 'NA' } />
                <div className="container-fluid">
                    <Row style={{ marginTop: 10 }}>
                        <Col md={8}>
                            <Row>
                                <Col>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        constructorType={'chart'}
                                        options={this.state.stockOptions}
                                    />
                                </Col>
                            </Row>
                        </Col>
                        <Col md={4}>
                            <Row>
                                <Col>
                                    <div style={{ float: "right" }}>
                                        <b>Current Balance: ${`${this.props.user.balance}`}</b>
                                        <Button variant='outline-danger' onClick={(e) => this.resetBalance(e) }>Reset</Button>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Card>
                                        <Card.Header>
                                            <Card.Title as="h6">Portfolio</Card.Title>
                                        </Card.Header>
                                        <Card.Body>
                                            <Row>
                                                <Col>
                                                    <Table striped bordered hover responsive>
                                                        <thead>
                                                            <tr>
                                                                <th>Stock</th>
                                                                <th>Quantity</th>
                                                                <th>Value</th>
                                                                <th>Buy/Sell</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                this.state.transactions.map((elem, i) => (
                                                                    <tr key={i}>
                                                                        <td>{elem.stock}</td>
                                                                        <td>{elem.quantity}</td>
                                                                        <td>{elem.value * elem.quantity}</td>
                                                                        <td>{elem.buy_sell ? 'Buy' : 'Sell' }</td>
                                                                    </tr>
                                                                ))
                                                            }
                                                            {
                                                                this.state.transactions.length ? null :
                                                                <tr>
                                                                    <td colSpan="4" style={{ textAlign: "center" }}>No Data</td>
                                                                </tr>
                                                            }
                                                        </tbody>
                                                    </Table>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
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
  