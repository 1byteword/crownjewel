import{t as p}from"./tuning-BSksSO7E.js";import{P as u,b as S}from"./math-FVHgnPaj.js";import{r as g,E as l,M as P,D as c}from"./run-Bu_niw_1.js";const a=t=>document.querySelector(t),k=t=>["","I","II","III","IV","V"][t]??String(t),I={forest:"Wildwood",ruins:"Ashen Ruins",fortress:"Fortress",throne:"Throne"},A={axe:'<path d="M6 20 17 9M13 5c3-2 7 0 7 4-2-1-4-1-6 1-1-2-1-3-1-5Z"/>',drop:'<path d="M12 3c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12Z"/>',spark:'<path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4"/>',fang:'<path d="M4 5h16l-3 5-2-3-3 11-3-11-2 3Z"/>',chevrons:'<path d="m5 6 6 6-6 6M12 6l6 6-6 6"/>',bolt:'<path d="M13 2 5 14h6l-1 8 8-12h-6Z"/>',wing:'<path d="M3 18c4-1 7-4 9-9 1 5 4 8 9 9-5 1-8 0-9-3-1 3-4 4-9 3Z"/>',shield:'<path d="M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6Z"/>',echo:'<path d="M4 19 16 7M8 20 20 8M4 12l6-6"/>',skull:'<path d="M6 16V11a6 6 0 0 1 12 0v5l-2 1v3H8v-3Z"/><circle cx="9.5" cy="12" r="1.3"/><circle cx="14.5" cy="12" r="1.3"/>',wind:'<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h8"/>',mirror:'<path d="M12 3 20 12 12 21 4 12Z M12 7l5 5-5 5"/>',fist:'<path d="M7 10V6h10v4M7 10h10v6l-3 4H9l-2-4Z"/>',flame:'<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9Z"/>',heart:'<path d="M12 20S4 15 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11Z"/>'},w=(t,e=24)=>`<img class="icon gen" src="art/gen/icon-${t}.png" width="${e}" height="${e}" alt="" onerror="this.outerHTML=this.dataset.svg" data-svg='${E(t,e)}'>`,E=(t,e=24)=>`<svg class="icon" width="${e}" height="${e}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">${A[u[t].icon]}</svg>`,M=t=>`#${t.toString(16).padStart(6,"0")}`,L=`<div class="controls-grid">
  <span>Move</span><b>WASD</b><span>Aim</span><b>Mouse</b>
  <span>Light attack</span><b>Left click · J</b><span>Heavy attack</span><b>Q · K · middle click</b>
  <span>Guard (tap = parry)</span><b>Right click · E · L</b><span>Dodge</span><b>Space · Shift</b>
  <span>Pause</span><b>Esc</b></div>`;function x(t){return l.map((e,s)=>{const n=t?s<t.stage?"done":s===t.stage?"now":"":"";return`<i class="pip ${e.boss?"boss":e.arena} ${n}" title="${e.title}"></i>`}).join("")}function T(t){const e=t.stats,s=Math.floor(e.time/60),n=Math.floor(e.time%60);return`<dl class="stats">
    <dt>Difficulty</dt><dd>${c[t.difficulty].name}</dd>
    <dt>Reached</dt><dd>${t.stage+1} / ${l.length}</dd>
    <dt>Time</dt><dd>${s}:${String(n).padStart(2,"0")}</dd>
    <dt>Foes slain</dt><dd>${e.kills}</dd>
    <dt>Parries</dt><dd>${e.parries}</dd>
    <dt>Perfect dodges</dt><dd>${e.perfectDodges}</dd>
    <dt>Damage dealt</dt><dd>${Math.round(e.damageDealt)}</dd>
    <dt>Damage taken</dt><dd>${Math.round(e.damageTaken)}</dd></dl>`}function y(t){return t.picks.length?`<ul class="boon-list">${Object.keys(t.perks).map(e=>`<li style="--c:${M(u[e].colour)}">${w(e,18)}<span>${u[e].name}</span>${(t.perks[e]??0)>1?`<b>${k(t.perks[e])}</b>`:""}</li>`).join("")}</ul>`:'<p class="muted">No boons taken.</p>'}let v=()=>{},f=()=>{};const i={difficulty:"knight",init(t){try{const e=localStorage.getItem("blade-difficulty"),s=new URLSearchParams(location.search).get("difficulty");s&&s in c?i.difficulty=s:e&&e in c&&(i.difficulty=e)}catch{}v=t.start,f=t.title,a("#overlay").innerHTML=`
      <section id="hud" hidden>
        <div class="hud-player">
          <div class="portrait generated" style="--portrait:url(${new URL("art/gen/portrait-player.png",document.baseURI)})"></div>
          <div class="bars">
            <div class="meter hp"><i id="hp"></i><span id="hp-text"></span></div>
            <div class="meter st"><i id="st"></i></div>
            <div class="meter po"><i id="po"></i></div>
          </div>
        </div>
        <div class="hud-run"><div class="pips" id="pips"></div><div id="stage-name"></div></div>
        <div class="hud-foes" id="foes"></div>
        <ul class="hud-boons" id="boons"></ul>
      </section>
      <section id="bossbar" hidden><img class="boss-portrait" src="art/gen/portrait-boss.png" alt=""><h3 id="boss-name"></h3><div class="meter boss"><i id="boss-hp"></i><b class="phase-mark"></b></div><div class="meter boss-po"><i id="boss-po"></i></div></section>
      <div id="vignette"></div>
      <div id="banner" hidden></div>
      <div id="callout" aria-live="polite"></div>
      <aside id="debug" hidden><h3>DEBUG · F2</h3><pre id="debug-readout"></pre></aside>
      <div id="screen" hidden></div>`},show(t,e){a(t).hidden=!e},title(){i.show("#hud",!1),i.show("#bossbar",!1);const t=g.load();i.screen(`
      <div class="title-card">
        <p class="kicker">A sword-and-posture roguelite</p>
        <h1>Blade Study</h1>
        <h2>The Gilded Warden</h2>
        <p class="lede">Cut through the Wildwood, the Ashen Ruins and the Warden's Fortress. Read every windup, break their guard, and take what the fallen leave behind.</p>
        <div class="difficulty" role="radiogroup" aria-label="Difficulty">${Object.keys(c).map(e=>`<button role="radio" aria-checked="${e===i.difficulty}" data-diff="${e}"><b>${c[e].name}</b><small>${c[e].text}</small></button>`).join("")}</div>
        <div class="menu">
          <button id="start" class="primary">Begin a run</button>
          <button id="how">How to fight</button>
          <button id="settings">Sound</button>
        </div>
        <p class="record">${t.runs?`Runs ${t.runs} · Victories ${t.wins} · Furthest ${t.best?l[Math.min(t.best,l.length-1)].title:"—"}`:"Seven encounters. One Warden. Death ends the run."}</p>
      </div>`,"title"),a("#start").onclick=()=>v(),document.querySelectorAll("[data-diff]").forEach(e=>{e.onclick=()=>{i.difficulty=e.dataset.diff;try{localStorage.setItem("blade-difficulty",i.difficulty)}catch{}document.querySelectorAll("[data-diff]").forEach(s=>s.setAttribute("aria-checked",String(s===e)))}}),a("#how").onclick=()=>i.howTo(()=>i.title()),a("#settings").onclick=()=>i.sound(()=>i.title())},howTo(t){i.screen(`<div class="panel wide"><h2>How to fight</h2>${L}
      <ul class="tips">
        <li><b>Posture</b> is the fight. Blocks, parries and heavy hits fill the gold bar; a full bar breaks the guard and opens a long window for heavy punishment.</li>
        <li><b>Parry</b> by tapping guard as the blade arrives. Perfect parries stagger most foes and crush the Warden's posture.</li>
        <li><b>Red diamonds</b> mark unblockable attacks: dodge through them, or get out of the line.</li>
        <li><b>Whiffs</b> are punished on both sides. A lancer that misses its thrust is wide open; so are you.</li>
        <li>Blastcap charges hurt everyone in the circle, the sapper's friends included.</li>
        <li>Between encounters choose one <b>boon</b> of three. They change how you fight, not just numbers.</li>
      </ul><div class="menu"><button id="back" class="primary">Back</button></div></div>`),a("#back").onclick=t},sound(t,e){const s=["master","music","weapon","impact","ambience"].map(o=>`<label><span>${o==="weapon"?"swings":o==="impact"?"impacts":o}</span><input type="range" min="0" max="1" step="0.01" value="${p.audio[o]}" data-audio="${o}"></label>`).join(""),n=e?.audio??window.gameAudio;i.screen(`<div class="panel"><h2>Sound</h2><div class="sliders">${s}</div>
      <div class="menu"><button id="mute">${n?.enabled===!1?"Unmute":"Mute all"}</button><button id="back" class="primary">Back</button></div></div>`),document.querySelectorAll("[data-audio]").forEach(o=>{o.oninput=()=>{p.audio[o.dataset.audio]=Number(o.value),n?.mix(),R()}}),a("#mute").onclick=()=>{n&&(n.start(),n.enabled=!n.enabled,n.mix(),R(),a("#mute").textContent=n.enabled?"Mute all":"Unmute")},a("#back").onclick=t},screen(t,e){const s=a("#screen");s.hidden=!1,s.style.setProperty("--scene",e?`url(${new URL(`art/gen/scene-${e}.png`,document.baseURI)})`:"none"),s.classList.toggle("scenic",!!e),s.innerHTML=t,s.classList.remove("in"),s.offsetWidth,s.classList.add("in")},closeModal(){a("#screen").hidden=!0,a("#screen").innerHTML=""},encounterBanner(t,e){i.closeModal(),i.show("#hud",!0),i.show("#bossbar",!1),a("#pips").innerHTML=x(e),a("#stage-name").textContent=`${I[t.arena]} · ${t.title}`,i.renderBoons(e.perks);const s=a("#banner");s.hidden=!1,s.className=t.boss?"boss":"",s.innerHTML=`<img class="vignette" src="art/gen/vignette-${t.id}.png" alt=""><small>${t.boss?"Final encounter":`Encounter ${e.stage+1} of ${l.length}`}</small><h2>${t.title}</h2><p>${t.subtitle}</p>`,s.classList.remove("in"),s.offsetWidth,s.classList.add("in"),setTimeout(()=>s.hidden=!0,2600)},renderBoons(t){a("#boons").innerHTML=Object.keys(t).map(e=>`<li style="--c:${M(u[e].colour)}" title="${u[e].name}: ${S(e,t[e])}">${w(e,20)}${t[e]>1?`<b>${k(t[e])}</b>`:""}</li>`).join("")},hud(t){if(a("#hud").hidden)return;const e=t.battle.player;a("#hp").style.setProperty("--v",String(e.hp/e.maxHp*100/100)),a("#hp-text").textContent=`${Math.ceil(e.hp)} / ${e.maxHp}`,a("#st").style.setProperty("--v",String(e.stamina/100)),a("#po").style.setProperty("--v",String(e.posture/e.postureMax*100/100)),a("#hud").classList.toggle("low",e.hp<e.maxHp*.3);const s=t.battle.living.filter(r=>r.arch.id!=="boss").length,n=t.battle.waves.reduce((r,b)=>r+b.spawns.length,0);a("#foes").textContent=t.state==="cleared"?"Cleared":s+n?`Foes ${s}${n?` · +${n} coming`:""}`:"";const o=t.battle.living.find(r=>r.arch.id==="boss");o&&(a("#boss-hp").style.setProperty("--v",String(o.hp/o.maxHp*100/100)),a("#boss-po").style.setProperty("--v",String(o.posture/o.postureMax*100/100)),a("#bossbar").classList.toggle("phase2",o.phase>1),a("#bossbar").classList.toggle("broken",o.mode==="posture-broken"))},bossBar(t){i.show("#bossbar",!!t),t&&(a("#boss-name").textContent=t.arch.name)},callout(t,e){const s=a("#callout");s.textContent=t,s.dataset.kind=e,s.classList.remove("show"),s.offsetWidth,s.classList.add("show")},hurt(){const t=a("#vignette");t.classList.remove("hurt"),t.offsetWidth,t.classList.add("hurt")},reward(t,e){const s=t.offer(3),n=l[t.stage];i.screen(`<div class="reward">
      <p class="kicker">Encounter cleared · mended ${Math.round(P*100)}% · ${Math.ceil(t.hp)} / ${t.maxHp} health</p>
      <h2>Choose a boon</h2>
      <div class="cards">${s.map((d,m)=>{const h=u[d],$=t.perks[d]??0;return`<button class="card ${h.rarity}" data-id="${d}" style="--c:${M(h.colour)}">
            <span class="key">${m+1}</span>
            <span class="glyph">${w(d,40)}</span>
            <span class="name">${h.name}${$?` <em>${k($+1)}</em>`:""}</span>
            <span class="tags"><i>${h.rarity}</i><i>${h.style}</i></span>
            <span class="text">${S(d,$+1)}</span>
          </button>`}).join("")}</div>
      <p class="next"><img class="vignette" src="art/gen/vignette-${n.id}.png" alt="">Next: <b>${n.title}</b> — ${n.subtitle}</p>
      <div class="pips big">${x(t)}</div></div>`);let o=!1;const r=d=>{o||(o=!0,t.take(d),window.gameAudio?.chime(),document.querySelector(`[data-id="${d}"]`)?.classList.add("chosen"),window.removeEventListener("keydown",b),setTimeout(e,420))},b=d=>{const m=Number(d.key)-1;s[m]&&r(s[m])};window.addEventListener("keydown",b),new URLSearchParams(location.search).has("bot")&&setTimeout(()=>r(s[0]),1600),document.querySelectorAll(".card").forEach(d=>d.onclick=()=>r(d.dataset.id))},pause(t){i.screen(`<div class="panel"><h2>Paused</h2>
      ${t.run?`<p class="muted">${t.run.encounter.title} · encounter ${t.run.stage+1} of ${l.length}</p>${y(t.run)}`:""}
      ${L}
      <div class="menu"><button id="resume" class="primary">Resume</button><button id="sound">Sound</button><button id="abandon">Abandon run</button></div></div>`),a("#resume").onclick=()=>t.setPaused(!1),a("#sound").onclick=()=>i.sound(()=>i.pause(t),t),a("#abandon").onclick=()=>{t.run&&g.save(t.run.stage,!1),f()}},defeat(t){t.stats.deaths++;const e=g.save(t.stage,!1);i.show("#hud",!1),i.show("#bossbar",!1),i.screen(`<div class="panel result defeat"><p class="kicker">Run over</p><h2>Fallen at ${t.encounter.title}</h2>
      ${T(t)}${y(t)}
      <p class="muted">Runs ${e.runs} · Victories ${e.wins}</p>
      <div class="menu"><button id="again" class="primary">Try again</button><button id="menu">Title</button></div></div>`,"defeat"),a("#again").onclick=()=>v(),a("#menu").onclick=()=>f()},victory(t){const e=g.save(l.length,!0);i.show("#hud",!1),i.show("#bossbar",!1),i.screen(`<div class="panel result victory"><p class="kicker">Victory</p><h2>The Gilded Warden has fallen</h2>
      <p class="lede">The throne room is quiet. Whatever he was guarding, it's yours to decide now.</p>
      ${T(t)}${y(t)}
      <p class="muted">Runs ${e.runs} · Victories ${e.wins}</p>
      <div class="menu"><button id="again" class="primary">New run</button><button id="menu">Title</button></div></div>`,"victory"),a("#again").onclick=()=>v(),a("#menu").onclick=()=>f()},debug(t){i.show("#debug",t)},debugText(t){a("#debug-readout").textContent=t}};function R(){try{const t=window.gameAudio;localStorage.setItem("blade-audio",JSON.stringify({...p.audio,enabled:t?.enabled??!0}))}catch{}}function W(){try{const t=JSON.parse(localStorage.getItem("blade-audio")??"{}");for(const e of Object.keys(p.audio))typeof t[e]=="number"&&(p.audio[e]=t[e]);return t.enabled!==!1}catch{return!0}}export{W as loadAudio,R as saveAudio,i as ui};
