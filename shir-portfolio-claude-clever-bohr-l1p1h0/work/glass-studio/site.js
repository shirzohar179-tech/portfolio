/* Menu toggle, the "next dates" strip and demo form handling. */
(function () {
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
    });
  }

  var list = document.getElementById("next-dates");
  if (list && window.Studio) {
    var S = window.Studio;
    list.innerHTML = "";
    S.nextSlots(4).forEach(function (x) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "date-card";
      a.href = "booking.html?w=open&d=" + S.iso(x.date) + "&s=" + x.slot.index;
      a.innerHTML =
        '<span class="d"></span><span class="muted"></span><strong>סדנה פתוחה</strong><span class="left"></span>';
      a.querySelector(".d").textContent = S.shortDate(x.date);
      a.querySelector(".muted").textContent = "יום " + S.DAYS[x.date.getDay()] + " · " + x.slot.time;
      a.querySelector(".left").textContent = S.seatsText(x.slot.left);
      a.setAttribute("aria-label", S.longDate(x.date) + ", " + x.slot.time + ", " + S.seatsText(x.slot.left));
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  // This is a portfolio demo: forms are not sent anywhere.
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var note = form.querySelector(".form-note");
      if (note) { note.hidden = false; note.focus(); }
    });
  });

  document.querySelectorAll(".chips").forEach(function (group) {
    group.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      group.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
    });
  });
})();
