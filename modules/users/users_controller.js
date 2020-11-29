const userModel = require ('./users_model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const db = require('../../config/db_config');

class Users {
  
    constructor() { }

    
    balanceReset() {
        return async (req, res) => {
            let { user_id } = req.body;
            if (!user_id) {
                return res.status(400).send({ msg: 'Bad Request' });
            }
            
            try {
                const userExists = await userModel.findOne({ where: { id: user_id } });
                if (userExists) {
                    const result = await userExists.update({ balance: 400 });
                    return jwt.sign({ id: userExists.id, balance: 400, firstName: userExists.first_name, lastName: userExists.last_name, email: userExists.email }, config.privateKey, { expiresIn: '30 days' }, function(err, token) {
                        if (err) {
                            console.log('Error in generating jwt token. ', err);
                            return res.status(500).json({ msg: 'Internal Server Error', error: err });
                        } else {
                            return res.status(200).send({ 
                                token: token,
                                msg: 'Balance reset Successfully'
                            });
                        }
                    });
                } else {
                    return res.status(404).send({ msg: 'No user found' });
                }
            } catch (error) {
                console.log('Error in reset balance', error);
                return res.status(500).send({ msg: 'Internal Server Error', error });
            }
        }
    }
    
    userLogin() {
        return async (req, res) => {
            let { email, password } = req.body;

            if (!email ||!password) {
                return res.status(400).send({ msg: 'Bad Request' });
            }
            
            try {
                const userExists = await userModel.findOne({ where: { email: email.toLowerCase() } });
                if (userExists) {
                    let validPasscode = await bcrypt.compareSync(password, userExists.password);
                    if (validPasscode) {
                        return jwt.sign({ id: userExists.id, balance: userExists.balance, firstName: userExists.first_name, lastName: userExists.last_name, email: userExists.email }, config.privateKey, { expiresIn: '30 days' }, function(err, token) {
                            if (err) {
                                console.log('Error in generating jwt token. ', err);
                                return res.status(500).json({ msg: 'Internal Server Error', error: err });
                            } else {

                                return res.status(200).send({ 
                                    token: token,
                                    user: { 
                                        id: userExists.id,
                                        firstName: userExists.first_name, 
                                        lastName: userExists.last_name, 
                                        email: userExists.email,
                                        balance: userExists.balance
                                    }
                                });
                            }
                        });
                    } else {
                        return res.status(401).send({ msg: 'Invalid Email or Password' });
                    }
                } else {
                    return res.status(404).send({ msg: 'No user registered against this email' });
                }
            } catch (error) {
                console.log('Error in user login', error);
                return res.status(500).send({ msg: 'Internal Server Error', error });
            }
        }
    }
}

module.exports = new Users();
