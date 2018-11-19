import React, { Component } from 'react';
import { Link } from 'react-router';
import Pubsub from 'pubsub-js';

class FotoAtualizacoes extends Component {

  constructor(props) {
    super(props);
    this.state = {likeada: props.foto.likeada}
  }

  like(event) {
    event.preventDefault();

    const requestInfo = {
      method: 'POST',
      headers: new Headers({
        'X-AUTH-TOKEN': localStorage.getItem('auth-token')
      })
    }

    fetch(`https://instalura-api.herokuapp.com/api/fotos/${this.props.foto.id}/like`, requestInfo)
      .then(response => {
        if(response.ok) {
          return response.json();
        } else {
          throw new Error("Não foi possível realizar o like na foto");
        }
      }).then(liker => {
        this.setState({likeada: !this.state.likeada});
        Pubsub.publish('atualiza-likers', {fotoId: this.props.foto.id, liker})
      });
  }

  comenta(event) {
    event.preventDefault();
    const requestInfo = {
      method: 'POST',
      headers: new Headers({
        'X-AUTH-TOKEN': localStorage.getItem('auth-token'),
        'Content-type': 'application/json'
      }),
      body: JSON.stringify({texto: this.comentario.value})
    };

    fetch(`https://instalura-api.herokuapp.com/api/fotos/${this.props.foto.id}/comment`, requestInfo)
      .then(response => {
        if(response.ok) {
          return response.json();
        } else {
          throw new Error('Não foi possível efetuar comentário');
        }
      }).then(novoComentario => {
        Pubsub.publish('novos-comentario', {fotoId: this.props.foto.id, novoComentario});
      });
  }

  render(){
      return (
          <section className="fotoAtualizacoes">
              <a onClick={this.like.bind(this)} className={this.state.likeada ? "fotoAtualizacoes-like-ativo" : "fotoAtualizacoes-like"} href="/">Likar</a>
              <form className="fotoAtualizacoes-form" onSubmit={this.comenta.bind(this)}>
                  <input type="text" placeholder="Adicione um comentário..." className="fotoAtualizacoes-form-campo" ref={input => this.comentario = input}/>
                  <input type="submit" value="Comentar!" className="fotoAtualizacoes-form-submit"/>
              </form>
          </section>            
      );
  }
}

class FotoInfo extends Component {

    constructor(props) {
      super(props);

      this.state = {likers: props.foto.likers, comentarios: props.foto.comentarios};
    }

    componentWillMount() {
      Pubsub.subscribe('atualiza-likers', (topico, infoLiker) => {
        if(this.props.foto.id === infoLiker.fotoId){
          const possivelLiker = this.state.likers.find(liker => liker.login === infoLiker.liker.login);
          
          if(possivelLiker === undefined) {
            const novosLikers = this.state.likers.concat(infoLiker.liker);
            this.setState({likers: novosLikers});
          } else {
            const novosLikers = this.state.likers.filter(liker => liker.login !== infoLiker.liker.login);
            this.setState({likers: novosLikers});
          }
        }
      });

      Pubsub.subscribe('novos-comentario', (topico, comentarioInfo) => {
        if(this.props.foto.id === comentarioInfo.fotoId) {
          const novosComentarios = this.state.comentarios.concat(comentarioInfo.novoComentario);
          this.setState({comentarios: novosComentarios});
        }
      })
    }

    render(){
        return (
            <div className="foto-info">
              <div className="foto-info-likes">
                {this.state.likers.map((liker, index) => 
                  (
                    <Link key={liker.login} to={`/timeline/${liker.login}`}>
                      {liker.login + " " + (this.props.foto.likers.length > index + 1 ? ", " : "")}
                    </Link>
                  )
                )}
                {this.props.foto.likers.length ? "curtiram" : "nenhuma curtida"}
              </div>

              <p className="foto-info-legenda">
                <Link to={`/timeline/${this.props.foto.loginUsuario}`} className="foto-info-autor">{this.props.foto.loginUsuario}: </Link>
                {this.props.foto.comentario}
              </p>

              <ul className="foto-info-comentarios">
                {this.state.comentarios.map((comentario, key) => 
                  (
                    <li key={key} className="comentario">
                      <Link to={comentario.login} className="foto-info-autor">{comentario.login} </Link>
                      {comentario.texto}
                    </li>
                  )
                )}
              </ul>
            </div>            
        );
    }
}

class FotoHeader extends Component {
    render(){
        return (
            <header className="foto-header">
              <figure className="foto-usuario">
                <img src={this.props.foto.urlPerfil} alt="foto do usuario"/>
                <figcaption className="foto-usuario">
                  <Link to={`/timeline/${this.props.foto.loginUsuario}`}>
                    {this.props.foto.loginUsuario}
                  </Link>  
                </figcaption>
              </figure>
              <time className="foto-data">{this.props.foto.horario}</time>
            </header>            
        );
    }
}

export default class FotoItem extends Component {
    render(){
        return (
          <div className="foto">
            <FotoHeader foto={this.props.foto}/>
            <img alt="foto" className="foto-src" src={this.props.foto.urlFoto}/>
            <FotoInfo foto={this.props.foto}/>
            <FotoAtualizacoes foto={this.props.foto}/>
          </div>            
        );
    }
}