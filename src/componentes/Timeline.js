import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Pubsub from 'pubsub-js';

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
        Pubsub.subscribe('timeline',(topico,fotosPesquisa) => {
            this.setState({fotos: fotosPesquisa});
        });
    
        Pubsub.subscribe('novos-comentario', (topico, comentarioInfo) => {
            const fotoAchada = this.state.fotos.find(foto => foto.id === comentarioInfo.fotoId);
            fotoAchada.comentarios.push(comentarioInfo.novoComentario);
            this.setState({fotos: this.state.fotos});
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

        fetch(urlPerfil)
            .then(response => response.json())
            .then(fotos => {
                this.setState({fotos: fotos});
                this.logicaTimeline = new LogicaTimeline(fotos);
            }
        );
    }

    like(fotoId) {
        this.logicaTimeline.like(fotoId);
    }

    comenta(fotoId, comentario) {
        const requestInfo = {
            method: 'POST',
            headers: new Headers({
              'X-AUTH-TOKEN': localStorage.getItem('auth-token'),
              'Content-type': 'application/json'
            }),
            body: JSON.stringify({texto: comentario})
        };
      
        fetch(`https://instalura-api.herokuapp.com/api/fotos/${fotoId}/comment`, requestInfo)
        .then(response => {
            if(response.ok) {
            return response.json();
            } else {
            throw new Error('Não foi possível efetuar comentário');
            }
        }).then(novoComentario => {
            Pubsub.publish('novos-comentario', {fotoId, novoComentario});
        });
    }

    render(){
        return (
        <div className="fotos container">
            <ReactCSSTransitionGroup
                transitionName="timeline"
                transitionEnterTimeout={500}
                transitionLeaveTimeout={300}>
                {this.state.fotos.map((foto, key) => <FotoItem key={key} foto={foto} like={this.like.bind(this)} comenta={this.comenta}/>)}
            </ReactCSSTransitionGroup>
        </div>            
        );
    }
}