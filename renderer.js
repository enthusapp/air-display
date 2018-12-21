var xhr = new XMLHttpRequest();

if (process.env.NODE_ENV === 'development') {
  xhr.open('GET', 'file:///1234');
} else {
  xhr.open('GET', 'https://s3.ap-northeast-2.amazonaws.com/enthusair/1234');
}

var time_result = document.getElementById('time_result');
var seoul = document.getElementById('seoul_result');
var jeju = document.getElementById('jeju_result');

function getRealTimeEachCity() {
  switch (state) {
    case "boot":
      clearInterval(interval);
      if (isFirstArrived) {
        interval = setInterval(getRealTimeEachCity, 1000 * 60 * 30);
        state = "30 min interval";
        console.log(state);
        return;
      } else {
        interval = setInterval(getRealTimeEachCity, 1000 * 30);
        state = "30 sec interval";
        console.log(state);
      }
    break;
    case "30 sec interval":
      if (isFirstArrived) {
        clearInterval(interval);
        interval = setInterval(getRealTimeEachCity, 1000 * 60 * 30);
        state = "30 min interval";
        console.log(state);
        return;
      }
    break;
    default:
    break;
  }

  if (!isFirstArrived)
    seoul.innerText = '데이터를 읽어오는 중입니다...';

  xhr.setRequestHeader("Cache-Control", "max-age=0");
  xhr.send();
}

function tagSels(doc, name) {
  return doc.getElementsByTagName(name);
}

function tagSel(doc, name) {
  return tagSels(doc, name)[0];
}

function getCoutList(val) {
  switch (val) {
  case 1:
    return {
      color: "green",
      msg: "좋음"};
  case 2:
    return {
      color: "orange",
      msg: "보통"};
  case 3:
    return {
      color: "red",
      msg: "나쁨"};
  case 4:
    return {
      color: "redpurple",
      msg: "매우 나쁨"};
  default:
    break;
  }
  return {
    color: "black",
    msg: "확인 안됨"};
}

xhr.onreadystatechange = function () {
  if (xhr.readyState === XMLHttpRequest.DONE) {
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      time_result.innerText = data['서울'].list[0].dataTime;
      showResult(seoul, data['서울'].list[0], '서울 중구');
      showResult(jeju, data['제주'].list[0], '제주 이도동');
      /*
      document.getElementById('body').style.backgroundColor =
        getCoutList(Math.max(pm10Grade1h, pm25Grade1h)).color;*/
      isFirstArrived = true;
    } else {
      console.log('[' + xhr.status + ']: ' + xhr.statusText);
    }
  }
};

function showResult(node, data, name) {
  var result = name;
  var pm10Grade1h = parseInt(data['pm10Grade1h']);
  var pm25Grade1h = parseInt(data['pm25Grade1h']);

  result += `, 미세: ${data['pm10Value']} `;
  result += `μg/㎡(${getCoutList(pm10Grade1h).msg})`;
  result += `, 초미세: ${data['pm25Value']} `;
  result += `μg/㎡(${getCoutList(pm25Grade1h).msg})`;

  node.innerHTML = result;
}

var state = "boot";
var isFirstArrived = false;
var interval = setInterval(getRealTimeEachCity, 1);