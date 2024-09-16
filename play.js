import { CardEffectManager } from './cardEffect.js';
import { Card } from './card.js';
// import { gameMaster } from './gamemaster.js';
const PLAY_TYPES_LIST = {
    SAME_RANK: 'same_rank',
    SAME_SUIT: 'same_suit',
    EMPEROR: 'emperor',
    FOURTEEN: 'fourteen',
    JOKER_ONLY: 'joker_only',
    OTHER: 'other',
    CANNOT: 'cannot',
    START: 'start'
};




export class PlayType {
    constructor(type, minCardNumber, cardCount, reverseStrength, restriction, suits) {
        this.type = Array.isArray(type) ? type : [type]; // プレイタイプを配列として保存
        this.minCardNumber = minCardNumber; // 最小のカード番号
        this.cardCount = cardCount; // プレイ枚数
        this.reverseStrength = reverseStrength; // プレイの強さを逆転させるか
        this.restriction = restriction; // プレイの制限
        this.suits = suits;
    }
    resetPlayType(){
        this.type = [
            PLAY_TYPES_LIST.SAME_RANK,
            PLAY_TYPES_LIST.SAME_SUIT,
            PLAY_TYPES_LIST.JOKER_ONLY,
            PLAY_TYPES_LIST.EMPEROR,
            PLAY_TYPES_LIST.FOURTEEN,
            PLAY_TYPES_LIST.OTHER,
            PLAY_TYPES_LIST.START];
        this.minCardNumber = null;
        this.cardCount = 0 ;
        this.reverseStrength = false;
        this.restriction = [];
        this.suits = [];
    }
    // 前回のプレイとの比較
    canPlayAfter(previousPlayType) {
        // 今回のプレイがCANNOTの場合は常にfalse
        if (this.type.includes(PLAY_TYPES_LIST.CANNOT)) {
            console.log("cannot play")
            return false;
        }

        // 最初のプレイの場合は常にtrue
        if (previousPlayType.type.includes(PLAY_TYPES_LIST.START)) {
            return true;
        }

        // 1. 前回と同じプレイ枚数であるか
        if (this.cardCount !== previousPlayType.cardCount) {
            console.log("card count does not match")
            return false;
        }

        // 2. 前回のプレイタイプと一致しているか
        const previousTypes = Array.isArray(previousPlayType.type) ? previousPlayType.type : [previousPlayType.type];
        const typeMatches = this.type.some(type => previousTypes.includes(type));
        if (!typeMatches) {
            console.log("type does not match")
            return false;
        }

        // 2'.前回と今回のプレイタイプがFOURTEENの場合、最小の数字は判定が変更
        if (this.type.includes(PLAY_TYPES_LIST.FOURTEEN) && previousTypes.includes(PLAY_TYPES_LIST.FOURTEEN)) {
            return true;
        } 
        // 3. 前回の最小の数字より、今回の最小の数字の方が大きいか
        if (this.compareCardNumbers(this.minCardNumber, previousPlayType.minCardNumber) <= 0){
            
            
            console.log("min card number is not enough to play")
            return false;
        } 

        // 4.スート縛りを確認する
        const restrictionSuits = previousPlayType.restriction;

        if (restrictionSuits && restrictionSuits.length > 0) {
            let jokerCount = this.suits.filter(suit => suit === 'joker').length; // Jokerの残り数をトラッキング
            let suitsCopy = [...this.suits]; // this.suitsをコピーして操作
            let checkedSuits = []; // 一致したスートを格納
            
            // Jokerの数だけ未一致のスートを許容
            for (const suit of restrictionSuits) {
                let suitIndex = suitsCopy.indexOf(suit);
                
                if (suitIndex !== -1) {
                    // スートが見つかったら、使ったスートを削除（1度のみ）
                    suitsCopy.splice(suitIndex, 1);
                    checkedSuits.push(suit);
                } else if (jokerCount > 0) {
                    // Jokerで不足を補う
                    jokerCount--;
                    checkedSuits.push(suit); // Jokerを使用したスートを記録
                } else {
                    // Jokerで補えない場合
                    console.log("suit does not match");
                    return false;
                }
            }

            // スート縛りを更新
            this.suits = suitsCopy.concat(checkedSuits);
        }

        // 今回と前回のスートを比較し、一致しているものすべてを取得
        let checkedSuits = [];
        let suitsCopy = this.suits.filter(suit => suit !== 'joker');
        for (const suit of previousPlayType.suits) {
            let suitIndex = suitsCopy.indexOf(suit);
            if (suitIndex !== -1) {
                suitsCopy.splice(suitIndex, 1);
                checkedSuits.push(suit);
            }
        }

        this.restriction = checkedSuits;

        return true;

    }

    // playtypeを更新する
    updatePreviousPlayType(previousPlayType) {
        // 共通のプレイタイプを求める
        const previousTypes = Array.isArray(previousPlayType.type) ? previousPlayType.type : [previousPlayType.type];
        const currentTypes = Array.isArray(this.type) ? this.type : [this.type];
        
        // 両方に含まれるプレイタイプのみを抽出
        const commonTypes = previousTypes.filter(type => currentTypes.includes(type));
        
        // previousPlayType の type を更新
        console.log("縛りは" + this.restriction)
        const updatedPreviousPlayType = new PlayType(commonTypes, this.minCardNumber, this.cardCount, this.reverseStrength, this.restriction, this.suits);
        return updatedPreviousPlayType;
    }

    compareCardNumbers(number1, number2) {
        const order = {
            '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6, '9': 7, '10': 8, '11': 9, '12': 10, '13': 11, '1': 12, '2': 13, '14': 14
        };

        const rank1 = order[number1];
        const rank2 = order[number2];

        if (rank1 === rank2) {
            return 0; // 同じ順位
        } else if (rank1 > rank2) {
            return 1; // number1 は number2 より大きい
        } else {
            return -1; // number1 は number2 より小さい
        }
    }
}

export class PlayValidator {
    constructor(Cards,gameMaster) {
        this.cards = Cards; // Cards クラスのインスタンスを受け取る
        this.gameMaster = gameMaster;
    }
    
    // カードのランクでプレイタイプを判定
    static isSameRank(cards, jokerCount) {
        if (cards.length === 0){
            if (jokerCount === 0) {
                return false;
            } else{
                return true;
            }
        } 
    
        const firstNumber = cards.find(card => card.suit !== 'joker').number; // 最初のジョーカー以外のカードの番号を取得
    
        // ジョーカーは他のカードと同じランクとみなす
        return cards.every(card => card.number === firstNumber || card.suit === 'joker');
    }

    // カードのスートと連番でプレイタイプを判定
    static isSameSuit(cards, jokerCount) {
        if (cards.length+jokerCount < 3) {
            return false;
        }

        // 最初のジョーカー以外のカードを基準にする
        const suit = cards[0].suit;
        const order = {
            '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6, '9': 7, '10': 8, '11': 9, '12': 10, '13': 11, '1': 12, '2': 13, 'joker': 14
        };

        for (let i = 0; i < cards.length - 1; i++) {
            const currentCard = cards[i];
            const nextCard = cards[i + 1];

            // スートが一致しているかの判定
            if (currentCard.suit !== suit || nextCard.suit !== suit) return false;
            
            // 連番の判定
            const currentOrder = order[currentCard.number];
            const nextOrder = order[nextCard.number];
            const gap = nextOrder - currentOrder - 1;

            if (gap > 0) {
                if (gap <= jokerCount) {
                    jokerCount -= gap; // 必要なジョーカーの数だけ減らす
                } else {
                    return false; // 連番の補完に必要なジョーカーが足りない場合
                }
            }
        }

        return true;
    }

    // カードがエンペラーで構成されるかを判定
    static isEmperor(cards, jokerCount = 0) {
        if (cards.length+jokerCount !== 4) {
            return false; // 4枚でなければエンペラーではない
        }

        // カードのスートを追跡するセットを作成
        const suits = new Set();
        // カードの数字を格納する配列を作成
        const ranks = [];

        // 各カードのスートと数字を確認
        for (const card of cards) {
            suits.add(card.suit); // スートを追加
            ranks.push(card.number); // 数字を追加
            }

        // スートが4つ（ジョーカーが補完している場合も含む）かどうかを確認
        if (suits.size + jokerCount < 4) {
            console.log("suits.size is " + suits.size + " jokerCount is " + jokerCount)
            return false; // 4つの異なるスートがない場合はエンペラーではない
        }

        // 連続する数字かどうかを確認
        for (let i = 1; i < ranks.length; i++) {
            const difference = ranks[i] - ranks[i - 1];
            if (difference > 1) {
                jokerCount -= (difference - 1);
            }
            if (jokerCount < 0) {
                console.log("not enough joker")
                return false; // ジョーカーが足りず、連番が完成しない場合
            }
        }

        return true; // 条件をすべて満たしている場合
    }

    // カードがジョーカーのみで構成されるかを判定
    static isJokerOnly(cards, jokerCount) {
        return cards.length === 0 && jokerCount > 0;
    }

    // カードの数字の合計が14で構成されるかを判定
    static isFOURTEEN(cards, jokerCount) {
        if (cards.length+jokerCount !== 2) {
            return false; // 2枚でなければ14ではない
        }
        if (jokerCount>=1) return true; // ジョーカーがあれば14

        // カードの数字の合計が14かどうかを確認
        const sum = cards.reduce((acc, card) => acc + card.number, 0);
        return sum === 14;
    }

    // プレイタイプを判定し、PlayTypeクラスのインスタンスを返す
    returnPlayType() {
        if (this.cards.length === 0) {
            return new PlayType([PLAY_TYPES_LIST.CANNOT], null, this.cards.length, false, [], []);
        }
        const playTypes = [];
        const minCardNumber = this.cards[0].number;
        const jokerCount = this.cards.filter(card => card.suit === 'joker').length;
        const nonJokerCards = this.cards.filter(card => card.suit !== 'joker');



        if (PlayValidator.isSameRank(nonJokerCards,jokerCount)) {
            playTypes.push(PLAY_TYPES_LIST.SAME_RANK);
        }

        if (PlayValidator.isSameSuit(nonJokerCards,jokerCount)) {
            playTypes.push(PLAY_TYPES_LIST.SAME_SUIT);
        }

        if (PlayValidator.isJokerOnly(nonJokerCards,jokerCount)) {
            playTypes.push(PLAY_TYPES_LIST.JOKER_ONLY);
        }

        if (PlayValidator.isEmperor(nonJokerCards,jokerCount)) {
            playTypes.push(PLAY_TYPES_LIST.EMPEROR);
        }

        if (PlayValidator.isFOURTEEN(nonJokerCards,jokerCount)) {
            playTypes.push(PLAY_TYPES_LIST.FOURTEEN);
        }

        if (playTypes.length === 0) {
            return new PlayType([PLAY_TYPES_LIST.CANNOT], null, this.cards.length, false, [], []);
        }
        // スートを取得(jokerは含めない)
        const suits = this.cards.map(card => card.suit);
        console.log("suits are " + suits)
        return new PlayType(playTypes, minCardNumber, this.cards.length, false, [], suits);
    }
    

    canPlay(currentPlayType, playerId) {
        // 前回のプレイと比較
        if (!currentPlayType.canPlayAfter(this.gameMaster.playArea.playState.previousPlayType)) {
            return false;
        }
        // ターンプレイヤーの確認
        // const turnPlayer = this.gameBoard.getTurnPlayerId();
        // if (playerId !== turnPlayer) {
        //     return false;
        // }

        // プレイ可能であるときの処理
        return true;
    }
}

export async function handlePlay(playerId,gameMaster) {
    const hand = gameMaster.getPlayerHand(playerId);
    const playedCard = gameMaster.playArea.playedCard;
    const selectedCards = hand.getSelectedCards();
    const validator = new PlayValidator(selectedCards,gameMaster);
    const currentPlayType = validator.returnPlayType();
    
    if (validator.canPlay(currentPlayType, playerId)) {
        // カードをプレイエリアに移動するロジック
        hand.playSelectedCards(gameMaster, playedCard);

        if (hand.Cards.length === 0) {
            gameMaster.declareWinner(playerId);
            return;
        }
        // カード効果を実行
        const cardEffectManager = new CardEffectManager(gameMaster);
        const pendingEffectCards = playedCard.getPendingEffectCards();
        // gameBoard.updatePlayState(`${playerId}-select`);
        // toDo
        await cardEffectManager.applyEffect();
        gameMaster.updateAllCounts();

        // 縛り状態を表示
        gameMaster.playArea.playEffectRule.restriction.clearCards();
        console.log("currentPlayType.restriction is " + currentPlayType.restriction)
        if (currentPlayType.restriction.length > 0) {
            for (let i = 0; i < currentPlayType.restriction.length; i++) {
                const suit = currentPlayType.restriction[i];
                console.log(suit)
                const suitCard = new Card(suit,0,gameMaster.playArea.playEffectRule.restriction.parentElement);
                suitCard.element.setAttribute('class', 'suitCard');
                gameMaster.playArea.playEffectRule.restriction.addCard(suitCard);
            };
            gameMaster.playArea.playEffectRule.restriction.updateCardVisual();
        };

        // カード効果の適用後、エフェクト待ち状態のカードを通常状態に戻す
        selectedCards.forEach(card => {
            card.element.classList.remove('pendingEffect');
        });
        // previousPlayTypeを更新
        const updatedPreviousPlayType = currentPlayType.updatePreviousPlayType(gameMaster.playArea.playState.previousPlayType);
        gameMaster.playArea.playState.previousPlayType = updatedPreviousPlayType;
        // ターンプレイヤーを切り替える
        // gameMaster.updateTurnInfo();
        gameMaster.updateTurn();
    } else {
        alert('選択されたカードはプレイできません');
    }
}
