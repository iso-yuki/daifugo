const Suit = {
    Club: 'club',
    Diamond: 'diamond',
    Heart: 'heart',
    Spade: 'spade',
    joker: 'joker',
};
const order = {
    '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6, '9': 7, '10': 8, '11': 9, '12': 10, '13': 11, '1': 12, '2': 13, '14': 14
};
// スートの順序を定義
const suitOrder = {
    'club': 1, 'diamond': 2, 'heart': 3, 'spade': 4
};

export class Card {
    constructor(suit, number, parentElement) {
        this.X = 0;
        this.Y = 0;
        this.number = number; // カードのランク
        this.suit = suit;     // カードのスート
        this.order = order[number]; // カードの順位

        this.parentElement = parentElement;

        this.element = document.createElement('div');
        this.element.style.position = 'absolute';
        this.element.style.left = this.X + 'px';
        this.element.style.top = this.Y + 'px';
        this.element.setAttribute('class', 'card');

        // 画像パスを構築
        let imagePath;
        if (suit === Suit.joker) {
            imagePath = 'images/card_joker.png'; // ジョーカーの画像パス
        } else {
            const imageName = `card_${suit}_${String(number).padStart(2, '0')}.png`;
            imagePath = `images/${imageName}`;
        }

        // カード画像を読み込んで設定
        const cardImage = new Image();
        cardImage.src = imagePath;
        cardImage.setAttribute('class', 'card-image');
        this.element.appendChild(cardImage);

        // 親要素にカード要素を追加
        this.parentElement.appendChild(this.element);

        // カードの位置を設定
        this.Move(this.X, this.Y);

        // カードのクリックイベントを設定
        this.element.addEventListener('click', () => {
            this.selectCard();
        });
    }

    // カードの移動メソッド
    Move(x, y) {
        if (x !== undefined) this.X = x;
        if (y !== undefined) this.Y = y;

        // カードを新しい位置に移動
        this.element.style.left = this.X + 'px';
        this.element.style.top = this.Y + 'px';
    }

    // カードの選択状態をトグルするメソッド
    selectCard() {
        const isSelected = this.element.classList.contains('selected');
        if (isSelected) {
            this.element.classList.remove('selected');
            this.Move(this.X, this.Y+10); // 元の位置に戻す
        } else {
            this.element.classList.add('selected');
            this.Move(this.X, this.Y - 10); // 少し上に移動
        }
    }

}

export class Cards {
    constructor(parentElement, countElement) {
        this.parentElement = parentElement;
        this.Cards = [];
        this.countElement = countElement;
        this.updateCardCount();
    }

    // カードをソートするメソッド
    sortCards() {
        // カードをソートする
        this.Cards.sort((a, b) => {
            if (a.suit === Suit.joker && b.suit !== Suit.joker) {
                return 1; // joker は最後に来る
            }
            if (b.suit === Suit.joker && a.suit !== Suit.joker) {
                return -1;
            }

            // ソートの順序に従って比較
            if (a.number === b.number) {
                return suitOrder[a.suit] - suitOrder[b.suit];
            }

            return a.order - b.order;
        });

        // カードの位置を更新
        this.updateCardVisual();

        // カードの選択状態を解除
        this.Cards.forEach(card => {
            card.element.classList.remove('selected');
        });
    }

    compareCardNumbers(number1, number2) {
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
    //カードをほかのCardsに渡す
    passCard(card,toHere){
        this.removeCard(card);
        toHere.addCard(card);
    }
    // カードを追加するメソッド
    addCard(card) {
        // カードの選択状態を解除
        card.element.classList.remove('selected');
        this.Cards.push(card);
        this.parentElement.appendChild(card.element);
        card.parentElement = this.parentElement;
        this.updateCardCount();
        this.updateCardVisual();
    }
    // カードを削除するメソッド
    removeCard(card) {
        const index = this.Cards.indexOf(card);
        if (index > -1) {
            this.Cards.splice(index, 1);
            this.parentElement.removeChild(card.element);
        }
        this.updateCardCount();
        this.updateCardVisual();
    }
    // カードの枚数を取得するメソッド
    getCardCount() {
        return this.Cards.length;
    }

    // カードの要素数表示を更新するメソッド
    updateCardCount() {
        this.countElement.textContent = this.getCardCount();
    }

    updateCardVisual(){
        return;
    }
}


export class Deck extends Cards {
    constructor(parentElement, countElement) {
        super(parentElement,countElement);
        this.updateCardCount();
    }
    // 山札の初期化メソッド
    InitCards() {
        this.Cards = [];

        // 各スートのカードを生成
        for (let number = 1; number <= 13; number++) {
            this.Cards.push(new Card(Suit.Spade, number, this.parentElement));
            this.Cards.push(new Card(Suit.Heart, number, this.parentElement));
            this.Cards.push(new Card(Suit.Diamond, number, this.parentElement));
            this.Cards.push(new Card(Suit.Club, number, this.parentElement));
        }

        // ジョーカーを2枚追加
        this.Cards.push(new Card(Suit.joker, 14, this.parentElement));
        this.Cards.push(new Card(Suit.joker, 14, this.parentElement));
        this.updateCardCount();
    }
    // 山札をシャッフルするメソッド
    shuffle() {
        for (let i = this.Cards.length - 1; i > 0; i--) {
            const r = Math.floor(Math.random() * (i + 1));
            [this.Cards[i], this.Cards[r]] = [this.Cards[r], this.Cards[i]];
        }
        this.updateCardCount();
    }

    // 手札にカードを配るメソッド
    deal(numOfCards) {
        const dealtCards = this.Cards.splice(0, numOfCards);
        this.updateCardCount();
        return dealtCards;
    }
}

export class Hand extends Cards {
    constructor(parentElement, countElement, playerId) {
        super(parentElement,countElement);
        this.parentElement = parentElement;
        this.playerId = playerId;
        this.updateCardVisual();
    }

    // 手札のエリアサイズとカードオフセットを更新するメソッド
    updateCardVisual() {
        const handWidth = this.parentElement.clientWidth;
        if (this.Cards.length === 0) {
            return;
        }
        const cardWidth = parseInt(getComputedStyle(this.Cards[0].element).width);
        const cardCount = this.Cards.length;
        const minShowWidth = cardWidth - 10;
        let showWidth = 0;
        

        if (cardCount === 1) {
            this.Cards[0].X = (handWidth - cardWidth) / 2;
            this.Cards[0].Y = 0;
            this.Cards[0].Move();
        } else if (cardCount === 0) {
            return;
        } else {
            showWidth = (handWidth - cardWidth) / (cardCount-1);
        }

        if (showWidth === 0) {
            return;
        } else if (showWidth > minShowWidth) {
            showWidth = minShowWidth;
            this.Cards.forEach((card, index) => {
                card.X = index * showWidth;
                card.Y = 0;
                card.Move();
                card.element.style.zIndex = index;
            });
        } else if (showWidth <= minShowWidth) {
            this.Cards.forEach((card, index) => {
                card.X = index * showWidth;
                card.Y = 0;
                card.Move();
                card.element.style.zIndex = index;
            });
        }

    }

    getSelectedCards() {
        // 選択されたカードをフィルタリング
        const selectedCards = this.Cards.filter(card => card.element.classList.contains('selected'));
        
        // 選択されたカードをソート
        selectedCards.sort((a, b) => {
            if (a.suit === Suit.joker && b.suit !== Suit.joker) {
                return 1; // joker は最後に来る
            }
            if (b.suit === Suit.joker && a.suit !== Suit.joker) {
                return -1;
            }

            // 数字で比較
            if (a.number === b.number) {
                return suitOrder[a.suit] - suitOrder[b.suit];
            }
            
            return order[a.number] - order[b.number];
        });
        return selectedCards;
    }

    // 選択されたカードをプレイエリアに移動させるメソッド
    playSelectedCards(gameMaster) {
        const selectedCards = this.getSelectedCards();
        selectedCards.forEach(card => {
            if (card.parentElement === this.parentElement) {
                this.removeCard(card); // 手札から削除
                gameMaster.playArea.playedCard.addCard(card); // プレイエリアに追加
                card.element.classList.remove('selected');
                card.element.classList.add('pendingEffect');
            }
        });
        gameMaster.playArea.playedCard.updateCardVisual();
        this.updateCardVisual();
        gameMaster.updateAllCounts();

    }
    
}

export class PlayedCard extends Cards {
    constructor(parentElement, countElement) {
        super(parentElement,countElement);
        this.parentElement = parentElement;
        this.updateCardVisual();
    }

    // 手札のエリアサイズとカードオフセットを更新するメソッド
    updateCardVisual() {
        this.Cards.forEach((card, index) => {
            card.Move(index * 20, 0);
            card.element.style.zIndex = index;
        });
    }

    getPendingEffectCards() {
        return this.Cards.filter(card => card.element.classList.contains('pendingEffect'));
    }

}

export class Trash extends Cards {
    constructor(parentElement, countElement) {
        super(parentElement,countElement);
        this.parentElement = parentElement;
    }

}
