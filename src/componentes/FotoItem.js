import React, { Component } from 'react';
import { Link } from 'react-router';

class FotoAtualizacoes extends Component {

  like(event) {
    event.preventDefault();
    this.props.like(this.props.foto.id);
  }

  comenta(event) {
    event.preventDefault();
    this.props.comenta(this.props.foto.id, this.comentario.value)
  }

  render(){
      return (
          <section className="fotoAtualizacoes">
              <a onClick={this.like.bind(this)} className={this.props.foto.likeada ? "fotoAtualizacoes-like-ativo" : "fotoAtualizacoes-like"} href="/">Likar</a>
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

    render(){
        return (
            <div className="foto-info">
              <div className="foto-info-likes">
                {this.props.foto.likers.length ? this.state.likers.map((liker, index) => 
                  (
                    <Link key={liker.login} to={`/timeline/${liker.login}`}>
                      {liker.login + " " + (this.props.foto.likers.length > index + 1 ? ", " : "")}
                    </Link>
                  )
                ) : ""}
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
            <FotoAtualizacoes foto={this.props.foto} like={this.props.like} comenta={this.props.comenta}/>
          </div>            
        );
    }
}