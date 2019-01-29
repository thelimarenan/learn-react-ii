import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import LogicaTimeline from '../logicas/LogicaTimeline';
import FotoItem from './FotoItem';

export default class Timeline extends Component {

    constructor(props) {
        super(props);
        this.state = {fotos: []};
        this.login = props.login;
        this.logicaTimeline = new LogicaTimeline([]);
    }

    componentWillMount() {
        this.logicaTimeline.subscribe((fotos) => {
            this.setState({fotos: fotos})
        });
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

        this.logicaTimeline.listaFotos(urlPerfil);
    }

    like(fotoId) {
        this.logicaTimeline.like(fotoId);
    }

    comenta(fotoId, comentario) {
        this.logicaTimeline.comenta(fotoId, comentario);
    }

    render(){
        return (
        <div className="fotos container">
            <ReactCSSTransitionGroup
                transitionName="timeline"
                transitionEnterTimeout={500}
                transitionLeaveTimeout={300}>
                {this.state.fotos.map((foto, key) => <FotoItem key={key} foto={foto} like={this.like.bind(this)} comenta={this.comenta.bind(this)}/>)}
            </ReactCSSTransitionGroup>
        </div>            
        );
    }
}