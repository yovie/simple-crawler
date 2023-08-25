import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import CryptoJS from "crypto-js";
// import axios from 'axios';

console.time("CRAWLING");

let Headers;
let Cookie;
let loginHeaders;
let loginCookie;
let loginJSON;

// get cookie
const init = await fetch("https://www.eais.go.kr/", {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1"
  },
  "method": "GET",
  "redirect": 'manual'
});

if (init.status === 301 || init.status === 302 || init.status === 307) {
  const locationURL = new URL(init.headers.get('location'), init.url);
  const response2 = await fetch(locationURL, { redirect: 'manual' });
  Headers = response2.headers;
  Cookie = response2.headers.get('set-cookie');
}

// console.log(Cookie);

// login
const loginParam = {
  "loginId": process.env.USERNAME,
  "loginPwd": process.env.PASSWORD
};
const login = await fetch("https://www.eais.go.kr/awp/AWPABB01R01", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,id;q=0.8,ms;q=0.7,ru;q=0.6,es;q=0.5,de;q=0.4,ar;q=0.3",
    "access-control-allow-origin": "*",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "untclsfcd": "1000",
    "cookie": Cookie,
    "Referer": "https://www.eais.go.kr/moct/awp/abb01/AWPABB01F01",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": JSON.stringify(loginParam),
  "method": "POST"
});

loginHeaders = login.headers;
loginCookie = login.headers.get('set-cookie');
loginJSON = await login.json();

// console.log(loginHeaders, loginCookie, loginJSON);

// search
// param from user input
const searchParam = {
  "addrGbCd": "0",
  "inqireGbCd": "0",
  "bldrgstCurdiGbCd": "0",
  "bldrgstSeqno": "",
  "reqSigunguCd": "41285",
  "sidoClsfCd": "1083",
  "bjdongCd": "10500",
  "platGbCd": "0",
  "mnnm": "796",
  "slno": "0",
  "splotNm": null,
  "blockNm": null,
  "lotNm": null,
  "roadNmCd": "",
  "bldMnnm": "",
  "bldSlno": "",
  "sigunguCd": "",
  "untClsfCd": ""
};
// trigger get TMOSHCooKie
const tmosCookie = await fetch("https://www.eais.go.kr/bci/BCIAAA02R01", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "untclsfcd": "1000",
    "cookie": loginCookie,
    "Referer": "https://www.eais.go.kr/moct/bci/aaa02/BCIAAA02L01",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": JSON.stringify(searchParam),
  "method": "POST",
  "redirect": 'manual'
});

if (tmosCookie.status === 301 || tmosCookie.status === 302 || tmosCookie.status === 307) {
  const locationURL = new URL(tmosCookie.headers.get('location'), tmosCookie.url);
  const response2 = await fetch(locationURL, { redirect: 'manual' });
  const tmpHeaders = response2.headers;
  loginCookie = loginCookie + ';' + response2.headers.get('set-cookie');
}

// console.log(loginCookie);

// do first search
const firstSearch = await fetch("https://www.eais.go.kr/bci/BCIAAA02R01", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "untclsfcd": "1000",
    "cookie": loginCookie,
    "Referer": "https://www.eais.go.kr/moct/bci/aaa02/BCIAAA02L01",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": JSON.stringify(searchParam),
  "method": "POST",
  "redirect": 'manual'
});

const firstSearchJSON = await firstSearch.json();
// console.log(firstSearchJSON);

// second search
const secondSearchParam = {
  "inqireGbCd": "0",
  "reqSigunguCd": firstSearchJSON?.jibunAddr[0]?.sigunguCd,
  "bldrgstCurdiGbCd": "0",
  "upperBldrgstSeqnos": firstSearchJSON?.jibunAddr.map(mm => mm.bldrgstSeqno),
  "bldrgstSeqno": ""
};
const secondSearch = await fetch("https://www.eais.go.kr/bci/BCIAAA02R04", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "untclsfcd": "1000",
    "cookie": loginCookie,
    "Referer": "https://www.eais.go.kr/moct/bci/aaa02/BCIAAA02L01",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": JSON.stringify(secondSearchParam),
  "method": "POST"
});
const secondSearchJSON = await secondSearch.json();
// console.log(secondSearchParam, secondSearchJSON);

// step 3_generate
let search3GenerateJSON = [];

if (secondSearchJSON.findExposList.length > 0) {
  let dx = 0;
  for (let expos of secondSearchJSON.findExposList) {
    if (dx > 0) {
      continue;
    }
    const s3GenParam = {
      "bldrgstSeqno": expos.bldrgstSeqno,
      "regstrGbCd": expos.regstrGbCd,
      "regstrKindCd": expos.regstrKindCd,
      "mjrfmlyIssueYn": "N",
      "locSigunguCd": expos.sigunguCd,
      "locBjdongCd": expos.bjdongCd,
      "locPlatGbCd": expos.platGbCd,
      "locDetlAddr": expos.mnnm + ' ' + expos.dongNm,
      "locMnnm": expos.mnnm,
      "locSlno": expos.slno,
      "locDongNm": expos.dongNm,
      "locBldNm": expos.bldNm,
      "ownrYn": expos.ownrYn,
      "multiUseBildYn": expos.multiUseBldYn,
      "bldrgstCurdiGbCd": expos.bldrgstCurdiGbCd
    };
    const search3Generate = await fetch("https://www.eais.go.kr/bci/BCIAAA02C01", {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "untclsfcd": "1000",
        "cookie": loginCookie,
        "Referer": "https://www.eais.go.kr/moct/bci/aaa02/BCIAAA02L01",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": JSON.stringify(s3GenParam),
      "method": "POST"
    });
    const tmps = await search3Generate.json();
    search3GenerateJSON.push(tmps);
    dx++;
  }
}

console.log(search3GenerateJSON.length, search3GenerateJSON[0]);

// step 4_showreport
const showReport = await fetch("https://www.eais.go.kr/cba/CBAAZA02R01", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "untclsfcd": "1000",
    "cookie": loginCookie,
    "Referer": "https://www.eais.go.kr/moct/bci/aaa02/BCIAAA02F01",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": null,
  "method": "GET"
});
const showReportJSON = await showReport.json();
// console.log('showReport', showReportJSON);

// step 5_showreportlist
const showReportListXParam = { 
  "addrGbCd": "0", 
  "inqireGbCd": "0", 
  "bldrgstCurdiGbCd": "0", 
  "bldrgstSeqno": "", 
  "reqSigunguCd": "41285", 
  "sidoClsfCd": "1083", 
  "bjdongCd": "10500", 
  "platGbCd": "0", 
  "mnnm": "796", 
  "slno": "0", 
  "splotNm": null, 
  "blockNm": null, 
  "lotNm": null, 
  "roadNmCd": "", 
  "bldMnnm": "", 
  "bldSlno": "", 
  "sigunguCd": "", 
  "untClsfCd": "" 
};
const showReportListX = await fetch("https://www.eais.go.kr/bci/BCIAAA02R01", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,id;q=0.8,ms;q=0.7,ru;q=0.6,es;q=0.5,de;q=0.4,ar;q=0.3",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "untclsfcd": "1000",
    "cookie": loginCookie,
    "Referer": "https://www.eais.go.kr/moct/bci/aaa02/BCIAAA02L01",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": JSON.stringify(showReportListXParam),
  "method": "POST"
});
const showReportListXJSON = await showReportListX.json();
console.log(showReportListXJSON, '< showReportListXJSON');

const showReportList1Param = {
  "pbsvcResveDtls": [
    {
      "@id": "78d63077-2966-4c3c-8a2a-fa94ce9ddea5",
      "rowStatus": "R",
      "entityType": null,
      "firstCrtnDt": "20230824072911",
      "firstWrtrId": "230223190601mufinetb56",
      "lastUpdtDt": "20230824072911",
      "lastUpdusrId": "230223190601mufinetb56",
      "untClsfCd": "1106",
      "pbsvcResveDtlsSeqno": "1000000000000147571823",
      "bldrgstSeqno": "11041133379",
      "appGbCd": null,
      "regstrGbCd": "2",
      "regstrKindCd": "2",
      "blprtInfoSeqno": null,
      "blprtKindCd": null,
      "issueReadGbCd": null,
      "mjrfmlyIssueYn": "N",
      "bldrgstCurdiGbCd": "0",
      "ownrYn": "N",
      "multiUseBildYn": "N",
      "ownrExprsYn": "N",
      "locSigunguCd": "41285",
      "locBjdongCd": "10500",
      "locPlatGbCd": "0",
      "locDetlAddr": "경기도 고양시 일산동구 마두동 796 유치원동",
      "locMnnm": "0796",
      "locSlno": "0000",
      "locSplotNm": null,
      "locBlockNm": null,
      "locLotNm": null,
      "locBldNm": "강촌마을",
      "locDongNm": "유치원동",
      "locFlrNm": null,
      "locHoNm": null,
      "cvsFinYn": "1",
      "clsErsrDate": null
    }
  ],
  "ownrExprsYn": "N",
  "bldrgstGbCd": "1",
  "pbsvcRecpInfo": {
    "pbsvcGbCd": "01",
    "issueReadGbCd": "0",
    "certDn": null,
    "pbsvcResveDtlsCnt": 1
  },
  "appntInfo": {
    "appntGbCd": "01",
    "appntJmno1": "770724",
    "appntJmno2": "",
    "appntJmno": "",
    "appntBizno": "",
    "appntNm": "Elma",
    "appntMtelno": "",
    "appntSigunguCd": "",
    "naAppntBjdongCd": "",
    "naAppntRoadCd": "",
    "naAppntMnnm": "",
    "naAppntSlno": "",
    "naAppntGrndUgrndGbCd": "0",
    "naAppntDetlAddr": "",
    "appntCorpno": "",
    "appntCoprNm": ""
  },
  "indvGbCd": null
};
const showReportList1 = await fetch("https://www.eais.go.kr/bci/BCIAZA02S01", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "untclsfcd": "1000",
    "cookie": loginCookie,
    "Referer": "https://www.eais.go.kr/moct/bci/aaa02/BCIAAA02F01",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": JSON.stringify(showReportList1Param),
  "method": "POST"
});
const showReportList1JSON = await showReportList1.json();
// console.log(showReportList1JSON, '< showReportList1JSON');

const showReportList2Param = {
  "lastUpdusrId": "230223190601mufinetb56"
};
const showReportList2 = await fetch("https://www.eais.go.kr/bci/BCIAAA02D02", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "untclsfcd": "1000",
    "cookie": loginCookie,
    "Referer": "https://www.eais.go.kr/moct/bci/aaa02/BCIAAA02F01",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": JSON.stringify(showReportList2Param),
  "method": "POST"
});
const showReportList2JSON = await showReportList2.json();
// console.log(showReportList2JSON, '< showReportList2JSON');

const showReportList3 = await fetch("https://www.eais.go.kr/cba/CBAAZA02R01", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "untclsfcd": "1000",
    "cookie": loginCookie,
    "Referer": "https://www.eais.go.kr/moct/bci/aaa04/BCIAAA04L01",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": null,
  "method": "GET"
});
const showReportList3JSON = await showReportList3.json();
// console.log(showReportList3JSON, '< showReportList3JSON');

const showReportList4Param = {
  "membNo": "",
  "pbsvcGbCd": "",
  "progStateFlagArr": [
    "01"
  ],
  "pbsvcProcessGbCd": "",
  "firstSaveStartDate": "2023-07-23",
  "firstSaveEndDate": "2023-08-24",
  "pageNo": 0,
  "recordSize": 10,
  "pageYn": "N"
};
const showReportList4 = await fetch("https://www.eais.go.kr/bci/BCIAAA06R01", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "untclsfcd": "1000",
    "cookie": loginCookie,
    "Referer": "https://www.eais.go.kr/moct/bci/aaa04/BCIAAA04L01",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": JSON.stringify(showReportList4Param),
  "method": "POST"
});
const showReportList4JSON = await showReportList4.json();
// console.log(showReportList4JSON, '< showReportList4JSON');

if (showReportListXJSON.jibunAddr.length > 0) {
  for (let t of showReportListXJSON.jibunAddr) {
    let r = "";
    0 == t.bldrgstCurdiGbCd ? 
      1 == t.regstrKindCd ? 
        r = "djrBldRecaptitle" : 2 == t.regstrKindCd ? 
          r = "Y" == t.mjrfmlyYn ? 
            "djrMjrFmlyHoArea" : "djrBldrgstGnrl" : 3 == t.regstrKindCd ? 
              r = "djrBldtitle" : 4 == t.regstrKindCd && (r = "djrBldexpos") : 1 == t.bldrgstCurdiGbCd && (1 == t.regstrKindCd ? 
                r = "djrBldRecaptitleTif" : 2 == t.regstrKindCd || 3 == t.regstrKindCd ? 
                  r = "djrBldrgstTif" : 4 == t.regstrKindCd && (r = "djrBldexposTif"));
    let l = {
      sysLocGbCd: "3",
      reptNm: r,
      recpDay: t.recpDay,
      jobGbCd: "BC"
    };
    console.log(r, l);
  }
}

// step 6_showpopup
const showPopup1Param = {
  "sysLocGbCd": "3",
  "reptNm": "djrBldRecaptitle",
  "recpDay": "20230823",
  "jobGbCd": "BC"
};
const showPopup1 = await fetch("https://www.eais.go.kr/cba/CBAAZD04R01", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "untclsfcd": "1000",
    "cookie": loginCookie,
    "Referer": "https://www.eais.go.kr/moct/bci/aaa04/BCIAAA04L01",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": JSON.stringify(showPopup1Param),
  "method": "POST"
});
const showPopup1JSON = await showPopup1.json();
console.log(showPopup1JSON);

const showPopup2Param = {
  "issueReadAppDate": "20230823",
  "pbsvcRecpNo": "20233960100P953066"
};
const showPopup2 = await fetch("https://www.eais.go.kr/report/BCIAAA06R03", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "untclsfcd": "1000",
    "cookie": loginCookie,
    "Referer": "https://www.eais.go.kr/moct/bci/aaa04/BCIAAA04L01",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": JSON.stringify(showPopup2Param),
  "method": "POST"
});
const showPopup2JSON = await showPopup2.json();
console.log(showPopup2JSON);

const showPopup3Param = {
  "issueReadAppDate": "20230823",
  "pbsvcRecpNo": "20233960100P953066"
};
const showPopup3 = await fetch("https://www.eais.go.kr/bci/BCIAAA06R03", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "untclsfcd": "1000",
    "cookie": loginCookie,
    "Referer": "https://www.eais.go.kr/moct/bci/aaa04/BCIAAA04L01",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": JSON.stringify(showPopup3Param),
  "method": "POST"
});
const showPopup3JSON = await showPopup3.json();
console.log(showPopup3JSON);

// print pdf
const printParam = "ClipID=R08"
  + "&uid=cd5a09c3ad92f42e9864320316bf67a0a"
  + "&clipUID=cd5a09c3ad92f42e9864320316bf67a0a"
  + "&print=print"
  + "&isPDFPrintImage=false"
  + "&path=%2Freport"
  + "&optionValue=%7B%22drawDashedLineDirectly%22%3Atrue%2C%22startNum%22%3A1%2C%22endNum%22%3A3%7D"
  + "&isChromePrintFitToPage=false"
  + "&s_time=1692830421619";
const refererParam = "param=U2FsdGVkX1%2BzCE5v4ozqrjOt9RHeP5LbeFf69kAN%2FWw1rrM%2Fg2RqNbPNmO%2FhdLc5wXGG8TGq2IWifDv9ZYEvIAM9%2Bs2PFBYOFKuuOA415LSMiBxd4PuFkNn3c3gy4nOkiy0MPrvMA7qlgzakzPNpR4XKPcnyF2JNhMxHUt%2BwMw%2FtNjWnMfei9OCvGJXIK1%2FMP5WE%2FrnzVkuT8ejL5wSBSbKBU6h1a2maKZSQedwEGDglNRgSlv%2Fvc%2BO1V9tSVwgw%2BDS1oEoCUG09Q6xzCShjxFYDEO5sZRjkLm0%2BEcSbfk4hNcLuUBBv35UeLQXZg55AgxtiUBjIRypcHV73REYixd3UJG6HgGTbDYI%2BAj%2F6ugB449UjKSe0%2BE7KToUZxjDE2Y0qIqqxcsJzxfrbxAaQhwY7JSAIaqZJUCOhcHM76qE2lQtAbySZHGoKN0sMbalTMNNJIib4XhvV1A0SuJeAPDJkJtBbynOvNXeAF6toX4%2FmVGCBag2%2BVINZUYT5HKp7NoLl4eMjEzxnERRHfrx9DGh9hkwwJR5Xu1YxuWEhJ4w6ldkhejJsqaphhh0bVCK%2FCv92t%2Flrh0S1KxjVWTpVioUV878OxjuF%2FIk3G6aenvO%2BXxFaCOYMOuGIGqyjJCoZPcFOsF5ghx7J8ifqHoHRNKJHTtRB%2BqeMMSty0PrCGF%2Fmsq7mzg1ZcVJegPQvFhLO"
  + "&actionId=BCIAAA04L01"
// const printPDF = await fetch("https://www.eais.go.kr/report/RPTCAA02R02", {
//   "headers": {
//     "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
//     "accept-language": "en-US,en;q=0.9",
//     "cache-control": "max-age=0",
//     "content-type": "application/x-www-form-urlencoded",
//     "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Linux\"",
//     "sec-fetch-dest": "iframe",
//     "sec-fetch-mode": "navigate",
//     "sec-fetch-site": "same-origin",
//     "sec-fetch-user": "?1",
//     "upgrade-insecure-requests": "1",
//     "cookie": loginCookie,
//     "Referer": "https://www.eais.go.kr/report/BCIAAA04V01?" + refererParam,
//     "Referrer-Policy": "strict-origin-when-cross-origin"
//   },
//   "body": printParam,
//   "method": "POST"
// });

// const destination = path.resolve("./", 'tmp1.pdf');
// const fileStream = fs.createWriteStream(destination);
// const pdfStatus = await new Promise((resolve, reject) => {
//   printPDF.body.pipe(fileStream);
//   printPDF.body.on("error", reject);
//   fileStream.on("finish", resolve);
// });

// console.log(pdfStatus);

console.timeEnd("CRAWLING");