/* ==========================================================================
   五十嵐 諒 | 事業ポータル  共通スクリプト
   --------------------------------------------------------------------------
   新しいページでもこのファイルを読み込めば、ヘッダーのメニュー、リンク設定、
   フッターの年表示が共通で動きます。存在しない要素の処理は自動でスキップされます。
   ========================================================================== */

/* ---------- ★ここだけ編集すればOK：連絡先・リンク設定 ---------- */
const CONFIG = {
  // data-link="…" を付けた <a> の href が、ここのURLに置き換わります（ヘッダー・ヒーローのボタン用）
  // 各事業カードのリンクは、index.html の各カード内の href を直接書き換えてください
  links: {
    instagram: "https://www.instagram.com/",   // TODO: 自分のInstagramのURL
    line: "https://lin.ee/",                   // TODO: LINE公式アカウントのURL
  },
};

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- リンクの差し込み ---------- */
  $$("[data-link]").forEach((el) => {
    const url = CONFIG.links[el.dataset.link];
    if (url) el.setAttribute("href", url);
  });

  /* ---------- フッターの年 ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- ヘッダー：スクロール時の境界線 ---------- */
  const header = $("#site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- モバイルメニュー ---------- */
  const toggle = $(".nav-toggle");
  const menu = $("#site-menu");
  if (toggle && menu) {
    const setMenu = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
      menu.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---------- 現在位置のメニュー強調 ---------- */
  const navLinks = $$(".site-nav__link");
  if (navLinks.length && "IntersectionObserver" in window) {
    const map = new Map();
    navLinks.forEach((a) => {
      const id = a.getAttribute("href");
      if (id && id.startsWith("#")) {
        const target = $(id);
        if (target) map.set(target, a);
      }
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = map.get(entry.target);
          if (link) link.classList.toggle("is-active", entry.isIntersecting);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    map.forEach((_, section) => io.observe(section));
  }

  /* ---------- Services：カテゴリ切り替え ---------- */
  const tabs = $$(".tab");
  const grid = $("#service-grid");
  const cards = $$(".service-card");

  const selectTab = (filter, { focus = false } = {}) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.filter === filter;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active) {
        if (grid) grid.setAttribute("aria-labelledby", tab.id);
        if (focus) tab.focus();
        tab.scrollIntoView({ block: "nearest", inline: "center" });
      }
    });
    cards.forEach((card) => {
      const show = filter === "all" || card.dataset.category === filter;
      card.hidden = !show;
      card.classList.remove("is-entering");
      if (show) {
        void card.offsetWidth; // アニメーションを再始動
        card.classList.add("is-entering");
      }
    });
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab.dataset.filter));
    tab.addEventListener("keydown", (e) => {
      const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (dir) {
        e.preventDefault();
        selectTab(tabs[(i + dir + tabs.length) % tabs.length].dataset.filter, { focus: true });
      }
    });
  });

  /* ヒーロー下のチップ：該当カテゴリを開いて事業内容へ移動 */
  $$("[data-jump]").forEach((chip) => {
    chip.addEventListener("click", () => {
      selectTab(chip.dataset.jump);
      const section = $("#services");
      if (section) section.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- Services：カードの詳細展開 ---------- */
  cards.forEach((card, i) => {
    const head = $(".service-card__head", card);
    const panel = $(".service-card__panel", card);
    if (!head || !panel) return;

    const panelId = `service-panel-${i + 1}`;
    panel.id = panelId;
    head.setAttribute("aria-controls", panelId);
    head.setAttribute("aria-expanded", "false");

    head.addEventListener("click", () => {
      const open = !card.classList.contains("is-open");
      card.classList.toggle("is-open", open);
      head.setAttribute("aria-expanded", String(open));
    });
  });
})();
