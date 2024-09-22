
import {Deck, PlayedCard, Trash} from './card.js';
import {Played} from './play.js';
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
        this.activationNumberElement = document.querySelector('#activation-number');
        this.activationNumber = new ActivationNumber(this.activationNumberElement);
        this.elevenActivated = false;
        this.eightActivated = false;
        this.revolutionActivated = false;
        this.revolutionElement = document.querySelector('#revolution');
        this.revolutionIcon = new Icon(this.revolutionElement, 'images/revolution.png');
        this.superrevolutionActivated = false;
        this.superrevolutionElement = document.querySelector('#super-revolution');
        this.superrevolutionIcon = new Icon(this.superrevolutionElement, 'images/super_revolution.png');
        this.reverseStrength = false;
        this.reverseStrengthElement = document.querySelector('#reverse-strength');
        this.reverseStrengthIcon = new Icon(this.reverseStrengthElement, 'images/reverse.png');
        this.restrictionStair  = false;
        this.restrictionStairElement = document.querySelector('#restriction-stair');
        this.restrictionStairIcon = new Icon(this.restrictionStairElement, 'images/stair.png');
        this.elementsSetup();
        this.restrictionSuitElement = document.querySelector('#restriction-suit');
        this.restrictionSuit = new RestrictionSuits(this.restrictionSuitElement);

        // 初期化時にアイコンの表示状態を更新
        this.updateIcons();
    }

    // アイコンの状態を更新するメソッド
    updateIcons() {
        this.updateIconOpacity(this.revolutionActivated, this.revolutionElement);
        this.updateIconOpacity(this.superrevolutionActivated, this.superrevolutionElement);
        this.updateIconOpacity(this.reverseStrength, this.reverseStrengthElement);
        this.updateIconOpacity(this.restrictionStair, this.restrictionStairElement);
    }

    // アクティブかどうかに応じて opacity を更新するヘルパーメソッド
    updateIconOpacity(isActivated, element) {
        if (isActivated) {
            element.style.opacity = '1';  // アクティブの場合は不透明
        } else {
            element.style.opacity = '0.2';  // 非アクティブの場合は半透明
        }
    }

    // 他の処理に応じて各フラグの状態が変わったときにも updateIcons を呼び出す
    toggleRevolution() {
        this.revolutionActivated = !this.revolutionActivated;
        this.setReverseStrength();
        this.updateIcons(); 
    }

    toggleSuperRevolution() {
        this.superrevolutionActivated = !this.superrevolutionActivated;
        this.setReverseStrength();
        this.updateIcons();
    }

    toggleRestrictionStair() {
        this.restrictionStair = !this.restrictionStair;
        this.updateIcons();
    }

    elementsSetup() {
        // ここで初期設定の処理を行う
        // アイコンの状態更新もここで行う
        this.updateIcons();
    }

    reset() {
        this.elevenActivated = false;
        this.eightActivated = false;
        this.restrictionStair = false;
        this.restrictionSuit.reset();
        this.setReverseStrength();
    }
    setReverseStrength() {
        // this.elevenActivated, this.revolutionActivated, this.superrevolutionActivatedが奇数個trueの時、true
        if ((this.elevenActivated + this.revolutionActivated + this.superrevolutionActivated) % 2 === 1) {
            this.reverseStrength = true;
        } else {
            this.reverseStrength = false;
        }
        this.updateIcons();
    }
}

class PlayState{
    constructor() {
        this.turnCount = 0;
        this.turnPlayerId = 1;
        this.currentPlayerId = 1;
        this.currentPlayerStatus = 'waiting';
        this.previousPlayed = new Played();
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
}

class Icon{
    constructor(parentElement, imgPath) {
        this.parentElement = parentElement;
        this.setup(imgPath);
    }
    setup(imgPath) {
        const Img = new Image();
        Img.src = imgPath;
        Img.setAttribute('class', 'icon-img');
        this.parentElement.appendChild(Img);
    }
}

class RestrictionSuits {
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.setup();
    }
    setup(){
        this.suits = ['spade', 'heart', 'diamond', 'club'];
        this.suitsCount = {
            'spade': 0,
            'heart': 0,
            'diamond': 0,
            'club': 0
        };
        this.suitElements = [];
        this.suits.forEach((suit) => {
            // スートのdiv要素を生成
            const suitElement = document.createElement('div');
            suitElement.setAttribute('class', 'restriction-suit');
            // スートの画像を生成
            const imageName = `images/card_${suit}_00.png`;
            const suitImage = new Image();
            suitImage.src = imageName;
            suitImage.setAttribute('class', 'restriction-suit-img');
            suitElement.appendChild(suitImage);
            this.parentElement.appendChild(suitElement);
            //スートのカウントテキストを生成
            const suitCount = document.createElement('div');
            suitCount.setAttribute('class', 'restriction-suit-count');
            suitCount.textContent = this.suitsCount[suit];
            suitElement.appendChild(suitCount);

            this.suitElements.push(suitElement);
        });
    }
    updateRestrictionSuits() {
        this.suits.forEach((suit, index) => {
            console.log(suit);
            this.suitElements[index].querySelector('.restriction-suit-count').textContent = this.getRestrictionSuitCount(suit);
        });
    }
    getRestrictionSuitCount(suit) {
        return this.suitsCount[suit];
    }
    reset() {
        this.suits.forEach((suit) => {
            this.suitsCount[suit] = 0;
        });
        this.updateRestrictionSuits();
    }
}

class ActivationNumber {
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.setup();
    }
    setup() {
        const numList = ['6', '7', '8', '9', 'T', 'J', 'Q', 'K', '2', 'all', 'draw'];

        for (let i = 0; i < numList.length; i++) {
            const num = numList[i];  // num を定数として宣言
            console.log(num);
        
            // div 要素を作成
            const numberElement = document.createElement('div');
            numberElement.setAttribute('class', 'activation-number-icon');
        
            // 画像のパスを生成
            const imageName = `images/number_${num}.png`;
            const numImage = new Image();  // 画像要素を生成
            numImage.src = imageName;
            numImage.setAttribute('class', 'activation-number-img');
        
            // 画像を div に追加
            numberElement.appendChild(numImage);
        
            // 親要素に追加
            this.parentElement.appendChild(numberElement);
        }
        

    }
}