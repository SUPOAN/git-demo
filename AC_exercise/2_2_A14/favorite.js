//API網址：https://github.com/ALPHACamp/movie-list-api#show-movie

// 一開始會想宣告API的網址，以後若網址改變可以直接改變此參數即可。
const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "./api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
//建立一個空陣列
const movies = JSON.parse(localStorage.getItem('favoriteMovies'))
//抓去要render的地方=
const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
//寫一個render用函式(用data)，讓除了movies陣列以外的陣列都可以使用，如果直接寫死movie之後要換清單資料庫，此函式就必須重寫，彈性太小，此為降低耦合性。
//盡量讓每個函式都只做一件事情就好！！！
function renderMovieList(data) {
  let rawHTML = ""

  data.forEach(item => {
    //title, image
    rawHTML += `
            <div class="col-sm-3">
        <div class="mb-2">=
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })

  dataPanel.innerHTML = rawHTML
}

//抓取HTML中modal要根據不同id改的詳細資料區塊
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")

  axios.get(INDEX_URL + id).then(response => {
    //response.data.results
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = "Release Date:" + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `
      <img src="${POSTER_URL + data.image}" class="img-fluid" alt="movie-poster">
    `
  })
}

//利用findIndex()找出index位置，如果點擊的id跟movies裡頭一樣，就抓出index並且利用splice移除一個元素。
function removeFromFavorite(id) {
  //文字版課程有加入這段，目的是確認movies內有東西我才執行下方內容。
  //雖然不太可能發生，但還是可以先寫入一些極端狀況(運算思維)。
  if (!movies || !movies.length) return

  const movieIndex = movies.findIndex((movie) => movie.id === id)
  movies.splice(movieIndex, 1)
  localStorage.setItem("favoriteMovies", JSON.stringify(movies))
  //記得即時渲染進去，否則刪除favorite清單後都要重新整理才會移除。
  renderMovieList(movies)
}





//掛監聽器的時候，使用傳統有命名的函式好處是debug的時候比較好用，出現error時去devtools看可以知道是哪個function出錯，相反的如果寫箭頭匿名函式，只會顯示匿名error，無法知道哪裡出錯。
dataPanel.addEventListener("click", function onPanelClicked(event) {
  //限制點擊處為More button。
  //為了讓點擊More button時抓到是點擊到哪部電影進而取得獨有的id可以取得詳細資訊放進modal，必須在渲染的時候將data-id="${item.id}也渲染進去，注意data-*這是dataset 在 HTML標籤上紀錄客製化的資訊，也就是在 HTML 標籤中定義 data-* 的屬性，這是固定式用法。
  if (event.target.matches(".btn-show-movie")) {
    //object裡面都會是字串，記得轉成數字。

    //修改以下成移除電影
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})




renderMovieList(movies)




