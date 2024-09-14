import {Hand} from './card.js';
export class Player {
    constructor(Id,
            ) {
    this.playerId = Id;
    this.handElement = document.querySelector(`#player${this.playerId}-hand`);
    this.handCountElement = document.querySelector(`#player${this.playerId}-card-count`);
    this.hand = new Hand(this.handElement, this.handCountElement, this.playerId);
    this.playButton = document.querySelector(`#player${this.playerId}-play-button`);
    this.passButton = document.querySelector(`#player${this.playerId}-pass-button`);
    this.sortButton = document.querySelector(`#player${this.playerId}-sort-button`);
    this.selectButton = document.querySelector(`#player${this.playerId}-select-button`);
    this._isTurnPlayer = true;
    this.isCurrentPlayer = false;
    this.status = 'playing'; // 'waiting', 'selecting', 'playing'
    }
    get isTurnPlayer() {
        return this._isTurnPlayer;
    }
    set isTurnPlayer(value) {
        this._isTurnPlayer = value;
        if (value){
            this.passButton.style.display = 'block';
        } else {
            this.passButton.style.display = 'none';
        }
    }


}

