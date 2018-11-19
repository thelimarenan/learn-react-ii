import React, { Component } from 'react';
import { browserHistory } from 'react-router'

export default class Login extends Component {

    constructor(props) {
        super(props);

        this.state = {msg: props.location.query.msg || ''};
    }

    envia(event) {
        event.preventDefault();
        const requestInfo = {
            method: "POST",
            body: JSON.stringify({
                login: this.login.value,
                senha: this.senha.value
            }),
            headers: new Headers({
                'Content-type': 'application/json'
            })
        }

        fetch('https://instalura-api.herokuapp.com/api/public/login', requestInfo)
            .then(response => {
                if(response.ok) {
                    return response.text()
                } else {
                    
                    throw new Error('Não foi possível fazer o login.');
                }
            }).then(token => {
                localStorage.setItem('auth-token', token);
                browserHistory.push('/timeline');
            })
            .catch(err => {
                console.log(err);
                this.setState({msg: err.message})
            });
    }

    render() {
        return (
            <div className="login-box">
                <h1 className="header-logo">Instalura</h1>
                <form onSubmit={this.envia.bind(this)}>
                    <span>{this.state.msg}</span>
                    <input type="text" ref={input => this.login = input}/>
                    <input type="password" ref={input => this.senha = input}/>
                    <input type="submit" value="login"/>
                </form>
            </div>
        );
    }
}