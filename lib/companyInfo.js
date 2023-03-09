"use strict";

require("core-js/modules/es.promise.js");
require("core-js/modules/web.dom-collections.iterator.js");
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.string.replace.js");
require("core-js/modules/es.number.parse-int.js");
require("core-js/modules/es.string.includes.js");
require("core-js/modules/es.array.sort.js");
require("core-js/modules/es.json.stringify.js");
var _fs = _interopRequireDefault(require("fs"));
var _axios = _interopRequireDefault(require("axios"));
var _nodeHtmlParser = _interopRequireDefault(require("node-html-parser"));
var _iconvLite = _interopRequireDefault(require("iconv-lite"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
async function getCompanyInfo() {
  let code = JSON.parse(_fs.default.readFileSync("./data/entList.json", {
    encoding: "utf8"
  }));
  let file = JSON.parse(_fs.default.readFileSync("./data/report.json", {
    encoding: "utf8"
  }));
  let oldReport = file != "" ? file : {};
  let per = {};
  let stock = {};
  for (const cd of Object.keys(code)) {
    await (0, _axios.default)({
      method: "GET",
      url: "https://finance.naver.com/item/main.naver?code=" + cd,
      responseType: "arraybuffer"
    }).then(res => {
      var _info$PEREPS;
      let tab = (0, _nodeHtmlParser.default)(_iconvLite.default.decode(res.data, "EUC-KR")).getElementById("tab_con1");
      let info = {};
      tab.getElementsByTagName("tr").forEach(el => {
        let key = el.getElementsByTagName("th")[0];
        let deleteInfo = el.getElementsByTagName("th")[0].getElementsByTagName("div");
        for (const info of deleteInfo) {
          key.removeChild(info);
        }
        let newKey = key.innerText.replace(/[\t\n\s]/g, "").replace("l", "|");
        let val = el.getElementsByTagName("td")[0].innerText.replace(/[\t\n]/g, "").replace("l", "|").replace("배", "");
        info[newKey] = val;
      });
      per[code[cd]] = info["PER|EPS(2022.12)"] != null ? info["PER|EPS(2022.12)"].split("|")[0] : (_info$PEREPS = info["PER|EPS(2022.09)"]) === null || _info$PEREPS === void 0 ? void 0 : _info$PEREPS.split("|")[0];
      let chart = (0, _nodeHtmlParser.default)(_iconvLite.default.decode(res.data, "EUC-KR")).getElementById("chart_area");
      stock[code[cd]] = Number.parseInt(chart.getElementsByTagName("em")[0].getElementsByTagName("span")[0].innerText.replace(",", ""));
    });
  }
  let globFund = {};
  await (0, _axios.default)({
    method: "GET",
    url: "https://finance.naver.com/sise/sise_deal_rank_iframe.naver?sosok=01&investor_gubun=9000&type=buy",
    responseType: "arraybuffer"
  }).then(res => {
    let tab = (0, _nodeHtmlParser.default)(_iconvLite.default.decode(res.data, "EUC-KR")).getElementsByTagName("table")[1];
    tab.getElementsByTagName("tr").forEach(el => {
      if (el.getElementsByTagName("td").length != 0) {
        if (Object.values(code).includes(el.getElementsByTagName("td")[0].innerText)) {
          globFund[el.getElementsByTagName("td")[0].innerText] = Number.parseInt(el.getElementsByTagName("td")[1].innerText.replace(",", "")) * Number.parseInt(el.getElementsByTagName("td")[2].innerText.replace(",", ""));
        }
      }
    });
  });
  let globFundSell = {};
  await (0, _axios.default)({
    method: "GET",
    url: "https://finance.naver.com/sise/sise_deal_rank_iframe.naver?sosok=01&investor_gubun=9000&type=sell",
    responseType: "arraybuffer"
  }).then(res => {
    let tab = (0, _nodeHtmlParser.default)(_iconvLite.default.decode(res.data, "EUC-KR")).getElementsByTagName("table")[1];
    tab.getElementsByTagName("tr").forEach(el => {
      if (el.getElementsByTagName("td").length != 0) {
        if (Object.values(code).includes(el.getElementsByTagName("td")[0].innerText)) {
          globFundSell[el.getElementsByTagName("td")[0].innerText] = Number.parseInt(el.getElementsByTagName("td")[1].innerText.replace(",", "")) * Number.parseInt(el.getElementsByTagName("td")[2].innerText.replace(",", ""));
        }
      }
    });
  });
  let date = new Date();
  let now = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  let report = oldReport;
  report[now] = {};
  report[now]["per"] = {};
  Object.entries(per).sort((a, b) => a[1] - b[1]).forEach(el => {
    report[now]["per"][el[0]] = el[1];
  });
  report[now]["외국인매수"] = globFund;
  report[now]["외국인판매"] = globFundSell;
  report[now]["주가지수"] = {};
  report[now]["주가지수"]["2023-01-20"] = {};
  report[now]["주가지수"]["2023-01-20"]["삼성전자"] = 61700;
  report[now]["주가지수"]["2023-01-20"]["NAVER"] = 196500;
  report[now]["주가지수"][now] = {};
  Object.values(code).forEach(entName => {
    report[now]["주가지수"][now][entName] = stock[entName];
  });
  report[now]["수익"] = "삼성전자: " + Math.round((stock["삼성전자"] - 61700) / 61700 * 100) + "%, " + (stock["삼성전자"] - 61700) + "원 /" + "NAVER(2월7일 판매): " + Math.round((218500 - 196500) / 196500 * 100) + "%, " + (218500 - 196500) + "원";
  _fs.default.writeFileSync("./data/report.json", JSON.stringify(report));
  let auth = "Bearer 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";
  let question = JSON.stringify(report) + "의 내용을 토대로 봤을 때 가장 좋은 매출을 낼만한 기업은 어디일까?";
  console.log(question);
  await (0, _axios.default)({
    method: "POST",
    url: "https://api.openai.com/v1/completions",
    headers: {
      "Content-Type": "application/json",
      "Authorization": auth
    },
    data: {
      "model": "text-davinci-003",
      "prompt": question,
      "temperature": 0,
      "max_tokens": 2000
    }
  }).then(res => {
    console.log(res.data);
  });
  await (0, _axios.default)({
    method: "POST",
    url: "https://api.openai.com/v1/completions",
    headers: {
      "Content-Type": "application/json",
      "Authorization": auth
    },
    data: {
      "model": "text-davinci-003",
      "prompt": JSON.stringify(report) + "의 데이터를 상세하게 서술해줄래?",
      "temperature": 0,
      "max_tokens": 2000
    }
  }).then(res => {
    console.log(res.data);
  });
}
getCompanyInfo();