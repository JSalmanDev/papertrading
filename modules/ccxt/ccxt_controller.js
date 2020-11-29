const ccxt = require('ccxt');
const binance = new ccxt.binance();


class CCXT {
  
    constructor() {}

    historicalData() {
        return async (req, res) => {
            let promiseArray = [];
            promiseArray.push(binance.fetchOHLCV(req.params.symbol, '1h', req.params.from - (10 * 86400000), 1000, -1));
            promiseArray.push(binance.fetchOHLCV(req.params.symbol, '1d', req.params.from - (10 * 86400000), 1000, -1));
        
            Promise.all(promiseArray)
                .then(result => {
                    return res.status(200).send({ "1h": result[0], "1d": result[1] });
                })
                .catch(err => {
                    return res.status(500).send({ msg: 'Internal Server Error', error: err });
                });
        }
    }

    getSymbols() {
        return async (req, res) => {
            binance.fetchMarkets()
                .then(result => {
                    return res.status(200).send({ result });
                })
                .catch(err => {
                    return res.status(500).send({ msg: 'Internal Server Error', error: err });
                });
        }
    }

}

module.exports = new CCXT();
