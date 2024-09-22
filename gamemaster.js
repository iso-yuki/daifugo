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
        const player1Cards = this.playArea.deck.deal(20);
        player1Cards.forEach(card => this.player[1].hand.addCard(card));
        this.player[1].hand.sortCards();

        const player2Cards = this.playArea.deck.deal(20);
        player2Cards.forEach(card => this.player[2].hand.addCard(card));
        this.player[2].hand.sortCards();
    }

    //ボタンを初期化するメソッド
    setupButtons() {
        //　各プレイヤーの各ボタンにfor eachでイベントリスナーを追加
        Object.values(this.player).forEach(player => {
            // Playボタンを押した時の処理
            player.playButton.addEventListener('click', () => {
                if (player.isTurnPlayer && player.status === 'playing') {
                    handlePlay(this);
                } else {
                    console.log("now state is " + player.status);
                }
            });
            // Passボタンを押した時の処理
            player.passButton.addEventListener('click', () => {
                // プレイヤーがパスできるかどうかを確認
                if (player.isTurnPlayer === true && player.status === 'playing') {
                    this.handlePass(player.playerId);
                } else {
                    console.log("now state is " + player.status + " and isTurnPlayer is " + player.isTurnPlayer);
                }
            });
            // Sortボタンを押した時の処理
            player.sortButton.addEventListener('click', () => {
                player.hand.sortCards();
            });
            // Selectボタンを押した時の処理
            // player.selectButton.addEventListener('click', () => {
            //     handleSelect();
            // });
        });

    }

    // パスを処理するメソッド
    handlePass(playerId) {
        console.log(`player${playerId} has passed.`);
        this.updateTurn();
        this.playArea.playEffectRule.reset();
        this.playArea.playState.previousPlayed.setup();
        this.playArea.clearPlayedCard();
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
        if (this.playArea.playEffectRule.eightActivated){
            this.playArea.playState.updateTurnCount();
            this.playArea.updateTurnInfo(`player${this.playArea.playState.turnPlayerId}'s turn`);
            this.playArea.playState.currentPlayerStatus = 'playing';
            this.player[this.playArea.playState.turnPlayerId].status = 'playing';
            this.playArea.playEffectRule.reset();
            this.playArea.playState.previousPlayed.setup();
            this.playArea.clearPlayedCard();
            return;
        }
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