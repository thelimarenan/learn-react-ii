import Pubsub from 'pubsub-js';

export default class TimelineApi {

    static listaFotos(urlPerfil) {
        return dispatch => {
            fetch(urlPerfil)
                .then(response => response.json())
                .then(fotos => {
                    dispatch({type: "LISTAGEM", fotos});
                    return fotos;
                }
            );
        }
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
            const fotoAchada = this.fotos.find(foto => foto.id === fotoId);
            fotoAchada.likeada = !fotoAchada.likeada;
            const possivelLiker = fotoAchada.likers.find(likerAtual => likerAtual.login === liker.login);
            
            if(possivelLiker === undefined) {
                fotoAchada.likers.push(liker);
            } else {
                const novosLikers = fotoAchada.likers.filter(likerAtual => likerAtual.login !== liker.login);
                fotoAchada.likers = novosLikers;
            }
            Pubsub.publish('timeline', this.fotos);
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
            const fotoAchada = this.fotos.find(foto => foto.id === fotoId);
            fotoAchada.comentarios.push(novoComentario);
            Pubsub.publish('timeline', this.fotos);
        });
    }

    subscribe(callback) {
        Pubsub.subscribe('timeline',(topico,fotos) => {
            callback(fotos);
        });
    }
}