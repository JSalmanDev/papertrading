const Users = require('../modules/users/users_controller');
const CCXT = require('../modules/ccxt/ccxt_controller');
const Transactions = require('../modules/trasnactionsHistory/transaction_history_controller');

module.exports = function(app) {
  
    app.get("/", function(req, res) {
        res.send("********");
    });
    
    //user Register
    app.post('/api/user/create', Users.userRegister());

    //user Login
    app.post('/api/user/signin', Users.userLogin());
    
    //user balance reset
    app.post('/api/user/balance/reset', Users.balanceReset());

    //historical data
    app.get('/api/ccxt/binance/:symbol/:from', CCXT.historicalData());
    
    //user Login
    app.get('/api/ccxt/symbols', CCXT.getSymbols());

    //create transaction
    app.post('/api/transaction/create', Transactions.createTransaction());

    //list user transactions
    app.get('/api/transaction/:user_id/list', Transactions.listTransactions());

    //list user transactions by stock
    app.get('/api/transaction/:user_id/:stock/list', Transactions.listTransactionsByStock());

};
