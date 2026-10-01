/* Johannes Frisch hat keinen Tisch — huecos y estrofa propia */
document.addEventListener("uebung:abierta", () => {
  "use strict";
  const KEY = "deutsch-a1-johannes-frisch";
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  };
  const data = store.get();
  const gaps = [...document.querySelectorAll("#huecos .gap")];
  const estado = document.getElementById("estado");
  const score = document.getElementById("score");

  const norm = s => (s || "").toLowerCase().trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "");
  const sols = g => g.dataset.sol.split("|").map(norm);
  const good = g => sols(g).includes(norm(g.value));

  function guarda() {
    data.gaps = gaps.map(g => g.value);
    store.set(data);
    const llenos = gaps.filter(g => g.value.trim()).length;
    estado.textContent = llenos + " de " + gaps.length;
  }
  function corrige() {
    let ok = 0;
    gaps.forEach(g => {
      const vacio = !g.value.trim(), bien = good(g);
      g.classList.toggle("ok", bien);
      g.classList.toggle("bad", !bien && !vacio);
      if (bien) ok++;
    });
    score.textContent = ok + " / " + gaps.length + (ok === gaps.length ? " · Super!" : "");
  }

  (data.gaps || []).forEach((v, i) => { if (gaps[i]) gaps[i].value = v; });
  guarda();

  gaps.forEach(g => {
    g.addEventListener("input", () => { g.classList.remove("ok", "bad"); guarda(); });
    g.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); corrige(); } });
  });
  document.getElementById("btnCheck").addEventListener("click", corrige);
  document.getElementById("btnSol").addEventListener("click", () => {
    gaps.forEach(g => { g.value = g.dataset.sol.split("|")[0]; g.classList.add("ok"); g.classList.remove("bad"); });
    score.textContent = "";
    guarda();
  });
  document.getElementById("btnReset").addEventListener("click", () => {
    gaps.forEach(g => { g.value = ""; g.classList.remove("ok", "bad"); });
    score.textContent = "";
    guarda();
  });

  /* Estrofa propia */
  const vName = document.getElementById("vName"), vSatz = document.getElementById("vSatz");
  const verse = document.getElementById("verse"), copied = document.getElementById("copied");
  const texto = () => {
    const n = vName.value.trim(), s = vSatz.value.trim().replace(/[.!]+$/, "");
    return n || s ? (n || "…") + " " + (s || "…") + "." : "";
  };
  function pinta() {
    verse.textContent = texto();
    data.name = vName.value; data.satz = vSatz.value; store.set(data);
  }
  vName.value = data.name || ""; vSatz.value = data.satz || "";
  [vName, vSatz].forEach(i => i.addEventListener("input", pinta));
  pinta();
  document.getElementById("btnCopy").addEventListener("click", () => {
    const t = texto();
    if (!t) return;
    const ok = () => { copied.textContent = "Copiada"; setTimeout(() => { copied.textContent = ""; }, 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok, () => {});
  });
});
