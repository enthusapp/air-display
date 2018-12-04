var xhr = new XMLHttpRequest();
var oParser = new DOMParser();

const DataAPI = 'http://openapi.airkorea.or.kr/openapi/services/rest';

const ServiceAPIs = {
  listStation: 'MsrstnInfoInqireSvc', // 측정소정보 조회 서비스
  mesureAir: 'ArpltnInforInqireSvc', // 대기오염정보 조회 서비스
  statsAir: 'ArpltnStatsSvc', // 대기오염통계 서비스
  oxizon: 'OzYlwsndOccrrncInforInqireSvc' // 오존황사 발생정보조회 서비스
};

const APIs = {
  realTimeEachStation: 'getMsrstnAcctoRltmMesureDnsty', // 측정소별 실시간 측정정보 조회
  listBadStation: 'getUnityAirEnvrnIdexSnstiveAboveMsrstnList', // 통합대기환경지수 나쁨 이상 측정소 목록조회
  realTimeEachCity: 'getCtprvnRltmMesureDnsty', // 시도별 실시간 측정정보 조회
  forecast: 'getMinuDustFrcstDspth', // 미세먼지/오존 예보통보 조회
  averageEachCity: 'getCtprvnMesureLIst', // 시도별 실시간 평균정보 조회
  averageEachTown: 'getCtprvnMesureSidoLIst', // 시군구별 실시간 평균정보 조회
};

const ServiceKey = 'Q9uAszqCfX0MytqG8Lt6h4UPi1LYdYc1EXDveF9k8gHu%2FQecdiFw48KzHnWvB2LndHaUMG3ca3s4ebSqSlUTDg%3D%3D';
const APIver = '1.3';
const dataTerm = 'month';

function getRealTimeEachStation() {
  var sendData = [DataAPI, ServiceAPIs.mesureAir, APIs.realTimeEachStation].join('/');
  sendData += `?stationName=종로구`;
  sendData += `&dataTerm=${dataTerm}&pageNo=1&numOfRows=10&ServiceKey=${ServiceKey}&ver=${APIver}`;

  xhr.open('GET', sendData);
  xhr.send();
}

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

  var sendData = [DataAPI, ServiceAPIs.mesureAir, APIs.realTimeEachCity].join('/');
  sendData += '?sidoName=서울';
  sendData += `&dataTerm=${dataTerm}&pageNo=1&numOfRows=10&ServiceKey=${ServiceKey}&ver=${APIver}`;

  document.getElementById('result').innerText = '데이터를 읽어오는 중입니다...';
  xhr.open('GET', sendData);
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
      data = oParser.parseFromString(xhr.responseText, "text/xml");
      [].forEach.call(tagSels(data.documentElement, 'item'), el => {
        if (tagSel(el, 'stationName').textContent === '중구') {
          console.log(el);
          var result = `${tagSel(el, 'dataTime').textContent}`;
          var pm10Grade1h = parseInt(tagSel(el, 'pm10Grade1h').textContent);
          var pm25Grade1h = parseInt(tagSel(el, 'pm25Grade1h').textContent);

          result += `,<br>미세: ${tagSel(el, 'pm10Value').textContent} `;
          result += `μg/㎡(${getCoutList(pm10Grade1h).msg})`;
          result += `,<br>초미세: ${tagSel(el, 'pm25Value').textContent} `;
          result += `μg/㎡(${getCoutList(pm25Grade1h).msg})`;

          document.getElementById('result').innerHTML = result;
          document.getElementById('body').style.backgroundColor = getCoutList(Math.max(pm10Grade1h, pm25Grade1h)).color;
          isFirstArrived = true;
        }
      });
    } else {
      console.log('[' + xhr.status + ']: ' + xhr.statusText);
    }
  }
};

var state = "boot";
var isFirstArrived = false;
var interval = setInterval(getRealTimeEachCity, 1);