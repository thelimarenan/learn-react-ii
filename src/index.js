import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { Router, Route, browserHistory } from 'react-router';
import { matchPattern } from 'react-router/lib/PatternUtils';

import './css/reset.css';
import './css/timeline.css';
import './css/login.css';
import './css/custom.css';
import App from './App';
import Login from './componentes/Login';
import Logout from './componentes/Logout';

function verificaAutenticacao(nextState, replace) {
    const privateAddress = matchPattern('/timeline(/:login)',nextState.location.pathname).paramValues[0] === undefined;
    if(privateAddress && localStorage.getItem('auth-token') == null) {
        replace('/?msg=Você precisa estar logado para acessar o endereço');
    }
}

ReactDOM.render((
    <Router history={browserHistory}>
        <Route path="/" component={Login}/>
        <Route path="/timeline(/:login)" component={App} onEnter={verificaAutenticacao}/>
        <Route path="/logout" component={Logout}/>
    </Router>
), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
