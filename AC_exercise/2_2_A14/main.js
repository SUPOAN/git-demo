//API網址：https://github.com/ALPHACamp/movie-list-api#show-movie

// 一開始會想宣告API的網址，以後若網址改變可以直接改變此參數即可。
const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "./api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";

//製作分頁器，一頁要顯示12個電影
const MOVIES_PER_PAGE = 12;

//建立一個空陣列
const movies = [];
let filteredMovies = [];
//宣告一個pages，為了讓分頁器可以抓取這個全域變數
let pages = 0
//抓去要render的地方
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");

//用font抓card跟table list的切換用。
const font = document.querySelector(".font")

//寫一個render用函式(用data)，讓除了movies陣列以外的陣列都可以使用，如果直接寫死movie之後要換清單資料庫，此函式就必須重寫，彈性太小，此為降低耦合性。
//盡量讓每個函式都只做一件事情就好！！！
function renderMovieList(data) {
  let rawHTML = "";

  data.forEach((item) => {
    //title, image
    rawHTML += `
            <div class="card col-sm-3">
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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id
      }">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  dataPanel.innerHTML = rawHTML;
}

//函式用來渲染成table list用。
function renderMovieTable(data) {
  let rawHTML = "";

  data.forEach((item) => {
    rawHTML += `

    <table class="table">
    <thead class="table-body">
    <tr>
    
    </tr>
  </thead>
  <tbody>
    <tr>
    <th scope="row">${item.title}</th>
      <td style="text-align:right;"><button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id
      }">+</button>
      </td>
    </tr>
  </tbody>
</table>
    
    
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

//寫一個渲染paginator的函式，不然bootstrap只是做一個三個分頁的模板。
function renderPaginator(amount) {
  //先看有幾部電影，12部電影放進一個分頁，總共需要幾個分頁，因為不足12部電影的也需要一個分頁，故利用ceil無條件進位。
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";

  for (let page = 1; page <= numberOfPage; page++) {
    //新增data-page="${page}"並且記得要綁在a超連結上面而不是li，此為下方要裝監聽器用。
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `;
  }

  paginator.innerHTML = rawHTML;
}

//寫出顯示一個分頁有12部電影的函式
function getMoviesByPage(page) {
  //page 1 -> movies 0 -11
  //page 2 -> movies 12-23
  //page 3 -> movies 24-35
  //...

  //接著思考如何去選出以上page頁數的movies範圍，並且利用slice切割出我們要的部分。
  //這裡的movies有兩種狀況，一種是一開始的所有電影movies必須被"分頁"，第二種狀況是我們進行search後，符合的電影filteredMovies必須被"分頁"。

  //以下寫法翻成白話：如果filteredMovies有東西，有就是使用者有做搜尋的動作，也有符合的項目，data就會被filteredMovies帶入，如果沒有東西(length=0)，就用原本的所有電影清單movies取代。
  const data = filteredMovies.length ? filteredMovies : movies;

  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

//抓取HTML中modal要根據不同id改的詳細資料區塊
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    //response.data.results
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release Date:" + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `
      <img src="${POSTER_URL + data.image
      }" class="img-fluid" alt="movie-poster">
    `;
  });
}

//寫出將喜愛清單存入localStorage的函式。
function addToFavorite(id) {
  //去跟localStorage要Item，如果沒有那就給我一個空陣列
  //必須用JSON.parse轉object或陣列
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];

  // //寫法一：傳統函式
  // //如果點擊的id和movies陣列裡面的id相符合，就抓出來
  // function isMovieIdMatched(movie) {
  //   return movie.id === id
  // }
  // //find()跟filter()用法類似，後面括號內必須要帶一個函式，所以在上面先寫出一個要帶入的function。它們的參數一樣都是一個條件函式、一樣會進去陣列裡面一一比對，不過find在找到第一個符合條件的item後就回停下來回傳該item。
  // const movie = movies.find(isMovieIdMatched)

  //寫法二：箭頭函式
  const movie = movies.find((movie) => movie.id === id);
  //預防同一部電影多次被加入localStorage
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }

  list.push(movie);
  console.log(list);

  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}


//========================以下開始掛監聽器===========================

//font掛監聽器，叫出table list，此外寫入切換規則，可在兩個圖示中切換card以及table list。
font.addEventListener("click", function onFontClicked(event) {
  //設定flow control，如果pages有東西，也就是已經有點過其他paginator分頁，pages變數會被event.target.dataset.page存入新數字，此時切換card和list則利用pages保有現在分頁。
  const data = pages ? pages : 1;
  if (event.target.matches(".tableList")) {
    renderMovieTable(getMoviesByPage(data));
  } else if (event.target.matches(".cardList")) {
    renderMovieList(getMoviesByPage(data));
  }

})


//掛監聽器的時候，使用傳統有命名的函式好處是debug的時候比較好用，出現error時去devtools看可以知道是哪個function出錯，相反的如果寫箭頭匿名函式，只會顯示匿名error，無法知道哪裡出錯。
dataPanel.addEventListener("click", function onPanelClicked(event) {
  //限制點擊處為More button。
  //為了讓點擊More button時抓到是點擊到哪部電影進而取得獨有的id可以取得詳細資訊放進modal，必須在渲染的時候將data-id="${item.id}也渲染進去，注意data-*這是dataset 在 HTML標籤上紀錄客製化的資訊，也就是在 HTML 標籤中定義 data-* 的屬性，這是固定式用法。
  if (event.target.matches(".btn-show-movie")) {
    //object裡面都會是字串，記得轉成數字。
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});



//在paginator掛監聽器
paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果點擊的不是a標籤就return，tagName會轉大寫，這是制式規則。
  if (event.target.tagName !== "A") {
    return;
  }
  //可以先試著點擊a標籤，觀察console.log(event.target.dataset.page)是否正確印出page頁數。
  // console.log(event.target.dataset.page)
  pages = event.target.dataset.page;

  //設計flow control，知道目前頁面到底上面是渲染card list還是table list，再根據不同狀況渲染。
  const card = document.querySelector(".card-body")
  const table = document.querySelector(".table-body")
  if (card !== null) {
    renderMovieList(getMoviesByPage(pages));
  } else if (table !== null) {
    renderMovieTable(getMoviesByPage(pages))
  }


});




//在搜尋處掛監聽器
searchForm.addEventListener("input", function onSearchFormSubmitted(event) {
  //為了讓瀏覽器不要做預設的動作，這裡是指重整網頁，我們不想要重整。event.preventDefault() 會請瀏覽器終止元件的預設行為，把控制權交給 JavaScript。
  event.preventDefault();
  // 為了讓輸入值不論大小寫都可以搜尋，加入trim()去預防空白情形。
  const keyword = searchInput.value.trim().toLowerCase();

  // 以下意思是，如果keyword沒有長度，0的布林值就是false，則跳出alert。但不寫的話按下空白可以列出全部清單
  // if (!keyword.length) {
  //   return alert("Please enter a valid string")
  // }

  // 把所有movies中的電影title檢查一遍看是否有包含輸入的keyword，有的話就加入filteredMovie新陣列
  //寫法一： 新用法 陣列操作三寶：map, filter, reduce
  //如果movies陣列中有符合filter後面的函式條件，則留下。
  filteredMovies = movies.filter((movies) =>
    movies.title.toLowerCase().includes(keyword)
  );

  //寫法二：for loop
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  if (filteredMovies.length === 0) {
    return alert("Cannot find movies with keyword: " + keyword);
  }

  renderPaginator(filteredMovies.length);


  //以下也是為了搜尋可以在card跟table list之間維持用
  const card = document.querySelector(".card-body")
  const table = document.querySelector(".table-body")
  if (card !== null) {
    renderMovieList(getMoviesByPage(1));
  } else if (table !== null) {
    renderMovieTable(getMoviesByPage(1))
  }

});





//用axios請求API response，response.data是資料，response.status:200是回傳成功的狀態(4或5開頭是錯誤)，
axios.get(INDEX_URL).then((response) => {
  let results = response.data.results;
  //方法一：把陣列裡的東西一個一個抓出來push進movies。
  // results.forEach(result => {
  //   movies.push(result)
  // });

  //方法二：利用展開陣列直接一個一個展開push，簡單好用！
  movies.push(...results);
  renderPaginator(movies.length);
  //之後會根據渲染而改變分頁進而改變顯示的12部電影。
  renderMovieList(getMoviesByPage(1));
  // renderMovieTable(getMoviesByPage(1));
});
