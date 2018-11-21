import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Pubsub from 'pubsub-js';

import FotoItem from './FotoItem';

export default class Timeline extends Component {

    constructor(props) {
        super(props);
        this.state = {fotos: []};
        this.login = props.login;
    }

    componentWillMount() {
        Pubsub.subscribe('timeline',(topico,fotosPesquisa) => {
            this.setState({fotos: fotosPesquisa});
        });

        Pubsub.subscribe('atualiza-likers', (topico, infoLiker) => {
            const fotoAchada = this.state.fotos.find(foto => foto.id === infoLiker.fotoId);
            fotoAchada.likeada = !fotoAchada.likeada;
            const possivelLiker = fotoAchada.likers.find(liker => liker.login === infoLiker.liker.login);
            
            if(possivelLiker === undefined) {
                fotoAchada.likers.push(infoLiker.liker);
            } else {
                const novosLikers = fotoAchada.likers.filter(liker => liker.login !== infoLiker.liker.login);
                fotoAchada.likers = novosLikers;
            }
            this.setState({fotos: this.state.fotos});
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
            }
        );
    }

    like(fotoId) {
        const requestInfo = {
            method: 'POST',
            headers: new Headers({
              'X-AUTH-TOKEN': localStorage.getItem('auth-token')
            })
        }
      
        fetch(`https://instalura-api.herokuapp.com/api/fotos/${fotoId}/like`, requestInfo)
        .then(response => {
            if(response.ok) {
            return response.json();
            } else {
            throw new Error("Não foi possível realizar o like na foto");
            }
        }).then(liker => {
            Pubsub.publish('atualiza-likers', {fotoId, liker})
        });
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
                {this.state.fotos.map((foto, key) => <FotoItem key={key} foto={foto} like={this.like} comenta={this.comenta}/>)}
            </ReactCSSTransitionGroup>
        </div>            
        );
    }
}