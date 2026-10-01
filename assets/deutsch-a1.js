/* Deutsch A1 · Übungen — sin dependencias */
(() => {
  "use strict";

  /* Cada ejercicio está abierto de `desde` a `hasta`, ambos días incluidos. */
  const UEBUNGEN = [
    {
      slug: "johannes-frisch",
      href: "johannes-frisch.html",
      titel: "Johannes Frisch hat keinen Tisch",
      tema: "Una canción para oír el Akkusativ: einen, eine, keinen, keine.",
      libro: "Kursbuch, S. 44",
      desde: "2026-09-30",
      hasta: "2026-10-07"
    }
  ];

  const root = document.documentElement;
  const TZ = "America/Mexico_City";
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ── Fecha de hoy (?fecha=AAAA-MM-DD para ver otro día) ── */
  function hoy() {
    const q = new URLSearchParams(location.search).get("fecha");
    if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) return q;
    return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  }
  function largo(iso, conDia = true) {
    const d = new Date(iso + "T12:00:00");
    const opts = conDia ? { weekday: "long", day: "numeric", month: "long" } : { day: "numeric", month: "long" };
    return d.toLocaleDateString("es-MX", opts);
  }
  const abierto = (u, h) => u.desde <= h && h <= u.hasta;
  const HOY = hoy();

  /* ── Tema claro/oscuro ── */
  const themeBtn = document.getElementById("themeBtn");
  function pintaTema() {
    if (!themeBtn) return;
    const dark = root.dataset.theme === "dark";
    themeBtn.textContent = dark ? "☀" : "☾";
    themeBtn.setAttribute("aria-label", dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      store.set("deutsch-a1-theme", root.dataset.theme);
      pintaTema();
    });
    pintaTema();
  }

  /* ── Imprimir y QR ── */
  const printBtn = document.getElementById("printBtn");
  if (printBtn) printBtn.addEventListener("click", () => window.print());
  const qrBtn = document.getElementById("qrBtn"), qrModal = document.getElementById("qrModal");
  if (qrBtn && qrModal && qrModal.showModal) {
    qrBtn.addEventListener("click", () => qrModal.showModal());
    qrModal.addEventListener("click", e => { if (e.target === qrModal) qrModal.close(); });
  }

  /* ── Barra de hoy ── */
  const elHoy = document.getElementById("hoy");
  if (elHoy) elHoy.textContent = largo(HOY);

  /* ── Portada: ejercicios abiertos ── */
  const lista = document.getElementById("ulist");
  if (lista) {
    const abiertos = UEBUNGEN.filter(u => abierto(u, HOY));
    const n = document.getElementById("nAbiertos");
    if (n) n.textContent = abiertos.length === 1 ? "1 ejercicio" : abiertos.length + " ejercicios";
    const prox = document.getElementById("proxEntrega");
    if (prox) prox.textContent = abiertos.length ? largo(abiertos.map(u => u.hasta).sort()[0]) : "—";
    lista.innerHTML = abiertos.length
      ? abiertos.map(u =>
          '<a class="ucard" href="' + u.href + location.search + '">' +
          '<span class="label c-der">' + u.libro + '</span>' +
          '<h3>' + u.titel + '</h3>' +
          '<p>' + u.tema + '</p>' +
          '<span class="due">Hasta el ' + largo(u.hasta) + '</span></a>').join("")
      : '<div class="card empty"><p>Por ahora no hay ejercicios abiertos. El siguiente llega después de la próxima clase.</p></div>';
  }

  /* ── Página de un ejercicio: se muestra solo en su ventana ── */
  const slug = document.body.dataset.uebung;
  const u = UEBUNGEN.find(x => x.slug === slug);
  const zona = document.getElementById("contenido");
  if (u && zona) {
    const hasta = document.getElementById("hasta");
    if (hasta) hasta.textContent = largo(u.hasta);
    if (abierto(u, HOY)) {
      zona.replaceWith(document.getElementById("tpl").content.cloneNode(true));
      document.dispatchEvent(new CustomEvent("uebung:abierta"));
    } else {
      const antes = HOY < u.desde;
      zona.innerHTML =
        '<section class="section"><div class="wrap"><div class="card closed">' +
        '<span class="label c-die">' + (antes ? "Noch nicht" : "Geschlossen") + '</span>' +
        '<h2>' + (antes ? "Se abre el " + largo(u.desde) + "." : "Estuvo abierto del " + largo(u.desde, false) + " al " + largo(u.hasta, false) + ".") + '</h2>' +
        '<p><a class="btn" href="./' + location.search + '">Ver los ejercicios abiertos</a></p>' +
        '</div></div></section>';
      const est = document.getElementById("estado");
      if (est) est.textContent = antes ? "Todavía no abre" : "Cerrado";
    }
  }
})();
