var xhr = new XMLHttpRequest();

if (process.env.NODE_ENV === 'development') {
  xhr.open('GET', 'file:///1234');
} else {
  xhr.open('GET', 'https://s3.ap-northeast-2.amazonaws.com/enthusair/1234');
}

var time_result = document.getElementById('time_result');
var seoul = document.getElementById('seoul_result');
var jeju = document.getElementById('jeju_result');

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

  result += `, 미세: ${data['pm10Value']} μg/㎡`;
  result += `, 초미세: ${data['pm25Value']} μg/㎡`;

  node.innerHTML = result;
}

var seoulLevel = 4;
var jejuLevel = 3;
var region = 'seoul';
var oldLevel = 4;
var oldColor = '#000000';

function colorBlink() {
  var level = region === 'seoul' ? seoulLevel : jejuLevel;
  var td = document.getElementsByTagName('td')[level];

  if (oldLevel != level) {
    if (oldColor != '#000000') {
      var tdOld = document.getElementsByTagName('td')[oldLevel];
      tdOld.setAttribute('style', 'background-color:' + oldColor);
    }
    oldLevel = level;
    oldColor = '#000000';
  }

  var newColor = oldColor;
  oldColor = td.getAttribute('style').split(':')[1];
  td.setAttribute('style', 'background-color:' + newColor);

  setTimeout(colorBlink, newColor === '#000000' ? 500 : 1000);
}

colorBlink();

jeju.addEventListener('click', () => { selectRegion('jeju'); });
seoul.addEventListener('click', () => { selectRegion('seoul'); });

var regionNodes = {'seoul': seoul, 'jeju': jeju};

function selectRegion(reg) {
  region = reg;
  for (const el in regionNodes)
    regionNodes[el].style['color'] = el === reg ? "yellow" : "white";
}

var state = "boot";
var isFirstArrived = false;
var interval = setInterval(getRealTimeEachCity, 1);

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