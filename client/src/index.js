import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import userActionReducer from './store/reducers/userActionReducer';
import { BrowserRouter } from 'react-router-dom';

const creducer = combineReducers({
  userDetails: userActionReducer
})

const store = (window.devToolsExtension
  ? window.devToolsExtension () (createStore)
  : createStore) (creducer);


ReactDOM.render(
  <>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
