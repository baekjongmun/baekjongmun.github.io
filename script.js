/* =========================================================
   백군시스템에어컨 — 인터랙션
   ========================================================= */
(function () {
  "use strict";

  var header = document.getElementById("siteHeader");
  var toTop = document.getElementById("toTop");
  var navToggle = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  var yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 스크롤 상태 ---------- */
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle("is-scrolled", y > 12);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- 모바일 메뉴 ---------- */
  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    if (navToggle) navToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("is-locked");
    var first = mobileMenu.querySelector("nav a");
    if (first) first.focus();
  }
  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.focus();
    }
    document.body.classList.remove("is-locked");
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      if (mobileMenu && mobileMenu.classList.contains("is-open")) closeMenu();
      else openMenu();
    });
  }
  if (mobileMenu) {
    mobileMenu.addEventListener("click", function (e) {
      var t = e.target.closest("[data-menu-close], nav a");
      if (t) {
        e.preventDefault();
        var href = t.getAttribute("href");
        closeMenu();
        if (href && href.charAt(0) === "#") {
          var target = document.querySelector(href);
          if (target) {
            window.setTimeout(function () {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 60);
          }
        }
      }
    });
  }

  /* ---------- 등장 애니메이션 ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---------- 시공사례 필터 ---------- */
  var filterButtons = Array.prototype.slice.call(
    document.querySelectorAll("[data-filter]")
  );
  var cases = Array.prototype.slice.call(document.querySelectorAll(".case"));

  function applyFilter(value) {
    cases.forEach(function (card) {
      var show = value === "all" || card.getAttribute("data-cat") === value;
      card.hidden = !show;
      if (show && !card.classList.contains("is-in")) {
        card.classList.add("is-in");
      }
    });
    filterButtons.forEach(function (btn) {
      var on = btn.getAttribute("data-filter") === value;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyFilter(btn.getAttribute("data-filter"));
    });
  });

  /* ---------- 라이트박스 ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbTitle = document.getElementById("lbTitle");
  var lbCount = document.getElementById("lbCount");
  var lbCaption = document.getElementById("lbCaption");
  var lbThumbs = document.getElementById("lbThumbs");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var lbClose = document.getElementById("lbClose");

  var currentList = [];
  var currentIndex = 0;
  var lastTrigger = null;

  function render(index) {
    if (!currentList.length) return;
    currentIndex = (index + currentList.length) % currentList.length;
    var item = currentList[currentIndex];
    lbImg.src = item.src;
    lbImg.alt = item.alt || "";
    lbCaption.textContent = item.caption || "";
    lbCount.textContent = currentIndex + 1 + " / " + currentList.length;

    var multi = currentList.length > 1;
    lbPrev.style.display = multi ? "" : "none";
    lbNext.style.display = multi ? "" : "none";

    var thumbs = lbThumbs.querySelectorAll("button");
    for (var i = 0; i < thumbs.length; i++) {
      thumbs[i].setAttribute(
        "aria-current",
        i === currentIndex ? "true" : "false"
      );
    }

    /* 다음 이미지 미리 불러오기 */
    if (multi) {
      var nextItem = currentList[(currentIndex + 1) % currentList.length];
      var pre = new Image();
      pre.src = nextItem.src;
    }
  }

  function openLightbox(card, trigger) {
    var tpl = card.querySelector("template");
    if (!tpl) return;
    var items = Array.prototype.slice
      .call(tpl.content.querySelectorAll("[data-src]"))
      .map(function (a) {
        return {
          src: a.getAttribute("data-src"),
          caption: a.getAttribute("data-caption") || "",
          alt: a.getAttribute("data-alt") || ""
        };
      });
    if (!items.length) return;

    currentList = items;
    lastTrigger = trigger || null;

    var place = card.querySelector(".case__place");
    var title = card.querySelector("h3");
    lbTitle.textContent =
      (place ? place.textContent.trim() : "시공사례") +
      (title ? " · " + title.textContent.trim() : "");

    lbThumbs.innerHTML = "";
    items.forEach(function (item, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", (i + 1) + "번째 사진 보기");
      b.addEventListener("click", function () {
        render(i);
      });
      var img = document.createElement("img");
      img.src = item.src;
      img.alt = "";
      img.loading = "lazy";
      b.appendChild(img);
      lbThumbs.appendChild(b);
    });

    render(0);
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    if (lbClose) lbClose.focus();
  }

  function closeLightbox() {
    if (!lb.classList.contains("is-open")) return;
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    lbImg.removeAttribute("src");
    if (lastTrigger) lastTrigger.focus();
  }

  Array.prototype.slice
    .call(document.querySelectorAll("[data-case-open]"))
    .forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = btn.closest(".case");
        if (card) openLightbox(card, btn);
      });
    });

  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbPrev)
    lbPrev.addEventListener("click", function () {
      render(currentIndex - 1);
    });
  if (lbNext)
    lbNext.addEventListener("click", function () {
      render(currentIndex + 1);
    });
  if (lb) {
    lb.addEventListener("click", function (e) {
      if (e.target === lb) closeLightbox();
    });
    /* 사진을 좌우로 밀어 넘기기 (모바일) */
    var startX = null;
    lb.addEventListener(
      "touchstart",
      function (e) {
        if (e.touches.length === 1) startX = e.touches[0].clientX;
      },
      { passive: true }
    );
    lb.addEventListener(
      "touchend",
      function (e) {
        if (startX === null) return;
        var dx = (e.changedTouches[0] || {}).clientX - startX;
        if (Math.abs(dx) > 45) render(currentIndex + (dx < 0 ? 1 : -1));
        startX = null;
      },
      { passive: true }
    );
  }

  document.addEventListener("keydown", function (e) {
    if (lb && lb.classList.contains("is-open")) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        render(currentIndex - 1);
      } else if (e.key === "ArrowRight") {
        render(currentIndex + 1);
      }
      return;
    }
    if (e.key === "Escape" && mobileMenu && mobileMenu.classList.contains("is-open")) {
      closeMenu();
    }
  });
})();
