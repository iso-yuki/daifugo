import {Player} from './player.js';
import {PlayArea} from './playArea.js';
import {handlePlay} from './play.js';

class GameMaster {
    constructor() {
        this.playArea = new PlayArea();
        this.player = {
            1: new Player(1),
            2: new Player(2)
        };
        this.dealCards();
        this.setupButtons();
    }

    //各プレイヤーにカードを配るメソッド
    dealCards() {
        const player1Cards = this.playArea.deck.deal(15);
        player1Cards.forEach(card => this.player[1].hand.addCard(card));
        this.player[1].hand.sortCards();
        
        const player2Cards = this.playArea.deck.deal(15);
        player2Cards.forEach(card => this.player[2].hand.addCard(card));
        this.player[2].hand.sortCards();
    }

    //ボタンを初期化するメソッド
    setupButtons() {
        //　各プレイヤーの各ボンタンにfor eachでイベントリスナーを追加
        Object.values(this.player).forEach(player => {
            player.playButton.addEventListener('click', () => {
                if (player.isTurnPlayer && player.status === 'playing') {
                    handlePlay(player.playerId,this);
                } else {
                    console.log("now state is " + player.status);
                }
            });
            player.passButton.addEventListener('click', () => {
                // プレイヤーがぱすできるかどうかを確認
                if (player.isTurnPlayer === true && player.status === 'playing') {
                    this.handlePass(player.playerId);
                } else {
                    console.log("now state is " + player.status + " and isTurnPlayer is " + player.isTurnPlayer);
                }
            });
            player.sortButton.addEventListener('click', () => {
                player.hand.sortCards();
            });
            // player.selectButton.addEventListener('click', () => {
            //     handleSelect();
            // });
        });

    }

    // パスを処理するメソッド
    handlePass(playerId) {
        console.log(`player${playerId} has passed.`);
        this.updateTurn();
        this.playArea.playState.previousPlayType.resetPlayType();
        this.playArea.clearPlayedCard();
    }

    // プレイヤーの手札を取得するメソッド
    getPlayerHand(playerId) {
        return this.player[playerId].hand;
    }

    // 全てのカードの枚数を更新するメソッド
    updateAllCounts() {
        this.player[1].hand.updateCardCount();
        this.player[2].hand.updateCardCount();
        this.playArea.playedCard.updateCardCount();
        this.playArea.deck.updateCardCount();
        this.playArea.trash.updateCardCount();
    }

    // ターン情報を更新するメソッド
    updateTurn() {
        this.playArea.playState.updateTurnPlayer();
        this.playArea.playState.updateTurnCount();
        this.playArea.updateTurnInfo(`player${this.playArea.playState.turnPlayerId}'s turn`);
        if (this.playArea.playState.turnPlayerId === 1) {
            this.player[1].isTurnPlayer = true;
            this.player[2].isTurnPlayer = false;
        } else if (this.playArea.playState.turnPlayerId === 2) {
            this.player[1].isTurnPlayer = false;
            this.player[2].isTurnPlayer = true;
        }
        // this.updatePassButtonVisibility();
        this.playArea.playState.currentPlayerStatus = 'playing';
        this.player[this.playArea.playState.turnPlayerId].status = 'playing';
    }

    // ターンプレイヤーを取得するメソッド
    getTurnPlayerId() {
        return this.turnPlayerId;
    }
    updatePassButtonVisibility() {
        const player1PassButton = document.getElementById('player1-pass-button');
        const player2PassButton = document.getElementById('player2-pass-button');
        
        // ターンプレイヤーに応じてボタンを表示
        if (this.turnPlayerId === 'player1') {
            player1PassButton.style.display = 'block';
            player2PassButton.style.display = 'none';
        } else {
            player1PassButton.style.display = 'none';
            player2PassButton.style.display = 'block';
        }
    }
    declareWinner(playerId) {
        alert(`player${playerId}が勝者です！`);
        // ゲーム終了の処理を追加する場合はここに記述
        // 例えば、ゲームのリセットや再スタートのための処理を行う
    }
}

export const gameMaster = new GameMaster();