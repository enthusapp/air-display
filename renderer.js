var xhr = new XMLHttpRequest();

if (process.env.NODE_ENV === 'development') {
  xhr.open('GET', 'file:///1234');
} else {
  xhr.open('GET', 'https://s3.ap-northeast-2.amazonaws.com/enthusair/1234');
}

var time_result = document.getElementById('time_result');
var seoul = document.getElementById('seoul_result');
var jeju = document.getElementById('jeju_result');
var seoulLevel = 4;
var jejuLevel = 3;

xhr.onreadystatechange = function () {
  if (xhr.readyState === XMLHttpRequest.DONE) {
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      var seoulData = getRegionObject(data, '서울');
      var jejuData = getRegionObject(data, '제주');

      time_result.innerText = seoulData.dataTime;

      showResult(seoul, seoulData, '서울');
      showResult(jeju, jejuData, '제주');

      seoulLevel = getLevel(seoulData);
      jejuLevel = getLevel(jejuData);

      isFirstArrived = true;
    } else {
      console.log('[' + xhr.status + ']: ' + xhr.statusText);
    }
  }
};

function getLevel(data) {
  var value = Math.max(parseInt(data.pm10Value), parseInt(data.pm25Value));

  if (value < 20) { return 0; }
  if (value < 30) { return 1; }
  if (value < 40) { return 2; }
  if (value < 50) { return 3; }
  if (value < 60) { return 4; }
  if (value < 70) { return 5; }
  if (value < 80) { return 6; }
  return 7;
}

function showResult(node, data, name) {
  var result = [name, data['stationName']].join(' ');

  result += `, 미세: ${data['pm10Value']} μg/㎡`;
  result += `, 초미세: ${data['pm25Value']} μg/㎡`;

  node.innerHTML = result;
}

function getRegionObject(data, name) {
  return data[name].list[0];
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

var ifaces = require('os').networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    document.getElementById('name').innerText =
      ["Air Display v1.0.0", iface.address].join(', ');
    return false;
  });
});