

const transactionModel = require ('./transaction_history_model');
const userModel = require ('../users/users_model');
const config = require('../../config/config');
const db = require('../../config/db_config');
const jwt = require('jsonwebtoken');

class Transactions {
  
    constructor() { }
    
    
    createTransaction() {
        return async (req, res) => {
            let { stock, quantity, value, buy_sell, user_id } = req.body;

            if (!stock ||!quantity ||!value ||!user_id) {
                return res.status(400).send({ msg: 'Bad Request' });
            }
            
            try {
                const userExists = await userModel.findOne({ where: { id: user_id } });
                if (userExists) {
                    if (userExists.balance >= (quantity * value)) {
                        let obj = { stock, quantity, value, buy_sell, user_id };
                        const result = await transactionModel.create(obj);
                        let newBanalnce = userExists.balance - (quantity * value);
                        const resultBalance = await userExists.update({ balance: newBanalnce });
                        return jwt.sign({ id: userExists.id, balance: newBanalnce, firstName: userExists.first_name, lastName: userExists.last_name, email: userExists.email }, config.privateKey, { expiresIn: '30 days' }, function(err, token) {
                            if (err) {
                                console.log('Error in generating jwt token. ', err);
                                return res.status(500).json({ msg: 'Internal Server Error', error: err });
                            } else {
                                return res.status(200).send({ token: token, status: true, msg: 'Transaction Registered Successfully.' });
                            }
                        });
                    } else {
                        return res.status(400).send({ status: true, msg: `You don't have enough balance to do buy/sell.` });
                    }
                } else {
                    return res.status(404).send({ msg: 'User not found.'})
                }
            } catch (error) {
                console.log('Error in user transaction', error);
                return res.status(500).send({ msg: 'Internal Server Error', error });
            }
        }
    }
    
}

module.exports = new Transactions();
