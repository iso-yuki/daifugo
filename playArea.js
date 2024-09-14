
import {Deck, PlayedCard, Trash, RestrictionSuits} from './card.js';
import {PlayType} from './play.js';
export class PlayArea{
    constructor() {
        this.deckElement = document.querySelector('#deck');
        this.deckCountElement = document.querySelector('#deck-count');
        this.playedCardElement = document.querySelector('#played-card');
        this.playedCardCountElement = document.querySelector('#played-card-count');
        this.trashElement = document.querySelector('#trash');
        this.trashCountElement = document.querySelector('#trash-count');
        this.turnInfoElement = document.querySelector('#turn-info');
        this.deck = new Deck(this.deckElement, this.deckCountElement);
        this.deck.InitCards();
        this.deck.shuffle();
        this.playedCard = new PlayedCard(this.playedCardElement, this.playedCardCountElement);
        this.trash = new Trash(this.trashElement, this.trashCountElement);
        this.playState = new PlayState();
        this.playEffectRule = new PlayEffectRule();
    }

    updateTurnInfo(message) {
        this.turnInfoElement.textContent = message;
        console.log(message);
    }

    // 場を流す
    clearPlayedCard() {
        for (let i = this.playedCard.Cards.length - 1; i >= 0; i--) {
            this.playedCard.passCard(this.playedCard.Cards[i], this.trash);
        }
    }
}

class PlayEffectRule {
    constructor() {
        this.twelveActivated = [];
        this.thirteenActivated = [];
        this.elevenActivated = false;
        this.revolutionActivated = false;
        this.superrevolutionActivated = false;
        this.restrictionElement = document.querySelector('#restriction');
        this.restrictionCountElement = document.querySelector('#restriction-count');
        this.restriction = new RestrictionSuits(this.restrictionElement, this.restrictionCountElement);
    }
}

class PlayState{
    constructor() {
        this.turnCount = 0;
        this.turnPlayerId = 1;
        this.currentPlayerId = 1;
        this.reverseStrength = 1;
        this.currentPlayerStatus = 'waiting';
        this.previousPlayType = new PlayType();
        this.previousPlayType.resetPlayType();

    }

    updateCurrentPlayer(playerId) {
        this.currentPlayerId = playerId;
    }
    updateTurnPlayer() {
        if (this.turnPlayerId === 1) {
            this.turnPlayerId = 2;

        } else if (this.turnPlayerId === 2) {
            this.turnPlayerId = 1;
        }
    }
    updateTurnCount() {
        this.turnCount++;
    }
    updateReverseStrength() {
        this.reverseStrength *= -1;
    }
}

