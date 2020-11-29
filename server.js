const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const db = require("./config/db_config.js");
const app = express();
const path = require('path');

app.use(cors({}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'client', 'build')));
app.use(express.static(path.join(__dirname, 'public', 'uploads')));

require("./routes/routes.js")(app);

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'client', 'build/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
});

//DB Models
const users = require("./modules/users/users_model");
const transactions = require("./modules/trasnactionsHistory/transaction_history_model");

let promiseArray = [];
// // sync db models
promiseArray.push(users.sync());

Promise.all(promiseArray)
  .then(() => {
      transactions.belongsTo(users);
      transactions.sync()
        .then(() => {
            console.log('Tables synced successfully');
        })
        .catch(err => {
            console.log("Table Sync Error: ", err);            
        })
  })
  .catch(err => {
    console.log("Table Sync Error: ", err);
  });

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`server runnning on http://localhost:${PORT}`);
});