import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import TimelineApi from '../logicas/TimelineApi';
import FotoItem from './FotoItem';

export default class Timeline extends Component {

    constructor(props) {
        super(props);
        this.state = {fotos: []};
        this.login = props.login;
    }

    componentWillMount() {
        this.props.store.subscribe(() => {
            this.setState({fotos: this.props.store.getState()});
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

        this.props.store.dispatch(TimelineApi.listaFotos(urlPerfil));
    }

    like(fotoId) {
        this.props.store.like(fotoId);
    }

    comenta(fotoId, comentario) {
        this.props.store.comenta(fotoId, comentario);
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