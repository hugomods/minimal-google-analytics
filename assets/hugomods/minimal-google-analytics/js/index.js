enScroll = false;
enFdl = false;
extCurrent = undefined;
filename = undefined;
targetText = undefined;
splitOrigin = undefined;

const lStor = localStorage;
const sStor = sessionStorage;
const doc = document;
const docEl = document.documentElement;
const docBody = document.body;
const docLoc = document.location;
const w = window;
const s = screen;
const nav = navigator || {};

const extensions = ["pdf", "xls", "xlsx", "doc", "docx", "txt", "rtf", "csv", "exe", "key", "pps", "ppt", "pptx", "7z", "pkg", "rar", "gz", "zip", "avi", "mov", "mp4", "mpe", "mpeg", "wmv", "mid", "midi", "mp3", "wav", "wma"];

function a(extCurrent, filename, targetText, splitOrigin) {

  // debug options to clean cache
  // localStorage.clear();
  // sessionStorage.clear();

  const trackingId = document.currentScript.getAttribute('data-id'); // set here your Measurement ID for GA4 / Stream ID

  // gmt > If the current hit is coming was generated from GTM, it will contain a hash of current GTM/GTAG config, example: 2oear0
  // Currently not in use, leave XXXXXX , under investigation
  // let gtmId = "XXXXXX"; 
  // if (gtmId == "XXXXXX") {
  //    let gtmId = undefined;
  // }
  // else {
  //    let gtmId = gtmId.toLowerCase();
  // }

  // 10-ish digit number generator
  const generateId = () => Math.floor(Math.random() * 1000000000) + 1;
  // UNIX datetime generator
  const dategenId = () => Math.floor(Date.now() / 1000);

  const _pId = () => {
    if (!sStor._p) {
      sStor._p = generateId();
    }
    return sStor._p;
  };

  const generatecidId = () => generateId() + "." + dategenId();
  const cidId = () => {
    if (!lStor.cid_v4) {
      lStor.cid_v4 = generatecidId();
    }
    return lStor.cid_v4;
  };

  const cidCheck = lStor.getItem("cid_v4");
  const _fvId = () => {
    if (cidCheck) {
      return undefined;
    }
    else if (enScroll == true) {
      return undefined;
    }
    else {
      return "1";
    }
  };

  const sidId = () => {
    if (!sStor.sid) {
      sStor.sid = dategenId();
    }
    return sStor.sid;
  };

  const _ssId = () => {
    if (!sStor._ss) {
      sStor._ss = "1";
      return sStor._ss;
    }
    else if (sStor.getItem("_ss") == "1") {
      return undefined;
    }
  };

  const generatesctId = "1";
  const sctId = () => {
    if (!sStor.sct) {
      sStor.sct = generatesctId;
    }
    else if (enScroll == true) {
      return sStor.sct;
    }
    else {
      x = +sStor.getItem("sct") + +generatesctId;
      sStor.sct = x;
    }
    return sStor.sct;
  };

  // Default GA4 Search Term Query Parameter: q,s,search,query,keyword
  const searchString = docLoc.search;
  const searchParams = new URLSearchParams(searchString);
  //const searchString = "?search1=test&query1=1234&s=dsf"; // test search string
  const sT = ["q", "s", "search", "query", "keyword"];
  const sR = sT.some(si => searchString.includes("&" + si + "=") || searchString.includes("?" + si + "="));

  const eventId = () => {
    if (sR == true) {
      return "view_search_results";
    }
    else if (enScroll == true) {
      return "scroll";
    }
    else if (enFdl == true) {
      return "file_download";
    }
    else {
      return "page_view";
    }
  };

  const eventParaId = () => {
    if (enScroll == true) {
      return "90";
    }
    else {
      return undefined;
    }
  };

  // get search_term
  const searchId = () => {
    if (eventId() == "view_search_results") {
      //Iterate the search parameters.
      for (let p of searchParams) {
        //console.log(p); // for debuging
        if (sT.includes(p[0])) {
          return p[1];
        }
      }
    }
    else {
      return undefined;
    }
  };

  const encode = encodeURIComponent;
  const serialize = (obj) => {
    let str = [];
    for (let p in obj) {
      if (obj.hasOwnProperty(p)) {
        if (obj[p] !== undefined) {
          str.push(encode(p) + "=" + encode(obj[p]));
        }
      }
    }
    return str.join("&");
  };

  const debug = false;  // enable analytics debuging

  // url 
  const url = "https://www.google-analytics.com/g/collect";
  // payload
  const data = serialize({
    v: "2", // Measurement Protocol Version 2 for GA4
    tid: trackingId, // Measurement ID for GA4 or Stream ID
    //gtm: gtmId, // Google Tag Manager (GTM) Hash Info. If the current hit is coming was generated from GTM, it will contain a hash of current GTM/GTAG config (not in use, currently under investigation)
    _p: _pId(), // random number, hold in sessionStorage, unknown use
    sr: (s.width * w.devicePixelRatio + "x" + s.height * w.devicePixelRatio).toString(), // Screen Resolution
    ul: (nav.language || undefined).toLowerCase(), // User Language
    cid: cidId(), // client ID, hold in localStorage
    _fv: _fvId(), // first_visit, identify returning users based on existance of client ID in localStorage
    _s: "1", // session hits counter
    dl: docLoc.origin + docLoc.pathname + searchString, // Document location
    dt: doc.title || undefined, // document title
    dr: doc.referrer || undefined, // document referrer
    sid: sidId(), // session ID random generated, hold in sessionStorage
    sct: sctId(), // session count for a user, increase +1 in new interaction
    seg: "1", // session engaged (interacted for at least 10 seconds), assume yes
    en: eventId(), // event like page_view, view_search_results or scroll
    "epn.percent_scrolled": eventParaId(),// event parameter, used for scroll event
    "ep.search_term": searchId(), // search_term reported for view_search_results from search parameter
    "ep.file_extension": extCurrent || undefined,
    "ep.file_name": filename || undefined,
    "ep.link_text": targetText || undefined,
    "ep.link_url": splitOrigin || undefined,
    _ss: _ssId(), // session_start, new session start
    _dbg: debug ? 1 : undefined,  // console debug
  });

  const fullurl = (url + "?" + data);

  // for debug purposes
  // console.log(data);
  // console.log(url, data);
  // console.log(fullurl);

  if (nav.sendBeacon) {
    nav.sendBeacon(fullurl);
  } else {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", (fullurl), true);
  }
}
a();

// Scroll Percent
function sPr() {
  return (docEl.scrollTop || docBody.scrollTop) / ((docEl.scrollHeight || docBody.scrollHeight) - docEl.clientHeight) * 100;
}
// add scroll listener
doc.addEventListener("scroll", sEv, { passive: true });

// scroll Event
function sEv() {
  const percentage = sPr();

  if (percentage < 90) {
    return;
  }
  enScroll = true;
  // fire analytics script
  a();
  // remove scroll listener
  doc.removeEventListener("scroll", sEv, { passive: true });
  enScroll = false;
}

// file download listener

document.addEventListener("DOMContentLoaded", function () {
  let Anchors = document.getElementsByTagName("a");

  for (let i = 0; i < Anchors.length; i++) {
    if (Anchors[i].getAttribute("href") != null) {

      const url = Anchors[i].getAttribute("href");
      const file = url.substring(url.lastIndexOf("/") + 1);
      const ext = file.split(".").pop();

      /* if any anchor got download attribute, add event listener */
      /* and if any anchor have acceptable extension */
      if (Anchors[i].hasAttribute("download") || extensions.includes(ext)) {
        Anchors[i].addEventListener("click", fDl, { passive: true });
      }

    }
  }
});

// file download Event

function fDl(e) {
  enFdl = true;
  const urlCurrent = e.currentTarget.getAttribute("href");
  const fileCurrent = urlCurrent.substring(urlCurrent.lastIndexOf("/") + 1);
  const extCurrent = fileCurrent.split(".").pop();
  const filename = fileCurrent.replace("." + extCurrent, "");
  const targetText = e.currentTarget.text;
  const splitOrigin = urlCurrent.replace(docLoc.origin, "");
  // fire analytics script
  a(extCurrent, filename, targetText, splitOrigin);
  enFdl = false;
}
