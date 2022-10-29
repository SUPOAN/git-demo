//練習運用MVC(Model, View, Controller)架構來分類程式碼
//定義遊戲的狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished"
}


//在設計程式碼時，如果要同時思考花色、又要考慮數字大小，程式碼會相對複雜。52張牌，因此我們會直接用 0-51 來進行換算，意即：
// 0 - 12：黑桃 1 - 13
// 13 - 25：愛心 1 - 13
// 26 - 38：方塊 1 - 13
// 39 - 51：梅花 1 - 13

//製作花色圖片，此處Symbols常數儲存的資料不會變動，因此習慣上將首字母大寫以表示此特性。
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

//宣告一個view物件，裡面放函式。
const view = {
  getCardContent(index) {
    //卡片的數字計算
    const number = this.transformNumber((index % 13) + 1)
    //卡片的花色選取，取整數。
    const symbol = Symbols[Math.floor(index / 13)]
    //一開始是牌的背面，所以class加入back的屬性
    return `
    <div class="card">
      <p>${number}</p>
      <img src="${symbol}" alt="">
      <p>${number}</p>
    </div>
    `
  },
  getCardElement(index) {
    //只回傳牌的背面，另外綁定data-index，可以在點擊的同時得知index的數字
    return `
      <div data-index="${index}" class="card back">
    </div>
    `
  },

  //考慮到撲克牌中 11、12、13 與 數字 1 在卡牌上的呈現應為 J、Q、K 與 A，讓我們再新增一個 transformNumber 函式來處理數字轉換的問題。
  transformNumber(number) {
    switch (number) {
      case 1:
        return "A"
      case 11:
        return "J"
      case 12:
        return "Q"
      case 13:
        return "K"
      default:
        return number
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector("#cards")
    //利用ES6特有的Array.from(Array(52).keys())來產生一個連續數字0~51的陣列
    //用map迭代陣列，一個一個依序將數字丟進view.getCardElement()，變成有 52 張卡片的陣列。map類似forEach，最大的差別是map不會產生新的陣列並且會return，forEach會修改原本的陣列並且不會回傳任何東西。
    //接著要用 join("") 把陣列合併成一個大字串，才能當成 HTML template 來使用；
    //把組合好的 template 用 innerHTML 放進 #cards 元素裡。
    // rootElement.innerHTML = Array.from(Array(52).keys()).map(index => this.getCardElement(index)).join("")
    //把按照順序的52張牌替換成隨機順序的52張牌
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("")
    //這裡的this指的是view本身，也可以寫成view.getCardElement() 
  },


  //一開始只能接受一個參數flipCard(card)
  //flipCards(1,2,3,4,5)
  //cards = [1,2,3,4,5]
  flipCards(...cards) {
    cards.map(card => {
      //如果原本是背面
      if (card.classList.contains("back")) {
        //要回傳正面
        card.classList.remove("back")
        //翻開的index用card.dataset.index去取。記得此時取出是字串，要強制轉乘Number
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      //如果原本是正面，就把背面屬性加回去，回傳背面
      card.classList.add("back")
      //去除牌點的內容
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add("paired")
    })
  },

  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add("wrong")
      //這個函式裡會為卡片加入 .wrong 類別，一旦加入就會開始跑動畫。另外我們用事件監聽器來綁定「動畫結束事件 (animationend)」，一旦動畫跑完一輪，就把 .wrong 這個 class 拿掉。最後的 { once: true } 是要求在事件執行一次之後，就要卸載這個監聽器。因為同一張卡片可能會被點錯好幾次，每一次都需要動態地掛上一個新的監聽器，並且用完就要卸載。
      card.addEventListener("animationend", event => {
        event.target.classList.remove("wrong"), { once: true }
      })
    })
  },

  //結束畫面
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <img src='https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png'>
      <img src='https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png'>
      <div>
        <p>Complete!</p>
        <p>Score: ${model.score}</p>
        <p>You've tried: ${model.triedTimes} times</p>
      </div>
      <img src='https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png'>
      <img src='https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png'>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

//寫出洗牌機制，這個機制比較無法歸類，姑且先放在外面像個外掛函式庫
const utility = {
  getRandomNumberArray(count) {
    //想要的效果：count = 5 => [2 ,3 ,4 ,1 ,0]

    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}



//設定Controller，設定狀態，並且view內的功能也要由Controller來統一發派
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  //除了用controller呼叫view，也避免view直接和utility接觸。
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  //依照不同的遊戲狀態，做不同的行為
  dispatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return
    }
    //用switch的寫法取代if/else會更簡潔
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        //render嘗試的次數
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)

        if (model.isRevealedCardsMatched()) {
          //render答對加10分
          view.renderScore((model.score += 10))
          //配對正確，用pairCard改變顏色，不走flipCard就會維持翻開。
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          //清空
          model.revealedCards = []
          //判斷分數是否達260
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          //配對成功以後要把狀態切換回去最開始
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          //呼叫view秀出配對失敗動畫
          view.appendWrongAnimation(...model.revealedCards)
          //翻開配對失敗時，必須要有時間讓使用者記憶牌的點數，1000是一秒。
          //setTimeout的第一個參數是要寫入函式本身，並不是呼叫此函式！不能寫成this.resetCards()
          setTimeout(this.resetCards, 1000)
        }

        console.log(model.isRevealedCardsMatched())
        break


    }
    console.log("current state:", this.currentState)
    console.log("revealed cards:", model.revealedCards.map(card => card.dataset.index))
  },

  //把reset單獨拉出來寫一個函式
  resetCards() {
    //用flipCard翻回去。
    view.flipCards(...model.revealedCards)
    //清空暫存區
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }

}


//設定Model，要知道現在翻開的牌是哪兩張
const model = {
  revealedCards: [],

  isRevealedCardsMatched() {
    //寫出翻開兩張牌的數字一樣的條件，如此會回傳一個布林值，可以在controller裡去設計if/else流程。
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,

  triedTimes: 0


}









controller.generateCards()

//Node List(array-like but not an array)
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", event => {
    controller.dispatchCardAction(card)
    // view.appendWrongAnimation(card)
  })

})


