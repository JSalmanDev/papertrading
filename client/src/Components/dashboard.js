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

class Dashboard extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        isValid: {
            value: false,
            text: ''   
        },
        currentStockValue: 0,
        quantity: 0,
        symbols: [],
        dropDownSelected: 1,
        transactions: [],
        isLoading: false,
        symbolSelected: { value: 'ETHBTC', label: 'ETH/BTC' },
        stockOptions: {
            yAxis: [{
              height: '75%',
              labels: {
                align: 'right',
                x: -3
              },
              title: {
                text: 'ETH/BTC'
              }
            }, {
              top: '75%',
              height: '20%',
              labels: {
                align: 'right',
                x: -3
              },
              offset: 0,
              title: {
                text: ''
              }
            }],
            series: [{
              data: [ ],
              type: 'ohlc',
              name: 'ETH/BTC Stock Price',
              id: 'ETH?BTC'
            }, 
            {
              type: 'macd',
              yAxis: 1,
              linkedTo: 'ETH/BTC'
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
            let from = Date.now();
            let encode = encodeURIComponent(this.state.symbolSelected.label);
            promiseArray.push(axios.get(`${config.prod}/api/ccxt/symbols`));
            promiseArray.push(axios.get(`${config.prod}/api/ccxt/binance/${encode}/${from}`));
            promiseArray.push(axios.get(`${config.prod}/api/transaction/${decode.id}/${encode}/list`));
            
            Promise.all(promiseArray)
                .then(res => {
                    let symbols = [];
                    let data = [];
                    res[1].data['1h'].forEach(elem => {
                        data.push([
                            parseInt(elem[0]), parseFloat(elem[1]), 
                            parseFloat(elem[2]), parseFloat(elem[3]),
                            parseFloat(elem[4])
                        ]);
                    });
                    
                    let stockOptions = {
                        yAxis: [{
                        height: '75%',
                        labels: {
                            align: 'right',
                            x: -3
                        },
                        title: {
                            text: `${this.state.symbolSelected.label}`
                        }
                        }, {
                        top: '75%',
                        height: '20%',
                        labels: {
                            align: 'right',
                            x: -3
                        },
                        offset: 0,
                        title: {
                            text: ''
                        }
                        }],
                        series: [{
                        data: data,
                        type: 'ohlc',
                        name: `${this.state.symbolSelected.label} Stock Price`,
                        id: `${this.state.symbolSelected.label}`
                        }, 
                        {
                        type: 'macd',
                        yAxis: 1,
                        linkedTo: `${this.state.symbolSelected.label}`
                        }
                        ]
                    };
                    res[0].data.result.forEach(elem => {
                        symbols.push({ value: elem.id, label: elem.symbol });
                    });
                    this.setState({ 
                        symbols: symbols, stockOptions: stockOptions, transactions: res[2].data.data,
                        currentStockValue: res[1].data['1h'][res[1].data['1h'].length-1][1] 
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

    getHistoricalData() {
        this.setState({ loading: true });
        let from = Date.now();
        let encode = encodeURIComponent(this.state.symbolSelected.label);

        let promiseArray = [];
        promiseArray.push(axios.get(`${config.prod}/api/ccxt/binance/${encode}/${from}`));
        promiseArray.push(axios.get(`${config.prod}/api/transaction/${this.props.user.id}/${encode}/list`));

        Promise.all(promiseArray)
            .then(res => {
                let data = [];
                res[0].data['1h'].forEach(elem => {
                    data.push([
                        parseInt(elem[0]), parseFloat(elem[1]), 
                        parseFloat(elem[2]), parseFloat(elem[3]),
                        parseFloat(elem[4])
                    ]);
                });
                let stockOptions = {
                    yAxis: [{
                      height: '75%',
                      labels: {
                        align: 'right',
                        x: -3
                      },
                      title: {
                        text: `${this.state.symbolSelected.label}`
                      }
                    }, {
                      top: '75%',
                      height: '20%',
                      labels: {
                        align: 'right',
                        x: -3
                      },
                      offset: 0,
                      title: {
                        text: ''
                      }
                    }],
                    series: [{
                      data: data,
                      type: 'ohlc',
                      name: `${this.state.symbolSelected.label} Stock Price`,
                      id: `${this.state.symbolSelected.label}`
                    }, 
                    {
                      type: 'macd',
                      yAxis: 1,
                      linkedTo: `${this.state.symbolSelected.label}`
                    }
                    ]
                };
                this.setState({ 
                    isLoading: false, stockOptions: stockOptions, transactions: res[1].data.data,
                    currentStockValue: res[0].data['1h'][res[0].data['1h'].length-1][1] 
                });
            })
            .catch(err => {
                console.log(err);
                this.setState({ isLoading: false });
            });
    }

    handleMultiSelectChange = async (value, name) => {
        await this.setState({ [name]: value });
        this.getHistoricalData();
    }

    handleTextChange (e) {
        this.setState({ [e.name]: e.value });
    }

    buySellFunc(e) {
        e.preventDefault();
        this.setState({ isLoading: false });
        
        axios.post(`${config.prod}/api/transaction/create`, { quantity: this.state.quantity, stock: this.state.symbolSelected.label, value: this.state.currentStockValue, user_id: this.props.user.id, buy_sell: this.state.dropDownSelected })
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
                this.getHistoricalData();        
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
                    <Row>
                        <Col md={8}>
                            <Row style={{ marginTop: 10 }}>
                                <Col>
                                    <Select
                                        onChange={(e) => this.handleMultiSelectChange(e,'symbolSelected')}
                                        options={this.state.symbols}
                                        value={this.state.symbolSeleted}
                                        isMulti={false}
                                        placeholder="Select Market...."
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        constructorType={'stockChart'}
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
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Card>
                                        <Card.Header>
                                            <Card.Title as="h6">Trade Histoy of {`${this.state.symbolSelected.label}`}</Card.Title>
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
                                            <Row>
                                                <Col>
                                                   <p><b>{`${this.state.symbolSelected.label}`} :</b> {`$${this.state.currentStockValue} current price`}</p> 
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <Form onSubmit={(e)=> this.buySellFunc(e)}>
                                                        <Form.Row>
                                                            <Col xs={6}>
                                                                <Form.Group className="mb-2" controlId="exampleForm.ControlInput1">
                                                                    <Form.Label>Quantity</Form.Label>
                                                                    <Form.Control 
                                                                        type="number"
                                                                        placeholder="Quantity"
                                                                        min={0}
                                                                        name="quantity" 
                                                                        value={this.state.quantity}
                                                                        className={this.state.isValid.value && this.state.isValid.name === 'quantity' ? 'in-valid-input' : ''}
                                                                        onFocus={() => this.setState({ isValid: { value: false, text: '', name: '' }})}
                                                                        onChange={(e) => this.handleTextChange(e.target) }
                                                                    />
                                                                    {
                                                                        this.state.isValid.value && this.state.isValid.name === 'quantity' ?
                                                                        <Form.Text style={{ color: 'red' }}>
                                                                            { this.state.isValid.text }
                                                                        </Form.Text> : ''
                                                                    }
                                                                </Form.Group>
                                                            </Col>
                                                            <Col xs={3}>
                                                                <Form.Group className="mb-2" controlId="exampleForm.ControlInput1">
                                                                    <Form.Label>Buy/Sell</Form.Label>
                                                                    <Form.Control as="select" onChange={(e) => this.changeBuySell(e.target)}>
                                                                        <option value={1}>Buy</option>
                                                                        <option value={0}>Sell</option>
                                                                    </Form.Control>
                                                                </Form.Group>
                                                            </Col>
                                                            <Col xs={3}>
                                                                <Form.Group className="mb-2">
                                                                    <Button style={{ marginTop: 32 }} onClick={(e) => this.buySellFunc(e)} variant="success">OK</Button>
                                                                </Form.Group>
                                                            </Col>
                                                        </Form.Row>
                                                        <Form.Row>
                                                            {
                                                                this.state.isValid.value && this.state.isValid.name === 'server_error' ?
                                                                <Form.Text style={{ color: 'red' }}>
                                                                    { this.state.isValid.text }
                                                                </Form.Text> : ''
                                                            }
                                                        </Form.Row>
                                                    </Form>
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

export default connect(mapStateToProps, actions)(Dashboard);
  