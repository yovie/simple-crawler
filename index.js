import fetch from 'node-fetch';
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
    if (dx>0) {
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

console.timeEnd("CRAWLING");