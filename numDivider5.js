'use strict';
const content = document.getElementById("content");
const gameArea = document.getElementById("game-area");
const commentArea = document.getElementById("comment-area");
const indicateArea = document.getElementById("indicate-area");
const largeNumArea = document.getElementById("largeNum-area");
const timerArea = document.getElementById("timer-area");
const pointArea = document.getElementById("point-area");
const choiceDiv = document.getElementById("choiceDiv");
let questionArea, choiceID, tweetArea;//あとでDOM生成する場所
let startTime, endTime, idNum, num, answer, mod, next,
    questionNum, timer, level, intervalAnime, word;
let choiceButtonArr = [];
let questionArr = [];
let objArr = [];
let point = 0;
let opacity = 0;



let game1 = {
    name: "初級",                  //初級
    setTime: 20,                   //制限時間
    choiceArr: [2, 3, 4, 5, 6, 7, 8, 9],  //選択肢
    min: 11,                      //出題最小値
    max: 99,                      //出題最大値
    point: 1.25,                  //採点時の評価倍数                       
}

let game2 = {
    name: "中級",
    setTime: 20,
    choiceArr: [2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 17, 19],
    min: 21,
    max: 199,
    point: 1,
}

let game3 = {
    name: "上級",
    setTime: 20,
    choiceArr: [2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 17, 19, 23, 29, 31],
    min: 101,
    max: 999,
    point: 0.75,
}

/**
 * ゲームレベルを選択する関数
 */
function gameLevel(element) {
    switch (element.value) {
        case "1":
            level = game1;
            break;
        case "2":
            level = game2;
            break;
        case "3":
            level = game3;
            break;
    }
}

/**
 * 子要素を全て削除する
 */
function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}


/**
 * ゲーム開始(レベルボタンクリック時に実行)
 */
function gameApear(element) {
    gameLevel(element);           //ゲームレベルを選択
    removeAllChildren(gameArea);  //gameAreaの子要素を削除
    choiceApear(level);           //選択肢を表示
    nextQ(level);                 //出題
    startTime = new Date();　　　　//タイマースタート
}

/**
 * ゲームレベルに応じたゲーム画面を生成
 */
function choiceApear(obj) {
    timer = setInterval(countDown, 10, level);//残り時間を表示
    commentArea.innerText = "さてこの数、割れる？割れない？";
    pointArea.innerText = "0pt";
    const question = document.createElement('p');
    question.id = "question";
    largeNumArea.appendChild(question);
    questionArea = document.getElementById("question");
    const choiceDiv = document.createElement('div');
    choiceDiv.id = "choiceDiv";
    gameArea.appendChild(choiceDiv);

    //ノーマル選択肢ボタンを配列に格納
    for (let i = 0; i < obj.choiceArr.length; i++) {
        //素数だボタンをchoice0にしたいので、IDは1からスタート   
        let choiceButton =
            `<button 
            id = "choice${i + 1}"  
            value ="${obj.choiceArr[i]}"  
            class = "beforeChoice choice" 
            onclick="clickAnyButton(this)">
            ${obj.choiceArr[i]}
            </button>`;
        choiceButtonArr.push(choiceButton);
    }

    //素数選択肢ボタンを配列に格納
    let primeButton =
        `<button 
        id = "choice0" 
        value = "0"; 
        class = "beforeChoice choice" 
        onclick="clickAnyButton(this)">素数だ！
        </button>`;
    choiceButtonArr.push(primeButton);

    //選択肢配列があるかぎりボタンを表示
    for (let item of choiceButtonArr) {
        choiceDiv.insertAdjacentHTML("beforeend", item);
    }
}

/**
 * カウントダウン関数
 * 指定の秒数からカウントダウンして、残り0秒になったら、
 * 指定した関数を実行する
 */
function countDown(obj) {
    endTime = obj.setTime - ((new Date() - startTime) / 1000);
    endTime = Math.round(endTime * 100) / 100;
    if (endTime < 0) {
        clearTimeout(next);　//次の出題をキャンセル
        resultAnnounce();    //結果発表へ
    } else {
        timerArea.innerText = endTime.toFixed(2);//残り時間表示
    }
}

/**
 * 次の問題へ関数
 */
function nextQ(obj) {
    let numRange = obj.max + 1 - obj.min;
    questionNum = Math.floor(Math.random() * numRange) + obj.min;
    questionArea.innerText = questionNum;
    resetClassName();//選択肢のクラス名を元に戻す関数を実行
    animeStart();//数字をふわっと出す
}

/**
 * 問題の数字をふわっと出すアニメーション
 */
function textAnime() {
    opacity += 0.1;
    questionArea.style.color = `rgba(0,0,0,${opacity})`;
    if (opacity >= 1) {
        clearInterval(intervalAnime);
        opacity = 0;
    }
}
function animeStart() {
    questionArea.style.color = "rgba(0,0,0,0)";
    intervalAnime = setInterval(textAnime, 20);
}

/**
 * 全ての選択肢ボタンのクラス名を元に戻す
 */
function resetClassName() {
    for (let i = 0; i <= level.choiceArr.length; i++) {
        idNum = `choice${i}`;
        choiceID = document.getElementById(idNum);
        choiceID.className = "beforeChoice choice";
    }
}

/**
 * ボタンを押したときの処理
 */
function clickAnyButton(element) { //html側に設定してある
    //押下ボタンの正誤判定
    let buttonValue = Number(element.value);
    //押したボタンのvalueを取得
    if (prime(questionNum) === true && buttonValue === 0) {
        //出題が素数で、押下ボタンも素数なら
        //soundCorrect.play();        //正解音を鳴らす
        timeAdd();                  //制限時間をプラス
        point += Math.floor(Math.sqrt(questionNum));
    } else if (questionNum % buttonValue === 0) {
        //割れたら＝正解なら
        //soundCorrect.play();        //正解音を鳴らす
        point = point + buttonValue;//押下ボタンの数値を加点
    } else {
        //soundIncorrect.play();      //誤答音を鳴らす
    }

    answerCheck();　//選択肢ボタンの正誤判定
    disable();      //連打防止
    element.classList.add("selected");
    pointArea.innerText = `${point}pt`;     //ポイントを表示
    next = setTimeout(nextQ, 1000, level);//1秒後に次の出題
}

/**
 * 選択肢ボタンの正誤判定
 */
function answerCheck() {
    //ノーマル選択肢のチェック
    for (let i = 1; i <= level.choiceArr.length; i++) {
        idNum = `choice${i}`;
        choiceID = document.getElementById(idNum);
        let divider = choiceID.value;
        if (questionNum % divider === 0) {
            choiceID.className = "answer correct choice";
        } else {
            choiceID.className = "answer incorrect choice";
        }
    }
    //素数部分のチェック
    const primeChoice = document.getElementById("choice0");
    let flg = 0;
    for (let i = 0; i < level.choiceArr.length; i++) {
        if (questionNum % level.choiceArr[i] === 0) {
            flg = 0
            break;
        } else {
            flg = 1;
        }
    }
    if (flg === 0) { //割れたら
        primeChoice.className = "answer incorrect choice";
    } else {         //割れなかったら　=　素数だったら
        primeChoice.className = "answer correct choice";
    }
}

/**
 * 1秒間、クリックできないようにする
 */
function disable() {
    for (let i = 0; i < level.choiceArr.length + 1; i++) {
        idNum = `choice${i}`;
        choiceID = document.getElementById(idNum);
        choiceID.classList.add("isDisable");
    }
}

/**
 * 素数判定する関数
 */
function prime(num) {
    if (num === 2 || num === 3) {
        return true;//2と3は特別に素数認定
    }
    let flg = 0;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
            return false;//割れたら素数じゃない
        } else {
            flg = 1;
        }
    }
    if (flg === 1) {
        return true;
    }
}

/**
 * 時間を増やす
 */
function timeAdd() {
    level.setTime += 5;
}

/**
 * 結果発表
 */
function resultAnnounce() {
    clearInterval(intervalAnime);
    clearInterval(timer);
    removeAllChildren(content);
    const resultLevel = document.createElement("p");
    resultLevel.id = "resultLevel";
    resultLevel.innerText = level.name;
    content.appendChild(resultLevel);
    const resultPoint = document.createElement("p");
    resultPoint.id = "resultPoint";
    resultPoint.innerHTML =
        `<span class="result-point">${point}</span>pt`;
    content.appendChild(resultPoint);

    if (level.point * point < 30) {
        word = "まだまだですね。";
    } else if (level.point * point < 100) {
        word = "それなりですね。";
    } else {
        word = "すごい！";
    }

    const resultComment = document.createElement("p");
    resultComment.id = "resultComment";
    resultComment.innerText = word;
    content.appendChild(resultComment);

    const tweetDiv = document.createElement('div');
    tweetDiv.id = "tweet-area";
    content.appendChild(tweetDiv);
    tweetArea = document.getElementById("tweet-area")
    tweet();

    const retry = document.createElement("p");
    retry.setAttribute(
        "onclick", "window.location.reload();");
    retry.className = "retry";
    retry.innerText = "もう一回";
    content.appendChild(retry);
    /*
       const checkAnswer = document.createElement("p");
            checkAnswer.setAttribute("onclick", "appearAnswer();");
            checkAnswer.id = "checkAnswer";
            checkAnswer.innerText = "答えを見る";
            content.appendChild(checkAnswer);
    */
}

/**
 * ツイートボタン
 */
// TODO ツイートエリアの作成
function tweet() {
    const anchor = document.createElement('a');
    const hrefValue =
        'https://twitter.com/intent/tweet?button_hashtag=' +
        encodeURIComponent('NumDivider') +
        '&ref_src=twsrc%5Etfw';
    anchor.setAttribute('href', hrefValue);
    anchor.className = 'twitter-hashtag-button';
    anchor.setAttribute(
        'data-text',
        `素数ゲーム<${level.name}>で${point}ptを獲得。${word}(https://mtmtp.github.io/NumDivider/)`
    );
    anchor.innerText = 'Tweet NumDivider';

    tweetArea.appendChild(anchor);
    const script = document.createElement('script');
    script.setAttribute(
        'src',
        'https://platform.twitter.com/widgets.js'
    );
    tweetArea.appendChild(script);
}



/*今後やることリスト

*/
