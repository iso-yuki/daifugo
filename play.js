import { CardEffectManager } from "./cardEffect.js";

const PLAY_TYPES_LIST = {
    SAME_RANK: 'same_rank',
    SAME_SUIT: 'same_suit',
    EMPEROR: 'emperor',
    FOURTEEN: 'fourteen',
    TWENTY: 'twenty',
    SPADE_THREE: 'spade_three',
    JOKER_ONLY: 'joker_only',
    CANNOT: 'cannot',
    START: 'start'
};


export class Played{
    constructor(cards){
        if (cards===undefined){
            this.setup();
            return;
        };
        this.cards = cards;
        this.suits = this.cards.map(card => card.suit);
        this.minCardOrder = this.getMinCardOrder(this.cards);
        this.maxCardOrder = this.getMaxCardOrder(this.cards);
        this.cardCount = this.cards.length;
        this.restrictionStair = false;
        this.new_suitsCount = { 'spade': 0, 'heart': 0, 'diamond': 0, 'club': 0 };
    }

    // 最初のターンのための初期化メソッド
    setup(){
        this.cards = [];
        this.suits = [];
        this.minCardOrder = 0;
        this.maxCardOrder = 0;
        this.cardCount = 0;
        this.playType = [
            PLAY_TYPES_LIST.SAME_RANK,
            PLAY_TYPES_LIST.SAME_SUIT,
            PLAY_TYPES_LIST.EMPEROR,
            PLAY_TYPES_LIST.FOURTEEN,
            PLAY_TYPES_LIST.TWENTY,
            PLAY_TYPES_LIST.SPADE_THREE,
            PLAY_TYPES_LIST.START
        ];
    }

    // プレイ可能かどうかを判定するメソッド 
    checkPlayable(gameMaster, playableType){
        this.gameMaster = gameMaster;
        this.playableType = playableType;
        this.previousPlayed   = this.gameMaster.playArea.playState.previousPlayed;
        this.previousPlayType = this.gameMaster.playArea.playState.previousPlayed.playType;
        const playType = [];
        // playTypeがともにSAME_RANKを含む場合
        if (this.playableType.includes(PLAY_TYPES_LIST.SAME_RANK) 
            && this.previousPlayType.includes(PLAY_TYPES_LIST.SAME_RANK)) {

            let conditions = [
                this.checkCardCount(),        // カードの枚数が同じか確認
                this.checkMinCardNumber(),    // カードの最小値の確認
                this.checkSuitRestriction(),  // マーク縛りの確認
                this.checkStairRestriction()  // 階段縛りの確認
            ];

            // 全ての条件が満たされている場合
            if (conditions.every(condition => condition)) {
                playType.push(PLAY_TYPES_LIST.SAME_RANK);
            }
        }

        // playTypeがともにSAME_SUITを含む場合
        if (this.playableType.includes(PLAY_TYPES_LIST.SAME_SUIT) 
            && this.previousPlayType.includes(PLAY_TYPES_LIST.SAME_SUIT)) {
            
            let conditions = [
                this.checkCardCount(),        // カードの枚数が同じか確認
                this.checkMinCardNumber(),    // カードの最小値の確認
                this.checkSuitRestriction(),  // マーク縛りの確認
                this.checkStairRestriction()  // 階段縛りの確認
            ];

            // 全ての条件が満たされている場合
            if (conditions.every(condition => condition)) {
                playType.push(PLAY_TYPES_LIST.SAME_SUIT);
            }
        }

        // playTypeがともにEMPERORを含む場合
        if (this.playableType.includes(PLAY_TYPES_LIST.EMPEROR) 
            && this.previousPlayType.includes(PLAY_TYPES_LIST.EMPEROR)) {
            
            let conditions = [
                this.checkCardCount(),        // カードの枚数が同じか確認
                this.checkMinCardNumber(),    // カードの最小値の確認
                this.checkSuitRestriction(),  // マーク縛りの確認
                this.checkStairRestriction()  // 階段縛りの確認
            ];

            // 全ての条件が満たされている場合
            if (conditions.every(condition => condition)) {
                playType.push(PLAY_TYPES_LIST.EMPEROR);
            }
        }

        // playTypeがともにFOURTEENを含む場合
        if (this.playableType.includes(PLAY_TYPES_LIST.FOURTEEN) 
            && this.previousPlayType.includes(PLAY_TYPES_LIST.FOURTEEN)) {
            
            let conditions = [
                this.checkCardCount(),        // カードの枚数が同じか確認
                this.checkSuitRestriction(),  // マーク縛りの確認
                this.checkFourteenWithElevenBack() // 11バックの確認
            ];

            // 全ての条件が満たされている場合
            if (conditions.every(condition => condition)) {
                playType.push(PLAY_TYPES_LIST.FOURTEEN);
            }
        }

        // playTypeがTWENTYを含む場合
        if (this.playableType.includes(PLAY_TYPES_LIST.TWENTY)){
            let conditions = [
                this.checkTwenty()
            ];

            // 全ての条件が満たされている場合
            if (conditions.every(condition => condition)) {
                playType.push(PLAY_TYPES_LIST.TWENTY);
            }
        }

        // playTypeがSPADE_THREEを含む場合
        if (this.playableType.includes(PLAY_TYPES_LIST.SPADE_THREE)){
            let conditions = [
                this.checkSpadeThree()
            ];

            // 全ての条件が満たされている場合
            if (conditions.every(condition => condition)) {
                playType.push(PLAY_TYPES_LIST.SPADE_THREE);
            }
        }

        // playTypeがJOKER_ONLYを含む場合
        if (this.playableType.includes(PLAY_TYPES_LIST.JOKER_ONLY)){
            let conditions = [
                this.checkCardCount(),        // カードの枚数が同じか確認
            ];

            // 全ての条件が満たされている場合
            if (conditions.every(condition => condition)) {
                playType.push(PLAY_TYPES_LIST.JOKER_ONLY);
            }
        }

        this.playType = playType;
        console.log("playType", playType);
        return playType;
    }

    checkCardCount(){
        if (this.previousPlayType.includes(PLAY_TYPES_LIST.START)) return true;
        if (this.cardCount === this.previousPlayed.cardCount){
            return true;
        } else {
            console.log("card count failed");
            return false;
        }
    }

    checkMinCardNumber(){
        if (this.previousPlayType.includes(PLAY_TYPES_LIST.START)) return true;        
        if (this.gameMaster.playArea.playEffectRule.reverseStrength){
            // 強さが逆転している場合
            if (this.maxCardOrder < this.previousPlayed.maxCardOrder) return true;
        } else {
            // 強さが逆転していない場合
            if (this.minCardOrder > this.previousPlayed.minCardOrder) return true;
        }
        console.log("min card number failed");
        return false;
    }

    // マーク縛りの確認 要実装
    checkSuitRestriction(){

        // 前回のプレイがスタートの場合はtrue
        
        if (this.previousPlayType.includes(PLAY_TYPES_LIST.START)) return true;
        
        const suitsCount = this.gameMaster.playArea.playEffectRule.restrictionSuit.suitsCount;
        let jokerCount = this.suits.filter(suit => suit === 'joker').length;
        const previousSuits = this.previousPlayed.suits;
        const havingSuits = this.suits.filter(suit => suit !== 'joker');
        const restrictionSuits = [];

        console.log("suitsCount", suitsCount);
        console.log("jokerCount", jokerCount);
        console.log("previousSuits", previousSuits);
        console.log("havingSuits", havingSuits);
        

        // 縛りがある場合は前回のプレイと比較
        for (let suit in suitsCount) {
            let count = suitsCount[suit];
            for (let i = 0; i < count; i++) {
                if (havingSuits.includes(suit)){
                    havingSuits.splice(havingSuits.indexOf(suit), 1);
                    previousSuits.splice(previousSuits.indexOf(suit), 1);
                    restrictionSuits.push(suit);
                } else if (jokerCount > 0){
                    jokerCount -= 1;
                    previousSuits.splice(previousSuits.indexOf(suit), 1);
                    restrictionSuits.push(suit);
                } else {
                    console.log(suit + " is not found in cards.");
                    return false;
                }
                console.log(suit);
            }
        }

        // 新たな縛りがある場合は縛りを更新
        for (let suit of previousSuits){
            if (havingSuits.includes(suit)){
                havingSuits.splice(havingSuits.indexOf(suit), 1);
                restrictionSuits.push(suit);
            }
        }
        console.log("restrictionSuits", restrictionSuits);
        // restrictionSuits内の各suitの数をカウント
        for (let suit of restrictionSuits){
            this.new_suitsCount[suit] += 1;
        }

        return true;
    }

    checkStairRestriction(){
        
        if (this.previousPlayType.includes(PLAY_TYPES_LIST.START)) return true; 
        // 階段縛りになるか確認
        if (this.minCardOrder - this.previousPlayed.minCardOrder === 1){
            this.restrictionStair = true;   
            return true;
        }
        if (this.gameMaster.playArea.playEffectRule.restrictionStair === false) return true;
        //前回のminCardNumberと今回のminCardNumberを比較し１つ大きければtrue
        return this.minCardNumber - this.previousPlayed.minCardNumber === 1;
    }

    checkFourteenWithElevenBack(){
        if (this.gameMaster.playArea.playEffectRule.elevenActivated === false) return true;
        if (this.minCardNumber < 11){
            return true;
        } else {
            console.log("When eleven back is activated, you can't play fourteen with 11 or higher.");
            return false;
        }
    }

    checkTwenty(){
        //今回のカードの合計値を計算
        let total = 0;
        for (const card of this.cards){
            total += card.number;
        }
        if (total === 20){
            return true;
        } else if (this.previousPlayType.includes(PLAY_TYPES_LIST.TWENTY)){
            //20からtotalの値を引いた数字のカードをthis.previousPlayed.cardsから探す
            let searchNumber = 20 - total;
            //this.previousPlayed.cardsから.numberがsearchNumberのカードを探す
            console.log("searchNumber", searchNumber);
            let searchCard = this.previousPlayed.cards.find(card => card.number === searchNumber);
            console.log("searchCard", searchCard);
            if (searchCard){
                this.cards.push(searchCard);
                return true;
            } else {
                console.log(searchNumber + " is not found in previous cards.");
                return false;
            }
        } else {
            console.log("The total number of cards is not 20.");
            return false;
        }
    }

    checkSpadeThree(){
        // 前回がジョーカー１枚の場合はプレイ可能
        if (!(this.previousPlayed.cardCount === 1 && this.previousPlayed.cards[0].suit === 'joker')) return false;
        // 今回がスペード３一枚だけの場合はプレイ可能
        if (this.cardCount === 1 && this.cards[0].suit === 'spade' && this.cards[0].number === 3) return true;
    }

    getMinCardOrder(cards){
        return Math.min(...cards.map(card => card.order))
    }

    getMaxCardOrder(cards){
        return Math.max(...cards.map(card => card.order))
    }

}

// プレイ可能なカードタイプの配列を返すクラス
class ReturnSelectedPlayableType{
    constructor(cards){
        this.cards = cards;
        this.jokerCount = this.cards.filter(card => card.suit === 'joker').length;
        this.nonJokerCards = this.cards.filter(card => card.suit !== 'joker');
        this.jokerCards = this.cards.filter(card => card.suit === 'joker');
        this.cardCount = this.cards.length;
        this.playableType = [];
    }

    checkPlayableType(){
        // 最低でも1枚以上のカードが必要
        if (this.cardCount === 0){
            this.playableType.push(PLAY_TYPES_LIST.CANNOT);
            return;
        }
        // 同じランクのカードがあるかどうか
        if (this.checkSameRank()){
            this.playableType.push(PLAY_TYPES_LIST.SAME_RANK);
        }
        // 同じスートのカードがあるかどうか
        if (this.checkSameSuit()){
            this.playableType.push(PLAY_TYPES_LIST.SAME_SUIT);
        }
        // エンペラーがあるかどうか
        if (this.checkEmperor()){
            this.playableType.push(PLAY_TYPES_LIST.EMPEROR);
        }
        // 14があるかどうか
        if (this.checkFourteen()){
            this.playableType.push(PLAY_TYPES_LIST.FOURTEEN);
        }
        // 20があるかどうか
        if (this.checkTwenty()){
            this.playableType.push(PLAY_TYPES_LIST.TWENTY);
        }
        // スペード3単体かどうか
        if (this.checkSpadeThree()){
            this.playableType.push(PLAY_TYPES_LIST.SPADE_THREE);
        }
        // ジョーカーのみかどうか
        if (this.checkJokerOnly()){
            this.playableType.push(PLAY_TYPES_LIST.JOKER_ONLY);
        }
    }

    getPlayableType(){
        return this.playableType;
    }

    checkSameRank(){
        if (this.nonJokerCards.length === 0 && this.jokerCount > 0) return true;
        // 最初のカードの .number を基準とする
        const firstNumber = this.nonJokerCards[0].number;
        // すべてのカードの .number が最初のカードと一致するか確認
        return this.nonJokerCards.every(card => card.number === firstNumber);
    }

    checkSameSuit(){
        // 最低でも3枚以上のカードが必要
        if (this.cardCount < 3) return false;
        // 最初のカードの .suit を基準とする
        const firstSuit = this.nonJokerCards[0].suit;
        // すべてのカードの .suit が最初のカードと一致するか確認
        if (!this.nonJokerCards.every(card => card.suit === firstSuit)) return false;
        // ジョーカーを使って連番になっているか確認
        const order = {'3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6, '9': 7, '10': 8, '11': 9, '12': 10, '13': 11, '1': 12, '2': 13};
        for (let i = 0; i < this.nonJokerCards.length - 1; i++) {
            // 連番の判定
            const currentOrder = order[this.nonJokerCards[i].number];
            const nextOrder = order[this.nonJokerCards[i+1].number];
            const gap = nextOrder - currentOrder - 1;
            let usableJokerCount = this.jokerCount;

            if (gap > 0) {
                if (gap <= usableJokerCount) {
                    usableJokerCount -= gap; // 必要なジョーカーの数だけ減らす
                } else {
                    return false; // 連番の補完に必要なジョーカーが足りない場合
                }
            }
        }
        return true;
    }

    checkEmperor(){
        // エンペラーが含まれているか確認
        if (this.cards.length !== 4) return false; // 4枚でなければエンペラーではない

        // カードのスートを追跡するセットを作成
        const suits = new Set();
        // カードの数字を格納する配列を作成
        const ranks = [];

        // 各カードのスートと数字を確認
        for (const card of this.nonJokerCards) {
            suits.add(card.suit); // スートを追加
            ranks.push(card.number); // 数字を追加
            }

        // スートが4つ（ジョーカーが補完している場合も含む）かどうかを確認
        if (suits.size + this.jokerCount < 4) {
            return false; // 4つの異なるスートがない場合はエンペラーではない
        }

        // ジョーカーを使って連番になっているか確認
        const order = {'3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6, '9': 7, '10': 8, '11': 9, '12': 10, '13': 11, '1': 12, '2': 13};
        for (let i = 0; i < this.nonJokerCards.length - 1; i++) {
            // 連番の判定
            const currentOrder = order[this.nonJokerCards[i].number];
            const nextOrder = order[this.nonJokerCards[i+1].number];
            const gap = nextOrder - currentOrder - 1;
            const usableJokerCount = this.jokerCount;
            if (gap > 0) {
                if (gap <= usableJokerCount) {
                    usableJokerCount -= gap; // 必要なジョーカーの数だけ減らす
                } else {
                    return false; // 連番の補完に必要なジョーカーが足りない場合
                }
            }
        }

        return true; // 条件をすべて満たしている場合
    }

    checkFourteen(){
        if (this.cardCount !== 2) return false; // 2枚でなければ14ではない
        if (this.jokerCount > 0) return true; // ジョーカーがあれば14
        // 2枚のカードの数字の合計が14かどうか確認
        return this.nonJokerCards[0].number + this.nonJokerCards[1].number === 14;
    }

    checkTwenty(){
        if (this.jokerCount > 0) return false; // ジョーカーがあれば20ではない
        // 数字が3,4,5,1であるカードの数字の合計が20かどうか確認
        const numbers = this.nonJokerCards.map(card => card.number);
        const targetNumbers = [3, 4, 5, 1];
        const filteredNumbers = numbers.filter(num => targetNumbers.includes(num));
        const sum = filteredNumbers.reduce((acc, cur) => acc + cur, 0);
        //合計が15,16,17,19,20のいずれかであればtrue
        return [15, 16, 17, 19, 20].includes(sum);
    }

    checkSpadeThree(){
        if (this.jokerCount > 0) return false; // ジョーカーがあればスペード3ではない
        // スペード3単体であるかどうか確認
        if (this.cardCount !== 1) return false; // 1枚でなければスペード3ではない
        return this.nonJokerCards[0].suit === 'spade' && this.nonJokerCards[0].number === 3;
    }

    checkJokerOnly(){
        if (this.jokerCount === this.cardCount) return true;
    }
}

// プレイを実行する関数
export async function handlePlay(gameMaster){
    const cards = gameMaster.player[gameMaster.playArea.playState.turnPlayerId].hand.getSelectedCards();
    const selectedPlayableType = new ReturnSelectedPlayableType(cards);
    selectedPlayableType.checkPlayableType();
    const playableType = selectedPlayableType.getPlayableType();
    const played = new Played(cards);
    const playType = played.checkPlayable(gameMaster, playableType);
    if (playType.length > 0){
    // プレイ可能な場合の処理
        // カードをプレイエリアに移動するロジック
        const hand = gameMaster.player[gameMaster.playArea.playState.turnPlayerId].hand;
        hand.playSelectedCards(gameMaster);
        // previousPlayedを更新
        gameMaster.playArea.playState.previousPlayed = played;
        gameMaster.playArea.playEffectRule.restrictionSuit.suitsCount = played.new_suitsCount;
        gameMaster.playArea.playEffectRule.restrictionStair = played.restrictionStair;
        gameMaster.playArea.playEffectRule.updateIcons();
        gameMaster.playArea.playEffectRule.restrictionSuit.updateRestrictionSuits();
        console.log("previousPlayed", gameMaster.playArea.playState.previousPlayed.cards);
        // カード効果を実行
        const cardEffectManager = new CardEffectManager(gameMaster);
        await cardEffectManager.applyEffect();
        // 組カード効果を実行
        if (!playType.includes(PLAY_TYPES_LIST.TWENTY)){
            await cardEffectManager.applyCombinationEffect();
        }
        gameMaster.updateAllCounts();
        // ゲームマスターのターン情報を更新
        gameMaster.updateTurn();
    } else {
    // プレイ不可能な場合の処理
        console.log("You can't play these cards.");
    }
}
