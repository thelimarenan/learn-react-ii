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

    static like(fotoId) {
        return (dispatch) => {
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
                dispatch({type: "LIKE", fotoId, liker});
                return liker;
            });
        }
    }

    static comenta(fotoId, comentario) {
        return dispatch => {
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
                dispatch({type: "COMENTARIO",fotoId, novoComentario});
            });
        }
    }

    subscribe(callback) {
        Pubsub.subscribe('timeline',(topico,fotos) => {
            callback(fotos);
        });
    }
}