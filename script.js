/* _ever.visuals — interactions & animations */
(function () {
  "use strict";

  /* ---------- brand preloader ---------- */
  const preloader = document.getElementById("preloader");
  const hideLoader = () => preloader.classList.add("is-done");
  if (document.readyState === "complete") {
    setTimeout(hideLoader, 350);
  } else {
    window.addEventListener("load", () => setTimeout(hideLoader, 350));
  }
  setTimeout(hideLoader, 4000); // fail-safe

  /* ---------- nav: scroll state + mobile menu ---------- */
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.querySelector(".nav__links");

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- scroll reveal ---------- */
  const stagger = (i) => 0 + (i % 4) * 0.1;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("is-visible");
        if (el.dataset.group) {
          el.querySelectorAll(".reveal").forEach((c, i) => (c.style.transitionDelay = stagger(i) + "s"));
        }
        observer.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => {
    if (el.matches(".grid, .steps, .quotes")) el.dataset.group = "1";
    observer.observe(el);
  });

  /* ---------- animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        count(entry.target);
        countObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => countObserver.observe(el));

  function count(el) {
    const target = +el.dataset.count;
    const dur = 1500;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- hero rotating word ---------- */
  const wordEl = document.getElementById("wordRotate");
  const words = ["scroll", "share", "double-tap", "convert", "sell"];
  let wi = 0;

  const swap = () => {
    wi = (wi + 1) % words.length;
    wordEl.animate([{ opacity: 0, transform: "translateY(0.5em)" }, { opacity: 1 }], {
      duration: 450,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    }).onfinish = () => {
      wordEl.textContent = words[wi];
    };
  };
  setInterval(swap, 2600);

  /* ---------- reels carousel ---------- */
  const track = document.getElementById("reelsTrack");
  const prevBtn = document.getElementById("reelsPrev");
  const nextBtn = document.getElementById("reelsNext");
  const bar = document.getElementById("reelsBar");
  const cards = [...track.children];
  const cardStep = () => cards[0].getBoundingClientRect().width + 24; // width + gap

  const updateProgress = () => {
    const max = track.scrollWidth - track.clientWidth;
    const pct = max > 0 ? (track.scrollLeft / max) * 100 : 0;
    bar.style.width = pct + "%";
  };

  const go = (dir) => {
    track.scrollBy({ left: dir * cardStep(), behavior: "smooth" });
  };

  prevBtn.addEventListener("click", () => go(-1));
  nextBtn.addEventListener("click", () => go(1));
  track.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* drag-to-scroll */
  let down = false;
  let startX = 0;
  let startScroll = 0;

  track.addEventListener("pointerdown", (e) => {
    down = true;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.classList.add("is-dragging");
  });
  window.addEventListener("pointermove", (e) => {
    if (!down) return;
    track.scrollLeft = startScroll - (e.clientX - startX);
  });
  window.addEventListener("pointerup", () => {
    down = false;
    track.classList.remove("is-dragging");
  });
  track.addEventListener("dragstart", (e) => e.preventDefault());

  /* ---------- reel play buttons ---------- */
  track.querySelectorAll(".reel").forEach((reel) => {
    const media = reel.querySelector(".reel__media");
    const btn = reel.querySelector(".reel__play");
    const video = reel.querySelector("video");

    // load the real file from data-src; if missing, keep the tinted placeholder
    const src = video.dataset.src;
    const toPlaceholder = () => {
      video.removeAttribute("src");
      video.load();
      btn.classList.remove("is-playing");
    };
    video.addEventListener("error", toPlaceholder);
    if (src) {
      video.src = src;
      video.load();
    }
    video.addEventListener("ended", () => btn.classList.remove("is-playing"));

    const pulse = () => {
      media.animate(
        [{ transform: "scale(0.98)" }, { transform: "scale(1)" }],
        { duration: 260, easing: "cubic-bezier(0.22,1,0.36,1)" }
      );
    };

    const toggle = () => {
      if (!video.hasAttribute("src") || video.readyState < 1) {
        pulse();
        return;
      }
      if (video.paused) {
        video.play();
        btn.classList.add("is-playing");
      } else {
        video.pause();
        btn.classList.remove("is-playing");
      }
    };

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });
    video.addEventListener("click", toggle);
  });
})();