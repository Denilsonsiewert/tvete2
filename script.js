// Atualiza DATA e HORA
function tickClock() {
  const d = new Date(), pad = n => String(n).padStart(2,'0');
  document.getElementById('dateValue').textContent = `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
  document.getElementById('timeValue').textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
setInterval(tickClock, 1000); tickClock();

// Controle de telas
let telas = [], idx = 0, timer = null;

function criarTela(id, titulo, sub="") {
  const s = document.createElement('section'); s.className = 'screen'; s.id = id;
  const p = document.createElement('div'); p.className = 'panel';
  const h = document.createElement('div'); h.className = 'panel-header';
  h.innerHTML = `<div class="panel-title">${titulo}</div><div class="panel-sub">${sub}</div>`;
  p.appendChild(h); s.appendChild(p); return s;
}

function montarDots() {
  const d = document.getElementById('dots'); d.innerHTML = '';
  telas.forEach((_,i)=>{ const dot=document.createElement('div'); dot.className='dot'+(i===idx?' active':''); d.appendChild(dot); });
}

function mostrarTela(i) { telas.forEach((t,ix)=> t.classList.toggle('active', ix===i)); idx=i; montarDots(); }
function iniciarRotacao() {
  mostrarTela(0);
  if(timer) clearInterval(timer);
  timer = setInterval(()=>{ mostrarTela((idx+1)%telas.length); }, 20000);
}

function limpar() { document.getElementById('app').innerHTML=''; document.getElementById('dots').innerHTML=''; telas=[]; idx=0; if(timer) clearInterval(timer); }

// Monta telas
function criarTelaDetalhamento(d) {
  const s = criarTela('t-detalhes','Detalhamento por Tanque','Visão completa do processo');
  const panel = s.querySelector('.panel');

  const wrap = document.createElement('div'); wrap.className='table-wrap';
  wrap.innerHTML = `<table aria-label="Tabela de tanques">
    <thead><tr><th>Tanque</th><th>Última</th><th>Próxima</th><th>Status</th></tr></thead>
    <tbody></tbody>
  </table>`;
  panel.appendChild(wrap);

  const tbody = wrap.querySelector('tbody');
  (d.tanques||[]).forEach(t=>{
    let statusClass = t.status==='OK'?'status-ok':t.status==='Em Análise'?'status-analise':'status-atrasado';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${t.nomeTopo}<br>${t.nome}</td><td>${t.ultima}</td><td>${t.proxima}</td><td class="${statusClass}">${t.status}</td>`;
    tbody.appendChild(tr);
  });

  return s;
}

function telaObservacoes(d) {
  const obs = d.observacoes||[]; if(!obs.length) return null;
  const s = criarTela('t-obs','Observações Recentes','Eventos importantes');
  const panel = s.querySelector('.panel');
  const list = document.createElement('div'); list.className='obs-list';
  obs.forEach(o=>{
    const card = document.createElement('div'); card.className='obs-card';
    card.innerHTML = `<div class="obs-meta">${o.data} • ${o.setor}</div><h4>${o.responsavel}</h4><div class="obs-desc">${o.descricao}</div>`;
    list.appendChild(card);
  });
  panel.appendChild(list);
  return s;
}

// Monta tudo
async function montar(d) {
  limpar();
  const app = document.getElementById('app');
  [criarTelaDetalhamento(d), telaObservacoes(d)].forEach(t=>{ if(t){ app.appendChild(t); telas.push(t); } });
  montarDots(); if(telas.length) iniciarRotacao();
}

// Carrega JSON local
async function carregar() {
  try {
    const resp = await fetch('resumo.json', {cache:'no-cache'});
    if(!resp.ok) throw new Error('HTTP '+resp.status);
    const dados = await resp.json();
    montar(dados);
  } catch(e) {
    console.error('Falha ao carregar JSON:', e);
  }
}

// Atualiza automaticamente
setInterval(carregar, 300000); // 5 min
carregar();

// Navegação manual
document.addEventListener('keydown', (ev)=>{
  if(!telas.length) return;
  if(ev.key==='ArrowRight') mostrarTela((idx+1)%telas.length);
  else if(ev.key==='ArrowLeft') mostrarTela((idx-1+telas.length)%telas.length);
});
