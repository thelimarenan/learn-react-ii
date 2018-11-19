import React, { Component } from 'react';

import FotoItem from './FotoItem';

export default class Timeline extends Component {

    constructor(props) {
        super(props);
        this.state = {fotos: []};
        this.login = props.login;
    }

    componentDidMount(){
        this.carregaFotos();
    }

    componentWillReceiveProps(nextProps) {
        this.login = nextProps.login;
        this.carregaFotos();
    }

    carregaFotos() {
        let urlPerfil;

        if(this.login === undefined) {
            urlPerfil = `https://instalura-api.herokuapp.com/api/fotos?X-AUTH-TOKEN=${localStorage.getItem('auth-token')}`;
        } else {
            urlPerfil = `https://instalura-api.herokuapp.com/api/public/fotos/${this.login}`;
        }

        fetch(urlPerfil)
            .then(response => response.json())
            .then(fotos => {
                this.setState({fotos: fotos});
            }
        );
    }

    render(){
        return (
        <div className="fotos container">
            {this.state.fotos.map((foto, key) => <FotoItem key={key} foto={foto} />)}
        </div>            
        );
    }
}