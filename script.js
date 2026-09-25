(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Split headings into animated words ---------- */
  document.querySelectorAll("[data-split]").forEach((el) => {
    let i = 0;
    const wrapWords = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span");
            w.className = "w";
            const inner = document.createElement("span");
            inner.style.setProperty("--i", i++);
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          wrapWords(child);
        }
      });
    };
    wrapWords(el);
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal, [data-split]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Count-up numbers ---------- */
  const countUp = (el) => {
    const target = +el.dataset.count;
    if (reduceMotion || target === 0) { el.textContent = target; return; }
    const dur = 1600, start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 4)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); countIO.unobserve(e.target); } });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => countIO.observe(el));

  window.addEventListener("load", () => document.body.classList.add("loaded"));
  setTimeout(() => document.body.classList.add("loaded"), 1200);

  /* ---------- Nav: scrolled state, progress, active link ---------- */
  const nav = document.getElementById("nav");
  const links = [...document.querySelectorAll(".nav-links a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    root.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
    let current = null;
    sections.forEach((s) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.4) current = s.id; });
    links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
    ticking = false;
  };
  window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".nav-toggle");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  links.forEach((a) => a.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }));

  /* ---------- Pointer effects (desktop only) ---------- */
  if (finePointer && !reduceMotion) {
    // Cursor spotlight
    window.addEventListener("pointermove", (e) => {
      root.style.setProperty("--mx", e.clientX + "px");
      root.style.setProperty("--my", e.clientY + "px");
    }, { passive: true });

    // 3D tilt + glare
    document.querySelectorAll(".tilt").forEach((el) => {
      const max = el.classList.contains("product") ? 7 : 10;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--ry", ((px - 0.5) * max).toFixed(2) + "deg");
        el.style.setProperty("--rx", ((0.5 - py) * max).toFixed(2) + "deg");
        el.style.setProperty("--gx", px * 100 + "%");
        el.style.setProperty("--gy", py * 100 + "%");
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });

    // Hero parallax on floating cards
    const hero = document.querySelector("[data-parallax-root]");
    const cards = hero ? [...hero.querySelectorAll("[data-depth]")] : [];
    document.querySelector(".hero").addEventListener("pointermove", (e) => {
      const cx = e.clientX / window.innerWidth - 0.5;
      const cy = e.clientY / window.innerHeight - 0.5;
      cards.forEach((c) => {
        const d = +c.dataset.depth;
        c.style.setProperty("--tx", (-cx * d).toFixed(1) + "px");
        c.style.setProperty("--ty", (-cy * d).toFixed(1) + "px");
      });
    });

    // Magnetic buttons
    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty("--bx", ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px");
        btn.style.setProperty("--by", ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px");
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.setProperty("--bx", "0px");
        btn.style.setProperty("--by", "0px");
      });
    });
  }

  /* ---------- Use-case filter tabs ---------- */
  const tabs = [...document.querySelectorAll(".tabs button")];
  const pill = document.querySelector(".tab-pill");
  const cases = [...document.querySelectorAll(".case")];
  const movePill = (btn) => {
    pill.style.width = btn.offsetWidth + "px";
    pill.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop - 5}px)`;
  };
  tabs.forEach((btn) => btn.addEventListener("click", () => {
    tabs.forEach((b) => b.setAttribute("aria-selected", b === btn));
    movePill(btn);
    const f = btn.dataset.filter;
    cases.forEach((c) => c.classList.toggle("dim", f !== "all" && c.dataset.cat !== f));
  }));
  const selected = () => tabs.find((b) => b.getAttribute("aria-selected") === "true");
  movePill(selected());
  window.addEventListener("resize", () => movePill(selected()));
  document.fonts && document.fonts.ready.then(() => movePill(selected()));

  /* ---------- Contact form -> email ---------- */
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll("[required]").forEach((f) => {
      const valid = f.value.trim() && (f.type !== "email" || /^\S+@\S+\.\S+$/.test(f.value));
      f.closest(".field").classList.toggle("invalid", !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      note.textContent = "Please fill in your name, a valid email and a message.";
      note.className = "form-note err";
      return;
    }
    const d = new FormData(form);
    const subject = `[${d.get("topic")}] Message from ${d.get("name")}`;
    const body = `${d.get("message")}\n\n— ${d.get("name")} (${d.get("email")})`;
    window.location.href = `mailto:support@dhronas.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = "Your email app should open now. Thanks for reaching out!";
    note.className = "form-note ok";
  });
})();
