/** @license Copyright (c) 2018-2021 by Stephen R. van den Berg <srb@cuci.nl> */

/** @define {number} */ var DEBUG = 1;
/** @define {number} */ var ALERTS = 0;
                            // error context length
/** @define {number} */ var RUNTIMEDEBUG = 64;
/** @define {number} */ var MEASUREMENT = 0;
/** @define {number} */ var ASSERT = 1;
/** @define {number} */ var VERBOSE = 0;

// Cut BEGIN delete
(() =>
{ "use strict";
// Cut END delete

  // Cut BEGIN for externs
  // Cut BEGIN for prepend
  // Cut END for prepend
  // Cut END for externs
  // Cut BEGIN for prepend
  // Cut END for prepend

  const O = Object;
  const Mat = Math;

  const /** !Object */ g =
  { 
  };

  const /** !RegExp */ gmtrx = /.+GMT([+-]\d+).+/;
  const /** !RegExp */ tzrx = /.+\((.+?)\)$/;
  const /** !RegExp */ varentrx =
   /^([-+0]+)?([1-9][0-9]*)?(?:\.([0-9]+))?(t([^%]*%.+)|[a-zA-Z]|[A-Z]{3})?$/;
  const /** !RegExp */ alphanumsrx = /%([A-Za-z%])/g;
  const /** !RegExp */ spacesrx = /\s+/g;

  const /** !Object */ currencyobj
   = {"EUR":"\u20AC", "USD":"$", "CNY":"\u00A5"};

  function udate(t) { return t.valueOf() - t.getTimezoneOffset * 60000; }

  function /** string */ pad0(/** number */ i, /** number */ p)
  { return (i + "").padStart(p, "0");
  }

  function /** string */
   strftime(/** string */ fmt, /** !Date|string */ d, /** string */ lang)
  { var t, j1, ut;
    if (!(d instanceof Date))
    { t = d.match && /[A-Za-z]/.test(d);
      d = new Date(d);
      if (t)
        d = new Date(2 * d.valueOf() - udate(t));	// Adjust to localtime
    }
    var dy = d.getDay(), md = d.getDate(), m = d.getMonth(),
     y = d.getFullYear(), h = d.getHours(), h24 = 86400000;
    function /** string */ ifm(/** string= */ t, /** string= */ f)
    { var o = {};
      o[t || "weekday"] = f || "short";
      return new Intl.DateTimeFormat(lang, o)
        .format(/** @type {!Date|number|undefined} */(d));
    }
    function thu()
    { var t = new Date(d);
      t.setDate(md - ((dy + 6) % 7) + 3);
      return t;
    }
    return fmt.replace(alphanumsrx, (a, p) =>
    { switch(p)
      { case "a": return ifm();
        case "A": return ifm(undefined, "long");
        case "b": return ifm("month");
        case "B": return ifm("month", "long");
        case "G": return thu().getFullYear();
        case "g": return (thu().getFullYear() + "").slice(2);
        case "k": return h;
        case "n": return m + 1;
        case "e": return md;
        case "d": return pad0(md, 2);
        case "H": return pad0(h, 2);
        case "j": return pad0(Mat.floor((udate(d) - udate(Date(y))) / h24) + 1,
                                3);
        case "C": return Mat.floor(y / 100);
        case "s": return Mat.round(d.valueOf() / 1000);
        case "l": return (h + 11) % 12 + 1;
        case "I": return pad0((h + 11) % 12 + 1, 2);
        case "m": return pad0(m + 1, 2);
        case "M": return pad0(d.getMinutes(), 2);
        case "S": return pad0(d.getSeconds(), 2);
        case "p": return h<12 ? "AM" : "PM";
        case "P": return h<12 ? "am" : "pm";
        case "%": return "%";
        case "R": return strftime("%H:%M", d, lang);
        case "T": return strftime("%H:%M:%S", d, lang);
        case "V":
          t = thu(); ut = t.valueOf(); t.setMonth(0, 1);
          if ((j1 = t.getDay()) !== 4)
            t.setMonth(0, 1 + (11 - j1) % 7);
          return pad0(1 + Mat.ceil((ut - t) / (h24 * 7)), 2);
        case "u": return dy || 7;
        case "w": return dy;
        case "Y": return y;
        case "y": return (y + "").slice(2);
        case "F": return d.toISOString().slice(0, 10);
        case "c": return d.toUTCString();
        case "x": return d.toLocaleDateString();
        case "X": return d.toLocaleTimeString();
        case "z": return d.toTimeString().match(gmtrx)[1];
        case "Z": return d.toTimeString().match(tzrx)[1];
      }
      return a;
    });
  }

  function /** string */ sp(/** string */ j, /** string */ s)
  { if (j[0] === "0")
      j[0] = s;
    else
      j = s + j;
    return j;
  }

  function /** string */
   fmtf(/** number */ k, /** string */ s, /** number */  d)
  { var /** string */ t
     = /** @type {function(string=, Object=):string} */(k.toLocaleString)(s,
        {"minimumFractionDigits": d, "maximumFractionDigits": d});
    if (t == k)
    { s = "";
      if (k < 0)
        s = "-", k = -k;
      t = Mat.round(k * Mat.pow(10, d)) + "";
      while (t.length <= d)
        t = "0" + t;
      d = t.length - d; t = s + t.substr(0, d) + "." + t.substr(d);
    }
    return t;
  }

  function /** string */
   fmtcur(/** number */ k, /** string */ lang, /** string */ cur)
  { var /** string */ t
     = /** @type {function(string=, Object=):string} */(k.toLocaleString)(lang,
        {"style":"currency", "currency":cur});
    if (t == k)
      t = (currencyobj[cur] || cur)
        + fmtf(k, lang, 2);
    return t.replace(spacesrx, "\u00A0");
  }

  function /** * */ procfmt(/** string */ fmt,/** * */ x,/** !Object */ $)
  { var /** Array<string> */ r = fmt.match(varentrx);
    var p = r[3], lang = $["sys"] && $["sys"]["lang"] || undefined;
    switch (r[4])
    { case "c": x = String.fromCharCode(+x); break;
      case "d": x = parseInt(x, 10).toLocaleString(); break;
      case "e":
        x = /** @type {function((null|string)):string} */
         ((+x).toExponential)(p > "" ? p : null);
        break;
      case "f":
        if (!(p > ""))
          p = 6;
        x = fmtf(+x, lang, /** @type {number} */(p));
        break;
      case "g": x = /** @type {function((number|string)):string} */
         ((+x).toPrecision)(p > "" ? p : 6); break;
      case "x": x = (parseInt(x, 10) >>> 0).toString(16); break;
      case "s":
        if (p > "")
          x = x.substr(0, p);
        break;
      default:
        x = r[4][0] === "t"
            ? strftime(r[5], /** @type {string} */(x), lang)
            : /[A-Z]{3}/.test(r[4]) ? fmtcur(+x, lang, r[4]) : x;
    }
    if (r[1])
    { if (r[1].indexOf("0") >= 0 && (p = +r[2]))
        x = +x < 0 ? sp(pad0(- /** @type {number} */(x), p), "-")
                   : pad0(/** @type {number} */(x), p);
      if (r[1].indexOf("+") >= 0 && +x >= 0)
        x = sp(/** @type {string} */(x), "+");
    }
    return x;
  }

  function /** !Object */ factory(/** !Object */ rxml)
  { rxml["set_proc_fmt"](procfmt);
    return g;
  }

  const /** string */ rxs = "remixml";

  if (typeof define == "function" && define["amd"])
    define("remixml-fmt", [rxs], factory);
  else if (typeof exports == "object")
    O.assign(/** @type{!Object} */(exports),
     factory(require(rxs)));
  else {
    var W = window;
    W["Remixmlfmt"] = factory(W["Remixml"]);
  }

// Cut BEGIN delete
}).call(this);
// Cut BEGIN end
