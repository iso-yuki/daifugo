// cardEffect.js

export class CardEffectManager {
    constructor(gameMaster) {
        this.gameMaster = gameMaster;
        this.effectMap = {
            3: new ThreeEffect(gameMaster),
            4: new FourEffect(gameMaster),
            5: new FiveEffect(gameMaster),
            6: new SixEffect(gameMaster),
            7: new SevenEffect(gameMaster),
            8: new EightEffect(gameMaster),
            9: new NineEffect(gameMaster),
            10: new TenEffect(gameMaster),
            11: new ElevenEffect(gameMaster),
            12: new TwelveEffect(gameMaster),
            13: new ThirteenEffect(gameMaster),
            1: new OneEffect(gameMaster),
            2: new TwoEffect(gameMaster),
            14: new JokerEffect(gameMaster),
            // 他のカードの効果もここに追加
        };
    }

    async applyEffect() {
        // 効果が発動済みの数字を記録するセット
        const appliedEffects = new Set();
        const pendingEffectCards = this.gameMaster.playArea.playState.previousPlayed.cards;
    
        for (const card of pendingEffectCards) {
            const effect = this.effectMap[card.number];
            if (effect && !appliedEffects.has(card.number)) {
                this.gameMaster.playArea.turnInfoElement.textContent = `Player ${this.gameMaster.playArea.playState.turnPlayerId}'s turn: ${card.number} effect selecting...`;
                this.gameMaster.playArea.playState.currentPlayerStatus = 'selecting';
                this.gameMaster.player[this.gameMaster.playArea.playState.turnPlayerId].status = 'selecting';
                // 効果がまだ発動していない場合のみ適用
                await effect.applyEffect();
                // 効果が発動済みとして記録
                appliedEffects.add(card.number);
                this.gameMaster.playArea.playState.currentPlayerStatus = 'waiting';
                this.gameMaster.player[this.gameMaster.playArea.playState.turnPlayerId].status = 'waiting';
            }
        }
    }

    async applyCombinationEffect() {
        // プレイしたカードの枚数が３枚の時のみ効果を適用
        if (this.gameMaster.playArea.playState.previousPlayed.cards.length === 3) {
            this.gameMaster.playArea.turnInfoElement.textContent = `Player ${this.gameMaster.playArea.playState.turnPlayerId}'s turn: three combination effect selecting...`;
            const effect = new ThreeCombination(this.gameMaster);
            await effect.applyEffect();
        }
        // プレイしたカードの枚数が４枚の時のみ効果を適用
        if (this.gameMaster.playArea.playState.previousPlayed.cards.length === 4) {
            this.gameMaster.playArea.turnInfoElement.textContent = `Player ${this.gameMaster.playArea.playState.turnPlayerId}'s turn: four combination effect selecting...`;
            const effect = new FourCombination(this.gameMaster);
            await effect.applyEffect();
        }
        // プレイしたカードの枚数が５枚以上かつplayTypeがTwentyでないときのみ効果を適用
        if (this.gameMaster.playArea.playState.previousPlayed.cards.length >= 5 && this.gameMaster.playArea.playState.previousPlayed.playType !== 'Twenty') {
            this.gameMaster.playArea.turnInfoElement.textContent = `Player ${this.gameMaster.playArea.playState.turnPlayerId}'s turn: over four combination effect selecting...`;
            const effect = new FiveCombination(this.gameMaster);
            await effect.applyEffect();
        }
    }
}

class CardEffect {
    constructor(gameMaster) {
        this.gameMaster = gameMaster;
        this.Cards = this.gameMaster.playArea.playedCard.getPendingEffectCards();
        this.playerId = gameMaster.playArea.playState.turnPlayerId;
    }

    async applyEffect( ) {
        // 基本の効果（デフォルトは何もしない）
    }
}


class ThreeEffect extends CardEffect {
    async applyEffect( ) {
        const numberOfThrees = this.Cards.filter(card => card.number === 3).length;

        if (numberOfThrees > 0) {
            for (let i = 0; i < numberOfThrees; i++) {
                console.log("3の効果が発動しました。");
            }
        }
    }
}

class FourEffect extends CardEffect {
    async applyEffect( ) {
        const numberOfFours = this.Cards.filter(card => card.number === 4).length;

        if (numberOfFours > 0) {
            for (let i = 0; i < numberOfFours; i++) {
                console.log("4の効果が発動しました。");
            }
        }
    }
}

class FiveEffect extends CardEffect {
    async applyEffect( ) {
        const numberOfFives = this.Cards.filter(card => card.number === 5).length;

        if (numberOfFives > 0) {
            for (let i = 0; i < numberOfFives; i++) {
                console.log("5の効果が発動しました。");
            }
        }
    }
}

class SixEffect extends CardEffect {
    async applyEffect() {
        const numberOfSixes = this.Cards.filter(card => card.number === 6).length;

        if (numberOfSixes > 0) {
            // 相手の手札に追加する
            const opponentId = this.playerId === 1 ? 2 : 1;
            const opponentHand = this.gameMaster.player[opponentId].hand;
            const drawnCard = this.gameMaster.playArea.deck.deal(numberOfSixes);
            if (drawnCard) {
                drawnCard.forEach(card =>{
                    opponentHand.addCard(card);
                    opponentHand.sortCards();
                });
            } else {
                console.log("デッキにカードがありません。");
            }
        }
        console.log("6の効果が発動しました。");
    }
}

class SevenEffect extends CardEffect {
    // プレイヤーがカードを選択してSelectボタンを押すまで待機する
    async waitForPlayerSelection(player, maxSelectableCards) {
        return new Promise((resolve) => {
            const selectButton = player.selectButton;
            const onClick = () => {
                const selectedCards = player.hand.getSelectedCards();
                if (selectedCards.length > maxSelectableCards) {
                    alert(`選択されたカードが多すぎます。最大で ${maxSelectableCards} 枚選択してください。`);
                } else {
                    selectButton.removeEventListener('click', onClick);
                    resolve(selectedCards);
                }
            };
            selectButton.addEventListener('click', onClick);
        });
    }

    async applyEffect() {
        const numberOfSevens = this.Cards.filter(card => card.number === 7).length;

        if (numberOfSevens > 0) {
            // 自分の手札を取得
            const currentPlayer = this.gameMaster.player[this.playerId];
            const opponentId = this.playerId === 1 ? 2 : 1;
            const opponent = this.gameMaster.player[opponentId];

            // プレイヤーがカードを選択してSelectボタンを押すまで待機
            const selectedCards = await this.waitForPlayerSelection(currentPlayer, numberOfSevens);

            if (selectedCards.length === 0) {
                console.log("カードが選択されていません。効果は発動されません。");
                return;
            }

            // 相手にカードを渡す
            selectedCards.forEach(card => {
                card.element.classList.remove('selected');
                currentPlayer.hand.removeCard(card);
                opponent.hand.addCard(card);
                currentPlayer.hand.sortCards();
                opponent.hand.sortCards();

            });

            // 手札の枚数表示を更新
            this.gameMaster.updateAllCounts();

            console.log("7の効果が発動しました。");
        }
    }
}

class EightEffect extends CardEffect {
    async applyEffect() {
        const numberOfEights = this.Cards.filter(card => card.number === 8).length;

        if (numberOfEights > 0) {
            this.gameMaster.playArea.playEffectRule.eightActivated = true;
            console.log("8の効果が発動しました。");
        }
    }
}

class NineEffect extends CardEffect {
    async applyEffect() {
        const numberOfNines = this.Cards.filter(card => card.number === 9).length;

        if (numberOfNines > 0) {
            // 自分の手札からランダムに選び相手の手札に加える
            const playerHand = this.gameMaster.player[this.playerId].hand;
            const opponentId = this.playerId === 1 ? 2 : 1;
            const opponentHand = this.gameMaster.player[opponentId].hand;
            for (let i = 0; i < numberOfNines; i++) {
                const randomIndex = Math.floor(Math.random() * playerHand.Cards.length);
                const randomCard = playerHand.Cards[randomIndex];
                if (randomCard) {
                    playerHand.removeCard(randomCard);
                    opponentHand.addCard(randomCard);
                    playerHand.sortCards();
                    opponentHand.sortCards();
                }
            }
        }
    }
}

class TenEffect extends CardEffect {
    // プレイヤーがカードを選択してSelectボタンを押すまで待機する
    async waitForPlayerSelection(player, maxSelectableCards) {
        return new Promise((resolve) => {
            const selectButton = player.selectButton;
            const onClick = () => {
                const selectedCards = player.hand.getSelectedCards();
                if (selectedCards.length > maxSelectableCards) {
                    alert(`選択されたカードが多すぎます。最大で ${maxSelectableCards} 枚選択してください。`);
                } else {
                    selectButton.removeEventListener('click', onClick);
                    resolve(selectedCards);
                }
            };
            selectButton.addEventListener('click', onClick);
        });
    }

    async applyEffect() {
        const numberOfTens = this.Cards.filter(card => card.number === 10).length;

        if (numberOfTens > 0) {
            // 自分の手札を取得
            const player = this.gameMaster.player[this.playerId];
            const trash = this.gameMaster.playArea.trash;

            // プレイヤーがカードを選択してSelectボタンを押すまで待機
            const selectedCards = await this.waitForPlayerSelection(player, numberOfTens);

            if (selectedCards.length === 0) {
                console.log("カードが選択されていません。効果は発動されません。");
                return;
            }

            // 選択されたカードを捨て札に移動
            selectedCards.forEach(card => {
                card.element.classList.remove('selected');
                player.hand.removeCard(card);
                trash.addCard(card);
                player.hand.sortCards();
            });

            // 手札の枚数表示を更新
            this.gameMaster.updateAllCounts();

            console.log("10の効果が発動しました。");
        }
    }
}

class ElevenEffect extends CardEffect {
    async applyEffect() {
        const numberOfElevens = this.Cards.filter(card => card.number === 11).length;

        if (numberOfElevens > 0) {
            this.gameMaster.playArea.playEffectRule.elevenActivated = !this.gameMaster.playArea.playEffectRule.elevenActivated;
            this.gameMaster.playArea.playEffectRule.setReverseStrength();
            console.log("11の効果が発動しました。");
        }
    }
}

class TwelveEffect extends CardEffect {
    async applyEffect() {
        const numberOfTwelves = this.Cards.filter(card => card.number === 12).length;

        if (numberOfTwelves > 0) {
            for (let i = 0; i < numberOfTwelves; i++) {
                console.log("12の効果が発動しました。");
            }
        }
    }
}

class ThirteenEffect extends CardEffect {
    async applyEffect() {
        const numberOfThirteens = this.Cards.filter(card => card.number === 13).length;

        if (numberOfThirteens > 0) {
            for (let i = 0; i < numberOfThirteens; i++) {
                console.log("13の効果が発動しました。");
            }
        }
    }
}

class OneEffect extends CardEffect {
    async applyEffect() {
        const numberOfOnes = this.Cards.filter(card => card.number === 1).length;

        if (numberOfOnes > 0) {
            for (let i = 0; i < numberOfOnes; i++) {
                console.log("1の効果が発動しました。");
            }
        }
    }
}

class TwoEffect extends CardEffect {
    async applyEffect() {
        const numberOfTwos = this.Cards.filter(card => card.number === 2).length;

        if (numberOfTwos > 0) {
            const playerHand = this.gameMaster.player[this.playerId].hand;
            const drawnCard = this.gameMaster.playArea.deck.deal(numberOfTwos);
            
            if (drawnCard) {
                drawnCard.forEach(card =>{
                    playerHand.addCard(card);
                    playerHand.sortCards();
                });
            } else {
                console.log("デッキにカードがありません。");
            }

            // 手札の枚数表示を更新
            this.gameMaster.updateAllCounts();
        }
        console.log("2の効果が発動しました。");
    }
}

class JokerEffect extends CardEffect {
    async applyEffect() {
        const numberOfJokers = this.Cards.filter(card => card.number === 14).length;

        if (numberOfJokers > 0) {
            for (let i = 0; i < numberOfJokers; i++) {
                console.log("ジョーカーの効果が発動しました。");
            }
        }
    }
}

class ThreeCombination extends CardEffect {
    async waitForPlayerSelection(player) {
        return new Promise((resolve) => {
            const selectButton = player.selectButton;
            const onClick = () => {
                const selectedCards = player.hand.getSelectedCards();
                if (selectedCards.length > 1) {
                    alert(`選択されたカードが多すぎます。最大で1枚選択してください。`);
                } else {
                    selectButton.removeEventListener('click', onClick);
                    resolve(selectedCards);
                }
            };
            selectButton.addEventListener('click', onClick);
        });
    }

    async applyEffect() {
        // 自分の手札を取得
        const player = this.gameMaster.player[this.playerId];
        const trash = this.gameMaster.playArea.trash;

        // プレイヤーがカードを選択してSelectボタンを押すまで待機
        const selectedCards = await this.waitForPlayerSelection(player);

        if (selectedCards.length === 0) {
            console.log("カードが選択されていません。効果は発動されません。");
            return;
        }

        // 選択されたカードを捨て札に移動
        selectedCards.forEach(card => {
            card.element.classList.remove('selected');
            player.hand.removeCard(card);
            trash.addCard(card);
            player.hand.sortCards();
        });

        // 手札の枚数表示を更新
        this.gameMaster.updateAllCounts();

        console.log("3枚組の効果が発動しました。");
    
    }
}

class FourCombination extends CardEffect {
    async applyEffect() {
        this.gameMaster.playArea.playEffectRule.toggleRevolution();
        console.log("4枚組の効果が発動しました。");
    }
}

class FiveCombination extends CardEffect {
    async applyEffect() {
        this.gameMaster.playArea.playEffectRule.toggleRevolution();
        this.gameMaster.playArea.playEffectRule.toggleSuperRevolution();
        console.log("5枚組の効果が発動しました。");
    }
}