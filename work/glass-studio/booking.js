/* Booking flow: workshop → date & time → vessels (one per participant) → details → confirmation.
   The price is the sum of the vessels picked. Nothing is sent anywhere (portfolio demo). */
(function () {
  var S = window.Studio;
  var $ = function (id) { return document.getElementById(id); };
  var LABELS = ["סדנה", "מועד", "כלים", "פרטים"];
  var GLYPH = { open: "g-wine", priv: "g-bottle" };

  var state = { step: 1, wid: null, date: null, slot: null, qty: {}, month: null };

  // Deep links from the home page: ?w=open&d=YYYY-MM-DD&s=0
  var params = new URLSearchParams(location.search);
  if (S.WORKSHOPS[params.get("w")]) state.wid = params.get("w");
  var linkedDate = S.parseIso(params.get("d"));
  if (state.wid && linkedDate && S.dayStatus(linkedDate) === "open") {
    state.date = linkedDate;
    var s = parseInt(params.get("s"), 10);
    if (S.slotsFor(linkedDate, state.wid)[s]) { state.slot = s; state.step = 3; }
    else state.step = 2;
  } else if (state.wid) {
    state.step = 2;
  }
  var first = state.date || S.addDays(S.today(), 1);
  state.month = new Date(first.getFullYear(), first.getMonth(), 1);

  function workshop() { return state.wid ? S.WORKSHOPS[state.wid] : null; }
  function slots() { return state.date ? S.slotsFor(state.date, state.wid) : []; }
  function currentSlot() { return state.slot === null ? null : slots()[state.slot] || null; }
  function q(id) { return state.qty[id] || 0; }
  function people() { return S.VESSELS.reduce(function (n, v) { return n + q(v.id); }, 0); }
  function total() { return S.VESSELS.reduce(function (n, v) { return n + q(v.id) * v.price; }, 0); }
  function maxPeople() {
    var w = workshop(), sl = currentSlot();
    if (!w) return 8;
    return sl ? Math.min(w.max, sl.left) : w.max;
  }
  function itemsLine() {
    return S.VESSELS.filter(function (v) { return q(v.id) > 0; }).map(function (v) { return q(v.id) + " × " + v.name; }).join(", ");
  }
  function money(n) { return n.toLocaleString("he-IL") + " ₪"; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function glyph(id, w, h) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "glyph"); svg.setAttribute("width", w); svg.setAttribute("height", h); svg.setAttribute("aria-hidden", "true");
    svg.style.strokeWidth = "3";
    var use = document.createElementNS(ns, "use"); use.setAttribute("href", "#" + id); svg.appendChild(use);
    return svg;
  }
  function icon(id) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "icon"); svg.setAttribute("width", "18"); svg.setAttribute("height", "18"); svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS(ns, "use"); use.setAttribute("href", "#" + id); svg.appendChild(use);
    return svg;
  }
  function priceRange() {
    var p = S.VESSELS.map(function (v) { return v.price; });
    return "[" + Math.min.apply(null, p) + "]–[" + Math.max.apply(null, p) + "] ₪ לפי הכלי";
  }

  /* ---------- Step 1: workshop ---------- */
  function renderWorkshops() {
    var box = $("ws-list"); box.innerHTML = "";
    Object.keys(S.WORKSHOPS).forEach(function (id) {
      var w = S.WORKSHOPS[id];
      var b = el("button", "choice"); b.type = "button";
      b.setAttribute("aria-pressed", state.wid === id ? "true" : "false");
      var thumb = el("span", "tile thumb"); thumb.appendChild(glyph(GLYPH[id], 40, 53)); b.appendChild(thumb);
      var txt = el("span", "txt");
      var top = el("span"); top.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:8px";
      top.appendChild(el("span", "name", w.name)); top.appendChild(el("span", "radio-dot"));
      txt.appendChild(top);
      txt.appendChild(el("span", "muted", w.sub));
      var meta = el("span", "meta");
      meta.appendChild(el("span", null, w.dur));
      meta.appendChild(el("span", null, priceRange()));
      meta.appendChild(el("span", null, w.min > 1 ? "מינימום [" + w.min + "]" : "אפשר גם לבד"));
      txt.appendChild(meta);
      b.appendChild(txt);
      b.addEventListener("click", function () { state.wid = id; state.slot = null; render(); });
      box.appendChild(b);
    });
  }

  /* ---------- Step 2: calendar + time ---------- */
  function renderCalendar() {
    var m = state.month, y = m.getFullYear(), mo = m.getMonth();
    $("cal-title").textContent = S.MONTHS[mo] + " " + y;
    var t = S.today();
    $("cal-prev").disabled = y < t.getFullYear() || (y === t.getFullYear() && mo <= t.getMonth());
    var last = S.addDays(t, S.BOOK_AHEAD_DAYS);
    $("cal-next").disabled = new Date(y, mo + 1, 1) > last;

    var grid = $("cal-days"); grid.innerHTML = "";
    var lead = new Date(y, mo, 1).getDay();
    for (var i = 0; i < lead; i++) grid.appendChild(el("span"));
    var days = new Date(y, mo + 1, 0).getDate();
    for (var d = 1; d <= days; d++) {
      (function (date) {
        var st = S.dayStatus(date);
        var b = el("button", "day" + (st === "open" ? " open" : st === "full" ? " full" : ""), String(date.getDate()));
        b.type = "button";
        b.disabled = st !== "open";
        var sel = state.date && S.iso(state.date) === S.iso(date);
        b.setAttribute("aria-pressed", sel ? "true" : "false");
        b.setAttribute("aria-label", S.longDate(date) + (st === "open" ? ", יש מקום" : st === "full" ? ", מלא" : ", אין סדנה"));
        b.addEventListener("click", function () { state.date = date; state.slot = null; render(); $("slots-title").scrollIntoView({ block: "nearest", behavior: "smooth" }); });
        grid.appendChild(b);
      })(new Date(y, mo, d));
    }

    var list = slots();
    $("slots-box").hidden = !list.length;
    if (!list.length) return;
    $("slots-title").textContent = "שעות פנויות · " + S.longDate(state.date);
    var box = $("slots"); box.innerHTML = "";
    list.forEach(function (sl) {
      var b = el("button", "slot"); b.type = "button";
      b.setAttribute("aria-pressed", state.slot === sl.index ? "true" : "false");
      var a = el("span"); a.appendChild(el("span", "t", sl.time)); a.appendChild(el("span", "muted", sl.time + "–" + sl.end));
      b.appendChild(a);
      b.appendChild(el("span", "left" + (sl.left <= 2 && state.wid !== "priv" ? " low" : ""), state.wid === "priv" ? "פנוי" : S.seatsText(sl.left)));
      b.addEventListener("click", function () { state.slot = sl.index; render(); });
      box.appendChild(b);
    });
  }

  /* ---------- Step 3: vessels ---------- */
  function renderVessels() {
    var box = $("vessel-list"); box.innerHTML = "";
    var n = people(), max = maxPeople(), w = workshop();
    S.VESSELS.forEach(function (v, i) {
      var row = el("div", "vrow" + (q(v.id) ? " on" : ""));
      var thumb = el("span", "tile thumb" + (i % 2 ? " tile--sand" : "")); thumb.appendChild(glyph("g-" + v.id, 34, 45)); row.appendChild(thumb);
      var txt = el("span", "txt");
      txt.appendChild(el("strong", null, v.name)); txt.appendChild(el("span", "muted", v.note)); txt.appendChild(el("span", "p", "[" + v.price + "] ₪"));
      row.appendChild(txt);
      var st = el("span", "stepper");
      var plus = el("button"); plus.type = "button"; plus.appendChild(icon("i-plus"));
      plus.setAttribute("aria-label", "להוסיף " + v.name); plus.disabled = n >= max;
      plus.addEventListener("click", function () { if (people() < maxPeople()) { state.qty[v.id] = q(v.id) + 1; render(); } });
      var out = el("output", null, String(q(v.id))); out.setAttribute("aria-label", "כמות " + v.name);
      var minus = el("button"); minus.type = "button"; minus.appendChild(icon("i-minus"));
      minus.setAttribute("aria-label", "להוריד " + v.name); minus.disabled = q(v.id) === 0;
      minus.addEventListener("click", function () { if (q(v.id) > 0) { state.qty[v.id] = q(v.id) - 1; render(); } });
      st.appendChild(plus); st.appendChild(out); st.appendChild(minus);
      row.appendChild(st);
      box.appendChild(row);
    });

    var hint = $("vessel-hint"), min = w ? w.min : 1;
    hint.className = "hint-line";
    if (n > max) { hint.textContent = "במועד הזה נשארו רק " + max + " מקומות"; hint.className += " warn"; }
    else if (n < min && min > 1) { hint.textContent = "בסדנה פרטית בוחרים לפחות " + min + " כלים"; if (n) hint.className += " warn"; }
    else if (!n) hint.textContent = "בחרו כלי לכל משתתף";
    else hint.textContent = n + " משתתפים · עד " + max + " במועד הזה";

    var lines = $("vessel-lines"); lines.innerHTML = "";
    S.VESSELS.forEach(function (v) {
      if (!q(v.id)) return;
      var d = el("div"); d.appendChild(el("dt", null, q(v.id) + " × " + v.name + " · [" + v.price + "] ₪")); d.appendChild(el("dd", null, money(q(v.id) * v.price)));
      lines.appendChild(d);
    });
    if (n) { var tot = el("div", "total"); tot.appendChild(el("dt", null, "סה״כ")); tot.appendChild(el("dd", null, money(total()))); lines.appendChild(tot); }
  }

  /* ---------- Steps 4–5: summaries ---------- */
  function renderSummaries() {
    var w = workshop(), sl = currentSlot();
    var s4 = $("sum4"); s4.innerHTML = "";
    if (w && sl) {
      s4.appendChild(el("strong", null, w.name + " · " + people() + " משתתפים"));
      s4.appendChild(el("span", null, itemsLine()));
      s4.appendChild(el("span", null, S.longDate(state.date) + " · " + sl.time + "–" + sl.end));
    }
    var s5 = $("sum5"); s5.innerHTML = "";
    if (!w || !sl) return;
    [["סדנה", w.name], ["מתי", S.longDate(state.date) + " · " + sl.time], ["משתתפים", String(people())], ["כלים", itemsLine()], ["איפה", "[רחוב ומספר, עיר]"]].forEach(function (r) {
      var d = el("div"); d.appendChild(el("dt", null, r[0])); d.appendChild(el("dd", null, r[1])); s5.appendChild(d);
    });
    var tot = el("div", "total"); tot.appendChild(el("dt", null, "לתשלום")); tot.appendChild(el("dd", null, money(total()))); s5.appendChild(tot);
  }

  /* ---------- Frame: progress, back, bottom bar ---------- */
  function canContinue() {
    var w = workshop();
    if (state.step === 1) return !!w;
    if (state.step === 2) return !!currentSlot();
    if (state.step === 3) { var n = people(); return !!w && n >= w.min && n <= maxPeople() && n > 0; }
    return true;
  }
  function render() {
    var step = state.step, w = workshop();
    document.querySelectorAll("[data-step]").forEach(function (sec) { sec.hidden = +sec.getAttribute("data-step") !== step; });
    $("bk-head").hidden = step === 5;
    $("bk-bar").hidden = step === 5;
    $("bk-count").textContent = Math.min(step, 4) + "/4";
    $("bk-home").hidden = step !== 1;
    $("bk-back").hidden = step === 1;
    document.querySelectorAll("#bk-progress li").forEach(function (li, i) {
      li.className = i + 1 < step ? "done" : i + 1 === step ? "current" : "";
      if (i + 1 === step) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });

    if (step === 1) renderWorkshops();
    if (step === 2) renderCalendar();
    if (step === 3) renderVessels();
    if (step >= 4) renderSummaries();

    var top = "", bottom = "", sl = currentSlot();
    if (step === 1) { top = w ? w.name : "שלב 1 מתוך 4"; bottom = w ? "המחיר לפי הכלי" : "בחרו סדנה"; }
    if (step === 2) { top = w ? w.name : ""; bottom = sl ? S.shortDate(state.date) + " · " + sl.time : "בחרו יום ושעה"; }
    if (step === 3) { top = people() ? people() + " משתתפים" : "בחרו כלי לכל משתתף"; bottom = "סה״כ " + money(total()); }
    if (step === 4) { top = "לתשלום [בסטודיו]"; bottom = "סה״כ " + money(total()); }
    $("sum-top").textContent = top;
    $("sum-bottom").textContent = bottom;
    var next = $("bk-next");
    next.textContent = step === 4 ? "שריון המקום" : "המשך";
    next.disabled = !canContinue();
  }
  function go(step) {
    state.step = step;
    if (step === 2 && state.date) state.month = new Date(state.date.getFullYear(), state.date.getMonth(), 1);
    render();
    window.scrollTo(0, 0);
    var h = document.querySelector('[data-step="' + step + '"] h1');
    if (h) h.focus({ preventScroll: true });
  }

  $("bk-next").addEventListener("click", function () {
    if (!canContinue()) return;
    if (state.step === 4) {
      var form = $("details");
      if (!form.reportValidity()) return;
    }
    go(state.step + 1);
  });
  $("bk-back").addEventListener("click", function () { go(Math.max(1, state.step - 1)); });
  $("cal-prev").addEventListener("click", function () { state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1); renderCalendar(); });
  $("cal-next").addEventListener("click", function () { state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1); renderCalendar(); });

  // Add to calendar: a small .ics file (floating local time).
  $("add-cal").addEventListener("click", function () {
    var sl = currentSlot(); if (!sl) return;
    var ymd = S.iso(state.date).replace(/-/g, "");
    var stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    var ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//glass-studio-demo//HE", "BEGIN:VEVENT",
      "UID:" + ymd + "-" + sl.time.replace(":", "") + "@glass-studio-demo",
      "DTSTAMP:" + stamp,
      "DTSTART:" + ymd + "T" + sl.time.replace(":", "") + "00",
      "DTEND:" + ymd + "T" + sl.end.replace(":", "") + "00",
      "SUMMARY:סדנת חריטה על זכוכית – " + workshop().name,
      "LOCATION:[רחוב ומספר, עיר]",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = "glass-workshop.ics";
    document.body.appendChild(a); a.click(); a.remove();
  });

  render();
})();
