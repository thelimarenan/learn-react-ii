import Pubsub from 'pubsub-js';

export default class LogicaTimeline {
    constructor(fotos) {
        this.fotos = fotos;
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
            Pubsub.publish('timeline', this.fotos)
        });
    }
}