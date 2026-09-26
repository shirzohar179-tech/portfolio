/* Shared data for the demo site. Every price, duration and group size is a
   placeholder (shown in [brackets]) until the studio sends its real details.
   Availability is sample data generated from today's date. */
(function () {
  var MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
  var DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  var DAY_LETTERS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

  var WORKSHOPS = {
    open: { id: "open", name: "סדנה פתוחה", sub: "מצטרפים לקבוצה קטנה במועד קבוע.", dur: "[2.5] שעות", min: 1, max: 8 },
    priv: { id: "priv", name: "סדנה פרטית", sub: "רק אתם והמדריכה: זוג, משפחה או חברות.", dur: "[2.5] שעות", min: 2, max: 6 }
  };

  // Price is per vessel; each participant engraves one vessel.
  var VESSELS = [
    { id: "wine", name: "כוס יין", note: "[נפח / גובה]", price: 120 },
    { id: "mug", name: "כוס בירה", note: "[נפח / גובה]", price: 110 },
    { id: "bottle", name: "בקבוק", note: "[נפח / גובה]", price: 150 },
    { id: "jar", name: "צנצנת עם מכסה", note: "[נפח / גובה]", price: 130 },
    { id: "mirror", name: "מראה עגולה", note: "[קוטר]", price: 180 }
  ];

  // Sample weekly schedule: Tuesday evening, Thursday and Friday.
  var SLOT_TIMES = { 2: ["18:30"], 4: ["10:00", "18:30"], 5: ["10:00", "12:30"] };
  var ENDS = { "10:00": "12:30", "12:30": "15:00", "18:30": "21:00" };
  var BOOK_AHEAD_DAYS = 120;

  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function parseIso(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function dayIndex(d) { return Math.round((d - new Date(d.getFullYear(), 0, 1)) / 864e5); }

  function isFull(d) { return dayIndex(d) % 11 === 3; }
  function dayStatus(d) {
    var t = today();
    if (d <= t || d > addDays(t, BOOK_AHEAD_DAYS)) return "none";
    if (!SLOT_TIMES[d.getDay()]) return "none";
    return isFull(d) ? "full" : "open";
  }
  function seatsLeft(d, i) { return ((d.getDate() * 3 + i * 5) % 7) + 1; }
  function slotsFor(d, wid) {
    if (dayStatus(d) !== "open") return [];
    return SLOT_TIMES[d.getDay()].map(function (t, i) {
      return { index: i, time: t, end: ENDS[t], left: wid === "priv" ? WORKSHOPS.priv.max : seatsLeft(d, i) };
    });
  }
  function nextSlots(n) {
    var out = [], d = addDays(today(), 1);
    for (var k = 0; k < BOOK_AHEAD_DAYS && out.length < n; k++, d = addDays(d, 1)) {
      slotsFor(d, "open").forEach(function (s) { if (out.length < n) out.push({ date: new Date(d), slot: s }); });
    }
    return out;
  }
  function longDate(d) { return "יום " + DAYS[d.getDay()] + ", " + d.getDate() + " ב" + MONTHS[d.getMonth()]; }
  function shortDate(d) { return d.getDate() + "." + (d.getMonth() + 1); }
  function seatsText(n) { return n === 1 ? "מקום אחרון" : "נשארו " + n + " מקומות"; }

  window.Studio = {
    MONTHS: MONTHS, DAYS: DAYS, DAY_LETTERS: DAY_LETTERS, WORKSHOPS: WORKSHOPS, VESSELS: VESSELS,
    today: today, addDays: addDays, iso: iso, parseIso: parseIso, dayStatus: dayStatus, slotsFor: slotsFor,
    nextSlots: nextSlots, longDate: longDate, shortDate: shortDate, seatsText: seatsText, BOOK_AHEAD_DAYS: BOOK_AHEAD_DAYS
  };
})();
