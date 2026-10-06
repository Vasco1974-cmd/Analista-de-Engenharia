/* Analista de Engenharia: fluxo de análise do contrato (Novo Projeto + 7 etapas).
   Aparece abaixo de "Parâmetros do Contrato Salvos com Sucesso!". */
(function () {
  const g = id => document.getElementById(id);
  const v = id => { const e = g(id); return e ? parseFloat(e.value) || 0 : 0; };
  const n2 = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const n0 = n => n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  const np = n => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  const fm = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const mi = n => 'R$ ' + np(n / 1e6) + (n / 1e6 >= 2 ? ' milhões' : ' milhão');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const RISC = ['Capital de giro', 'Produtividade', 'Prazo', 'Mão de obra', 'Suprimentos'];
  const MEDS = ['Readequar cronograma', 'Negociar prazo', 'Reavaliar custos', 'Reforçar equipe', 'Criar plano de suprimentos', 'Criar plano de controle de caixa', 'Monitorar produtividade', 'Solicitar aditivo contratual'];
  const STEPS = ['Análise Econômica', 'Prazo e Produtividade', 'Custos e Margem', 'Capital de Giro', 'Matriz de Riscos', 'Tomada de Decisão', 'Emitir Parecer'];
  const DEC = ['AUTORIZAR OIS', 'AUTORIZAR OIS COM RESSALVAS', 'VETO TÉCNICO TEMPORÁRIO'];
  const DCOL = ['bg-emerald-600 hover:bg-emerald-700', 'bg-amber-500 hover:bg-amber-600', 'bg-rose-600 hover:bg-rose-700'];
  const DICO = ['🟢', '🟡', '🔴'];
  const CUSTOS = [['c1', 'Mão de obra própria'], ['c2', 'Materiais'], ['c3', 'Equipamentos'], ['c4', 'Terceirização'], ['c5', 'Administração'], ['c6', 'Mobilização / canteiro'], ['c7', 'Outros custos']];
  const DESEMB = [['d1', 'Custo estimado de mobilização'], ['d2', 'Custo de infraestrutura provisória'], ['d3', 'Equipamentos / instalações iniciais'], ['d4', 'Mão de obra inicial'], ['d5', 'Outros desembolsos iniciais']];
  const REQ = { 1: ['preco', 'mrg', 't1'], 2: ['pm', 'ac', 'pc', 'an2'], 3: ['an3'], 4: ['an4'], 5: ['rp', 'j5'], 6: ['fe', 'fo', 'fr', 'fm2', 'pf'] };
  const RAD = { 2: ['cls'], 3: ['mrgok'], 4: ['pres'] };
  const FICHA = [['Valor do contrato', 'valor'], ['Área', 'area'], ['Prazo', 'prazo'], ['Venda/m²', 'pm2'], ['Margem inicial', 'mrgIni'], ['Produção média', 'prodMed'], ['Produção últimos 3 meses', 'prodConc'], ['Custo projetado', 'cust'], ['Margem projetada', 'mproj'], ['Risco principal', 'risco']];

  const A = { max: 1, cur: 1, dec: '', built: false, pid: '' };
  const CAD = ['cadNome', 'cadCliente', 'cadContrato', 'cadValorLicitacao', 'cadPrazo', 'cadArea'];
  const Z = { cust: 0, des: 0, ok: {} };
  let D = {};

  /* ---------- pedaços de HTML ---------- */
  const IN = 'w-full mt-1 p-2 border rounded-lg bg-white', LB = 'font-bold text-slate-600';
  const grid = (c, a) => `<div class="grid grid-cols-1 md:grid-cols-${c} gap-3">${a.join('')}</div>`;
  const sys = (k, l, cap) => `<div class="bg-blue-50 border border-blue-200 rounded-lg p-3"><p class="text-[10px] font-bold uppercase text-blue-700">${l}</p><p data-k="${k}" class="text-sm font-extrabold text-blue-900">—</p>${cap ? `<p class="text-[11px] text-blue-800 mt-1">${cap}</p>` : ''}</div>`;
  const lock = (k, l, cap) => `<div><label class="${LB}">${l}</label>${kpi(cap)}<div class="mt-1 p-2 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-between"><span data-k="${k}" class="font-extrabold text-slate-800">—</span><i class="fa-solid fa-lock text-slate-400 text-[10px]"></i></div></div>`;
  const kpi = f => `<p class="mt-1 px-2 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-800 font-semibold text-[11px]">${f}</p>`;
  const num = (id, l, f) => `<div><label class="${LB}">${l}</label>${f ? kpi(f) : ''}<input type="number" step="any" id="${id}" oninput="an.calc()" class="${IN}">${f ? `<p data-k="${id}_chk" class="text-xs font-bold"></p>` : ''}</div>`;
  const txt = (id, l, ro) => `<div><label class="${LB}">${l}</label><input type="text" id="${id}" ${ro ? 'readonly' : ''} class="${IN} ${ro ? 'bg-slate-100 font-bold' : ''}"></div>`;
  const ta = (id, l) => `<div><label class="${LB}">${l}</label><textarea id="${id}" rows="3" class="${IN}"></textarea></div>`;
  const rad = (nm, l, o) => `<div><p class="${LB} mb-1">${l}</p><div class="flex flex-wrap gap-4">${o.map(x => `<label class="flex items-center gap-1.5"><input type="radio" name="${nm}" value="${x}"> ${x}</label>`).join('')}</div></div>`;
  const res = k => `<div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-900"><p class="font-bold">Resultado da etapa</p><p data-k="${k}"></p></div>`;
  const bt = (t, fn) => `<button onclick="${fn}" class="no-print w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-xs shadow">${t}</button>`;
  const P = (n, t, body, btn) => `<div id="pn${n}" class="hidden space-y-4 border border-slate-200 rounded-xl p-4 bg-white"><h4 class="font-bold text-sm text-slate-800">${t}</h4>${body}<p id="msg${n}" class="text-rose-700 font-bold"></p>${btn}</div>`;
  const sel = id => `<select id="${id}" onchange="an.calc()" class="p-1.5 border rounded bg-white"><option value="">—</option><option value="1">↓ Baixa</option><option value="2">→ Média</option><option value="3">↑ Alta</option></select>`;

  function panels() {
    const p1 = P(1, '1. Análise Econômica do Contrato',
      '<p class="text-slate-500">Dados trazidos automaticamente do cadastro acima. Use a fórmula de cada KPI, calcule e digite o resultado.</p>' +
      grid(3, [sys('valor', 'Valor do contrato'), sys('area', 'Área construída'), sys('prazo', 'Prazo')]) +
      `<div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl">${num('preco', '1. Preço de venda por m² (R$/m²)', 'KPI "Preço de venda por m²" = [Valor do contrato] ÷ [Área construída]')}${num('mrg', '2. Margem bruta estimada (%)')}${lock('mrgV', 'Margem bruta estimada (R$)', 'KPI "Margem bruta" = [Valor do contrato] × [Margem bruta %]')}${lock('cmaxV', '3. Custo máximo compatível com a margem', 'KPI "Custo máximo" = [Valor do contrato] − [Margem bruta (R$)]')}</div>` +
      ta('t1', '4. Interpretação: o que esses números indicam sobre o contrato?') + res('res1'),
      bt('AVANÇAR PARA PRODUTIVIDADE →', 'an.next(1)'));

    const p2 = P(2, '2. Análise de Prazo e Produtividade',
      grid(2, [sys('area', 'Área'), sys('prazo', 'Prazo')]) +
      '<p class="text-slate-500">Use a fórmula de cada KPI, calcule e digite o resultado.</p>' +
      num('pm', 'Pergunta 1. Qual é a produção física média necessária por mês? (m²/mês)', 'KPI "Produção física média mensal" = [Área construída] ÷ [Prazo]') +
      num('ac', 'Pergunta 2. O caso informa que 20% da área poderá ficar concentrada nos últimos 3 meses. Qual área ficará concentrada nesse período? (m²)', 'KPI "Área concentrada nos últimos 3 meses" = [Área construída] × 20%') +
      num('pc', 'Pergunta 3. Qual será a produção média necessária nos últimos 3 meses? (m²/mês)', 'KPI "Produção média dos últimos 3 meses" = [Área concentrada] ÷ 3 meses') +
      rad('cls', 'Pergunta 4. Como você classifica esse cenário?', ['Confortável', 'Exige atenção', 'Alto risco de produtividade']) +
      ta('an2', 'Pergunta 5. Por que a concentração de serviços no final da obra pode ser problemática?') + res('res2'),
      bt('AVANÇAR PARA CUSTOS E MARGEM →', 'an.next(2)'));

    const p3 = P(3, '3. Análise de Custos e Margem',
      '<p class="text-slate-600">Tenho a receita do contrato. Quanto posso gastar e ainda manter a margem?</p>' +
      grid(3, [sys('valor', 'Receita contratual'), sys('mrgIni', 'Margem desejada'), sys('cmaxV', 'Custo máximo admissível', 'KPI "Custo máximo" = [Receita] × (1 − [Margem desejada])')]) +
      grid(2, CUSTOS.map(c => num(c[0], c[1] + ' (R$)'))) +
      grid(2, [sys('cust', 'Custo total projetado', 'KPI "Custo total" = soma dos 7 componentes'), sys('mproj', 'Margem projetada', 'KPI "Margem projetada" = ([Receita] − [Custo total]) ÷ [Receita]')]) +
      '<p data-k="dif" class="text-[11px] text-slate-600"></p>' +
      rad('mrgok', 'A margem projetada permanece próxima dos <span data-k="mrgIni">—</span> inicialmente estimados?', ['Sim', 'Não', 'Está em situação de alerta']) +
      ta('an3', 'Justifique sua avaliação:'),
      bt('AVANÇAR PARA CAPITAL DE GIRO →', 'an.next(3)'));

    const p4 = P(4, '4. Capital de Giro e Mobilização',
      '<p class="text-slate-600">O cronograma de mobilização inicial exige um desembolso pesado nos primeiros 60 dias. <b>Período crítico: primeiros 60 dias.</b></p>' +
      grid(2, DESEMB.map(c => num(c[0], c[1] + ' (R$)'))) +
      grid(2, [sys('desemb', 'Desembolso inicial estimado', 'KPI "Desembolso inicial" = soma dos 5 desembolsos'), sys('pdes', 'Peso sobre a receita', 'KPI "Peso do desembolso" = [Desembolso inicial] ÷ [Receita]')]) +
      rad('pres', 'Como você classifica a pressão sobre o capital de giro?', ['🟢 Baixa', '🟡 Moderada', '🟠 Alta', '🔴 Crítica']) +
      ta('an4', 'Por que o desembolso inicial pode representar um risco mesmo que o contrato seja lucrativo?'),
      bt('AVANÇAR PARA MATRIZ DE RISCOS →', 'an.next(4)'));

    const p5 = P(5, '5. Matriz de Riscos',
      `<div class="overflow-x-auto"><table class="w-full text-left"><thead><tr class="bg-slate-100 text-slate-600 font-bold"><th class="p-2">Risco</th><th class="p-2">Probabilidade</th><th class="p-2">Impacto</th><th class="p-2 text-center">Nível (P × I)</th></tr></thead><tbody>` +
      RISC.map((r, i) => `<tr class="border-b"><td class="p-2 font-bold">${r}</td><td class="p-2">${sel('p' + i)}</td><td class="p-2">${sel('i' + i)}</td><td class="p-2 text-center" id="nv${i}">—</td></tr>`).join('') +
      '</tbody></table></div>' + kpi('KPI "Nível de risco" = [Probabilidade] × [Impacto]') +
      '<p class="text-slate-600">Maior nível calculado: <b data-k="topRisk">—</b></p>' +
      `<div><label class="${LB}">Qual é o principal risco do contrato?</label><select id="rp" onchange="an.calc()" class="${IN}"><option value="">Selecionar</option>${[...RISC, 'Outro'].map(r => `<option>${r}</option>`).join('')}</select></div>` +
      `<div><p class="${LB} mb-1">Qual medida você recomenda?</p>${grid(2, MEDS.map(m => `<label class="flex items-center gap-2"><input type="checkbox" class="med rounded text-blue-600" value="${m}"> ${m}</label>`))}</div>` +
      ta('j5', 'Justificativa da medida escolhida:'),
      bt('AVANÇAR PARA TOMADA DE DECISÃO →', 'an.next(5)'));

    const p6 = P(6, '6. Tomada de Decisão',
      '<p class="font-bold text-slate-700">FICHA DE ANÁLISE</p>' +
      `<table class="w-full text-left"><thead><tr class="bg-slate-100 text-slate-600 font-bold"><th class="p-2">Indicador</th><th class="p-2">Resultado</th></tr></thead><tbody>${FICHA.map(f => `<tr class="border-b"><td class="p-2 text-slate-600">${f[0]}</td><td class="p-2 font-bold" data-k="${f[1]}">—</td></tr>`).join('')}</tbody></table>` +
      '<p class="font-bold text-slate-700 pt-2">DECISÃO SOBRE A OIS: com base na análise realizada, qual decisão você recomenda à diretoria?</p>' +
      `<div class="flex flex-col md:flex-row gap-3">${DEC.map((d, i) => `<button onclick="an.dec(${i})" class="dbtn flex-1 ${DCOL[i]} text-white font-bold py-3 rounded-xl shadow">${DICO[i]} ${d}</button>`).join('')}</div>` +
      '<div id="pBox" class="hidden space-y-3 pt-2 border-t"><p class="font-bold text-slate-800">Construa seu parecer técnico</p>' +
      txt('dd', 'Minha decisão', 1) + txt('fe', 'Principal fundamento econômico:') + txt('fo', 'Principal fundamento operacional:') +
      txt('fr', 'Principal risco identificado:') + txt('fm2', 'Medida recomendada:') + ta('pf', 'Parecer final') + '</div>',
      bt('EMITIR PARECER →', 'an.emit()'));

    const p7 = `<div id="pn7" class="hidden space-y-4 border border-slate-200 rounded-xl p-4 bg-white"><div id="areaRelatorio"></div>` +
      `<div class="no-print flex gap-3"><button onclick="window.print()" class="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs shadow"><i class="fa-solid fa-print mr-1"></i> Imprimir / Salvar em PDF</button><button onclick="an.go(6)" class="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-300">Voltar e editar</button></div></div>`;
    return p1 + p2 + p3 + p4 + p5 + p6 + p7;
  }

  /* ---------- cálculos ---------- */
  const okv = (id, e) => g(id).value !== '' && Math.abs(v(id) - e) <= Math.max(.01, Math.abs(e) * .005);
  const msg = (id, o) => g(id).value === '' ? '' : (o ? '✔ Ok! Parabéns!' : '✖ No! Refaça o cálculo.');
  const nivel = s => s >= 9 ? ['Crítico', 'bg-rose-100 text-rose-800'] : s >= 6 ? ['Alto', 'bg-orange-100 text-orange-800'] : s >= 3 ? ['Médio', 'bg-amber-100 text-amber-800'] : s >= 1 ? ['Baixo', 'bg-emerald-100 text-emerald-800'] : ['—', ''];

  function calc() {
    if (!A.built) return;
    const val = v('cadValorLicitacao'), ar = v('cadArea'), pz = v('cadPrazo'), mp = v('mrg');
    const pm2 = ar ? val / ar : 0, mR = val * mp / 100, cmax = val - mR;
    const pmed = pz ? ar / pz : 0, ac = ar * 0.2, pc = ac / 3;
    const cust = CUSTOS.reduce((s, c) => s + v(c[0]), 0), mproj = val ? (val - cust) / val * 100 : 0;
    const des = DESEMB.reduce((s, c) => s + v(c[0]), 0);
    let top = null;
    RISC.forEach((r, i) => {
      const s = v('p' + i) * v('i' + i), n = nivel(s), el = g('nv' + i);
      el.textContent = s ? `${s} · ${n[0]}` : '—';
      el.className = 'p-2 text-center font-bold ' + n[1];
      if (s && (!top || s > top.s)) top = { r, s, t: n[0] };
    });
    const okp = okv('preco', pm2), okm = okv('pm', pmed), oka = okv('ac', ac), okc = okv('pc', pc);
    Z.cust = cust; Z.des = des; Z.ok = { preco: okp, pm: okm, ac: oka, pc: okc };
    D = {
      valor: val ? fm(val) : '—', area: ar ? n0(ar) + ' m²' : '—', prazo: pz ? n0(pz) + ' meses' : '—',
      pm2: pm2 ? fm(pm2) + '/m²' : '—', mrgIni: mp ? np(mp) + '%' : '—',
      mrgV: mp ? fm(mR) : '—',
      mrgF: mp ? `${fm(val)} × ${np(mp)}% = ${fm(mR)}` : '—',
      cmaxF: mp ? `${fm(val)} − ${fm(mR)} = ${fm(cmax)}` : '—', cmaxV: mp ? fm(cmax) : '—',
      preco_chk: msg('preco', okp),
      res1: okp && mp > 0
        ? `O contrato apresenta preço médio de ${fm(pm2)}/m² e margem bruta estimada de ${np(mp)}%, correspondente a aproximadamente ${mi(mR)}.`
        : 'Calcule corretamente o preço por m² e informe a margem para ver o resultado.',
      prodMed: pmed ? n2(pmed) + ' m²/mês' : '—', prodConc: pc ? n2(pc) + ' m²/mês' : '—',
      pm_chk: msg('pm', okm), ac_chk: msg('ac', oka), pc_chk: msg('pc', okc),
      res2: !(okm && oka && okc) ? 'O resultado da etapa aparece quando os três cálculos estiverem corretos.' : `A produção média planejada é de ${n2(pmed)} m²/mês. Caso 20% da área seja concentrada nos últimos três meses, a produtividade necessária nesse período sobe para ${n2(pc)} m²/mês, aumentando a pressão sobre equipes, equipamentos, suprimentos e prazo.`,
      cust: cust ? fm(cust) : '—', mproj: cust ? np(mproj) + '%' : '—',
      dif: cust && mp ? `Diferença para a meta: ${np(mproj - mp)} ponto(s) percentual(is).` : '',
      desemb: des ? fm(des) : '—', pdes: des && val ? `${np(des / val * 100)}% da receita contratual` : '—',
      risco: g('rp').value || '—', topRisk: top ? `${top.r} (${top.s} · ${top.t})` : '—'
    };
    document.querySelectorAll('#fluxoAn [data-k]').forEach(e => {
      const k = e.dataset.k;
      if (!(k in D)) return;
      e.textContent = D[k];
      if (k.endsWith('_chk')) e.className = 'text-xs font-bold ' + (D[k][0] === '✔' ? 'text-emerald-700' : 'text-rose-700');
    });
  }

  /* ---------- navegação ---------- */
  function bar() {
    g('anBar').innerHTML =
      `<button onclick="an.novo()" class="px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-100"><i class="fa-solid fa-plus mr-1"></i>Novo Projeto</button>` +
      `<button onclick="an.salvar()" class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"><i class="fa-solid fa-floppy-disk mr-1"></i>Salvar projeto</button>` +
      `<button onclick="an.excluir()" class="px-3 py-2 rounded-xl border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 font-bold"><i class="fa-solid fa-trash-can mr-1"></i>Excluir projeto</button>` +
      STEPS.map((s, i) => {
        const n = i + 1, lock = n > A.max;
        const cls = lock ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
          : n === A.cur ? 'bg-blue-700 text-white border-blue-700 shadow'
          : n < A.max ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white text-blue-700 border-blue-400';
        const ico = lock ? '<i class="fa-solid fa-lock mr-1"></i>' : (n < A.max && n !== A.cur ? '<i class="fa-solid fa-check mr-1"></i>' : '');
        return `<button ${lock ? 'disabled' : ''} onclick="an.go(${n})" class="px-3 py-2 rounded-xl border font-bold ${cls}">${ico}${n}. ${s}</button>`;
      }).join('');
  }

  function go(n, sc) {
    if (n > A.max) return;
    A.cur = n;
    for (let i = 1; i <= 7; i++) g('pn' + i).classList.toggle('hidden', i !== n);
    bar(); calc();
    if (sc !== false) g('anBar').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function need(n) {
    if (n === 6 && !A.dec) return 'Escolha uma decisão antes de emitir o parecer.';
    const falta = (REQ[n] || []).some(id => !g(id).value.trim()) || (RAD[n] || []).some(r => !document.querySelector(`input[name="${r}"]:checked`));
    if (falta) return 'Preencha todos os campos desta etapa para avançar.';
    if (n === 1 && !Z.ok.preco) return 'Refaça o cálculo do preço de venda por m² para avançar.';
    if (n === 2 && !(Z.ok.pm && Z.ok.ac && Z.ok.pc)) return 'Refaça os cálculos marcados com "No!" para avançar.';
    if (n === 3 && Z.cust <= 0) return 'Informe os valores da estimativa de custos.';
    if (n === 4 && Z.des <= 0) return 'Informe os valores dos desembolsos iniciais.';
    if (n === 5) {
      if (RISC.some((r, i) => !v('p' + i) || !v('i' + i))) return 'Classifique probabilidade e impacto de todos os riscos.';
      if (!document.querySelector('.med:checked')) return 'Selecione ao menos uma medida recomendada.';
    }
    return '';
  }

  function next(n) {
    calc();
    const m = need(n);
    g('msg' + n).textContent = m;
    if (m) return;
    A.max = Math.max(A.max, n + 1);
    go(n + 1);
  }

  function dec(i) {
    A.dec = DEC[i];
    g('pBox').classList.remove('hidden');
    g('dd').value = A.dec;
    document.querySelectorAll('.dbtn').forEach((b, j) => b.classList.toggle('opacity-40', j !== i));
    calc();
    if (!g('fr').value) g('fr').value = g('rp').value;
    if (!g('fm2').value) g('fm2').value = [...document.querySelectorAll('.med:checked')].map(c => c.value).join('; ');
  }

  function rel() {
    calc();
    const meds = [...document.querySelectorAll('.med:checked')].map(c => `<li>${esc(c.value)}</li>`).join('');
    const cor = A.dec === DEC[0] ? 'text-emerald-700' : A.dec === DEC[1] ? 'text-amber-600' : 'text-rose-700';
    const h = t => `<h4 class="font-bold text-sm border-b pb-1 mb-2">${t}</h4>`;
    g('areaRelatorio').innerHTML = `<div class="bg-white text-slate-900 p-6 border rounded-xl space-y-4 text-xs">
      <div class="border-b pb-3"><h3 class="text-lg font-extrabold">PARECER TÉCNICO DO CONTRATO</h3>
        <p>Contrato: <b>${esc(g('cadContrato').value)}</b></p><p>Obra: <b>${esc(g('cadNome').value)}</b></p>
        <p>Cliente: <b>${esc(g('cadCliente').value)}</b></p><p>Emissão: <b>${new Date().toLocaleDateString('pt-BR')}</b></p></div>
      <div>${h('Indicadores analisados')}<ul class="list-disc ml-5 space-y-0.5">
        <li>Valor do contrato: ${D.valor} | Área: ${D.area} | Prazo: ${D.prazo}</li>
        <li>Venda média: ${D.pm2}</li><li>Produção média: ${D.prodMed}</li><li>Produção crítica (últimos 3 meses): ${D.prodConc}</li>
        <li>Margem inicial: ${D.mrgIni}</li><li>Custo projetado: ${D.cust}</li><li>Margem projetada: ${D.mproj}</li>
        <li>Desembolso inicial (60 dias): ${D.desemb}</li><li>Risco principal: ${esc(D.risco)}</li></ul></div>
      <div>${h('Decisão do aluno')}<p class="text-base font-extrabold ${cor}">${esc(A.dec)}</p></div>
      <div>${h('Fundamentação')}<p><b>Econômica:</b> ${esc(g('fe').value)}</p><p><b>Operacional:</b> ${esc(g('fo').value)}</p>
        <p><b>Principal risco:</b> ${esc(g('fr').value)}</p><p class="whitespace-pre-line mt-2">${esc(g('pf').value)}</p></div>
      <div>${h('Medidas recomendadas')}<ul class="list-disc ml-5">${meds}</ul>
        <p class="mt-1"><b>Medida principal:</b> ${esc(g('fm2').value)}</p><p class="whitespace-pre-line"><b>Justificativa:</b> ${esc(g('j5').value)}</p></div></div>`;
  }

  function emit() {
    calc();
    const m = need(6);
    g('msg6').textContent = m;
    if (m) return;
    rel();
    A.max = 7;
    go(7);
  }

  /* ---------- montagem ---------- */
  function build() {
    Object.assign(A, { max: 1, cur: 1, dec: '', built: true });
    g('fluxoAn').innerHTML = '<div id="anBar" class="flex flex-wrap gap-2"></div><p id="anMsg" class="font-bold text-emerald-700"></p>' + panels();
    go(1, false);
  }

  function show() {
    if (!A.built) build();
    g('fluxoAn').classList.remove('hidden');
    calc();
  }

  function limpar() {
    CAD.forEach(i => { const e = g(i); if (e) e.value = ''; });
    ['tabelaMOP', 'tabelaOrcamento'].forEach(i => { const e = g(i); if (e) e.innerHTML = ''; });
    if (typeof atualizarTotalMOPGeral === 'function') atualizarTotalMOPGeral();
    if (typeof carregarTabelaMedicao === 'function') carregarTabelaMedicao();
    g('resCad').classList.add('hidden');
    g('fluxoAn').classList.add('hidden');
    A.pid = '';
    build();
    const e = g('cadNome'); e.focus(); e.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function novo() {
    if (!confirm('Iniciar um novo projeto? O cadastro, o orçamento e a análise atuais serão limpos (o que não foi salvo será perdido).')) return;
    limpar();
  }

  /* ---------- salvar / abrir / excluir (neste navegador) ---------- */
  const KEY = 'analistaProjetos';
  const lerTodos = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const gravar = o => { try { localStorage.setItem(KEY, JSON.stringify(o)); return true; } catch (e) { return false; } };
  const aviso = t => { const m = g('anMsg'); if (m) { m.textContent = t; setTimeout(() => { if (m.textContent === t) m.textContent = ''; }, 5000); } };

  function lista(sel) {
    const all = lerTodos(), ids = Object.keys(all), el = g('anLista');
    if (!el) return;
    el.innerHTML = `<option value="">${ids.length ? 'Selecione um projeto' : 'Nenhum projeto salvo'}</option>` +
      ids.map(id => `<option value="${esc(id)}">${esc(all[id].nome)} (${new Date(all[id].data).toLocaleDateString('pt-BR')})</option>`).join('');
    if (sel) el.value = sel;
  }

  function snap() {
    const f = {}, r = {};
    document.querySelectorAll('#fluxoAn input[id],#fluxoAn select[id],#fluxoAn textarea[id]').forEach(e => { f[e.id] = e.value; });
    document.querySelectorAll('#fluxoAn input[type=radio]:checked').forEach(e => { r[e.name] = e.value; });
    const cad = {}; CAD.forEach(i => { cad[i] = g(i).value; });
    const rows = id => [...g(id).querySelectorAll('tr')].map(tr => [...tr.querySelectorAll('input,select')].map(e => e.value));
    return { cad, f, r, m: [...document.querySelectorAll('.med:checked')].map(e => e.value), dec: A.dec, max: A.max, cur: A.cur, mop: rows('tabelaMOP'), eap: rows('tabelaOrcamento') };
  }

  function refill(tb, rows, add, recalc, sel) {
    g(tb).innerHTML = '';
    if (typeof add !== 'function') return;
    rows.forEach(vals => {
      add();
      const tr = g(tb).lastElementChild;
      [...tr.querySelectorAll('input,select')].forEach((e, i) => { if (vals[i] !== undefined) e.value = vals[i]; });
      if (typeof recalc === 'function') recalc(tr.querySelector(sel));
    });
  }

  function restore(d) {
    CAD.forEach(i => { g(i).value = d.cad[i] || ''; });
    refill('tabelaMOP', d.mop || [], window.adicionarLinhaMOP, window.recalcularMOP, '.qtd-mop');
    refill('tabelaOrcamento', d.eap || [], window.adicionarLinhaOrcamento, window.recalcularLinha, '.qtd-item');
    if (typeof atualizarTotalMOPGeral === 'function') atualizarTotalMOPGeral();
    if (typeof carregarTabelaMedicao === 'function') carregarTabelaMedicao();
    salvarOriginal();
    build();
    Object.keys(d.f).forEach(id => { const e = g(id); if (e) e.value = d.f[id]; });
    Object.keys(d.r).forEach(nm => { document.querySelectorAll(`input[name="${nm}"]`).forEach(e => { e.checked = e.value === d.r[nm]; }); });
    document.querySelectorAll('.med').forEach(e => { e.checked = d.m.includes(e.value); });
    const di = DEC.indexOf(d.dec);
    if (di >= 0) dec(di);
    A.max = d.max;
    if (A.max >= 7) rel();
    show();
    go(Math.min(d.cur, A.max), false);
  }

  function salvar() {
    const id = (g('cadContrato').value || g('cadNome').value).trim();
    if (!id) { alert('Informe o nº do contrato ou o nome da obra para salvar o projeto.'); return; }
    const all = lerTodos(), existia = !!all[id];
    all[id] = { nome: [g('cadContrato').value.trim(), g('cadNome').value.trim()].filter(Boolean).join(' · '), data: new Date().toISOString(), s: snap() };
    if (!gravar(all)) { alert('Não foi possível salvar neste navegador.'); return; }
    A.pid = id;
    lista(id);
    aviso((existia ? 'Projeto atualizado' : 'Projeto salvo') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + '.');
  }

  function abrir() {
    const id = g('anLista').value, all = lerTodos();
    if (!id || !all[id]) { alert('Selecione um projeto salvo na lista.'); return; }
    if (!g('fluxoAn').classList.contains('hidden') && !confirm('Abrir outro projeto? O que não foi salvo no projeto atual será perdido.')) return;
    restore(all[id].s);
    A.pid = id;
    aviso('Projeto aberto: ' + all[id].nome);
  }

  function excluir() {
    const id = A.pid || (g('cadContrato').value || g('cadNome').value).trim(), all = lerTodos();
    if (!id || !all[id]) { alert('Este projeto ainda não foi salvo, então não há o que excluir. Use "Novo Projeto" para limpar a tela.'); return; }
    if (!confirm(`Excluir o projeto "${all[id].nome}"? Esta ação não pode ser desfeita.`)) return;
    delete all[id];
    gravar(all);
    limpar();
    lista();
  }

  /* ---------- liga ao botão "Salvar Premissas" ---------- */
  const box = document.createElement('div');
  box.id = 'fluxoAn';
  box.className = 'hidden space-y-4 text-xs';
  g('resCad').insertAdjacentElement('afterend', box);

  box.addEventListener('keydown', e => {
    const t = e.target;
    if (e.key !== 'Enter' || !/^(INPUT|SELECT)$/.test(t.tagName) || t.type === 'radio' || t.type === 'checkbox') return;
    e.preventDefault();
    const pn = t.closest('[id^="pn"]');
    const f = [...pn.querySelectorAll('input:not([readonly]):not([type=radio]):not([type=checkbox]),select,textarea')];
    const nx = f[f.indexOf(t) + 1] || pn.querySelector(':scope > button');
    if (nx) nx.focus();
  });

  const card = g('cadNome').closest('.space-y-4');
  const tb = document.createElement('div');
  tb.className = 'flex flex-wrap items-center gap-2 text-xs bg-slate-50 border border-slate-200 rounded-xl p-3';
  tb.innerHTML = '<span class="font-bold text-slate-600"><i class="fa-solid fa-folder-open mr-1"></i>Projetos salvos:</span><select id="anLista" class="p-2 border rounded-lg bg-white min-w-[220px]"></select><button onclick="an.abrir()" class="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold">Abrir</button>';
  card.insertAdjacentElement('afterbegin', tb);
  lista();

  const salvarOriginal = window.salvarCadastro;
  window.salvarCadastro = function () {
    if (v('cadValorLicitacao') <= 0 || v('cadArea') <= 0 || v('cadPrazo') <= 0) {
      alert('Informe o valor da licitação, o prazo e a área construída para salvar.');
      return;
    }
    salvarOriginal();
    show();
  };

  window.an = { calc, go, next, dec, emit, novo, salvar, excluir, abrir };
})();

/* ===== Módulos 2 a 5: o aluno calcula o KPI (fórmula + Ok/No) ===== */
(function () {
  const g = id => document.getElementById(id), q = s => document.querySelector(s);
  const v = el => parseFloat(el && el.value) || 0;
  const fm = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const IN = 'w-full mt-1 p-2 border rounded-lg bg-white', LB = 'font-bold text-slate-600';
  const kpi = f => `<p class="mt-1 px-2 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-800 font-semibold text-[11px]">${f}</p>`;
  const sum = (sel, fn) => [...document.querySelectorAll(sel)].reduce((s, e) => s + fn(e), 0);
  const DES = [], hooks = [];

  function desafio(ref, pos, o) {
    const d = document.createElement('div');
    d.className = 'no-print p-3 rounded-xl border border-indigo-200 bg-indigo-50 space-y-1 text-xs';
    d.innerHTML = `${o.tit ? `<p class="font-bold text-indigo-900">${o.tit}</p>` : ''}${kpi(o.f)}<label class="${LB}">${o.lab}</label><input type="number" step="any" id="${o.id}" class="${IN}"><p id="${o.id}_m" class="text-xs font-bold"></p>`;
    ref.insertAdjacentElement(pos, d);
    DES.push(o);
  }

  function avalia() {
    DES.forEach(o => {
      const i = g(o.id), m = g(o.id + '_m');
      let ok = false;
      if (i.value === '') m.textContent = '';
      else {
        const e = o.exp();
        ok = Math.abs(parseFloat(i.value) - e) <= Math.max(.01, Math.abs(e) * .005);
        m.textContent = ok ? '✔ Ok! Parabéns!' : '✖ No! Refaça o cálculo.';
        m.className = 'text-xs font-bold ' + (ok ? 'text-emerald-700' : 'text-rose-700');
      }
      o.done = ok;
      if (o.rev) o.rev(ok);
    });
    hooks.forEach(h => h());
  }

  const cap = (id, f) => { const t = g(id); if (t) t.closest('.overflow-x-auto').insertAdjacentHTML('beforebegin', kpi(f)); };

  /* Módulo 2: orçamento */
  cap('tabelaMOP', 'KPI "Total da linha" = [Qtd] × [Salário + Encargos] × [Meses]');
  cap('tabelaOrcamento', 'KPI "Total do item" = [Qtd] × [Custo unit.]');
  const totMop = g('resumoTotalMOP');
  if (totMop) desafio(totMop.closest('.pt-2'), 'afterend', {
    id: 'k_mop', tit: 'Desafio KPI: Total da Mão de Obra Própria',
    f: 'KPI "Total MOP" = Σ ([Qtd] × [Salário + Encargos] × [Meses])', lab: 'Qual é o Total MOP? (R$)',
    exp: () => sum('#tabelaMOP tr', tr => v(tr.querySelector('.qtd-mop')) * v(tr.querySelector('.sal-mop')) * v(tr.querySelector('.mes-mop'))),
    rev: ok => { totMop.parentElement.style.display = ok ? '' : 'none'; }
  });
  const addEap = q('button[onclick="adicionarLinhaOrcamento()"]');
  if (addEap) desafio(addEap, 'afterend', {
    id: 'k_eap', tit: 'Desafio KPI: Custo total da EAP',
    f: 'KPI "Custo total da EAP" = Σ ([Qtd] × [Custo unit.])', lab: 'Qual é o custo total da EAP? (R$)',
    exp: () => sum('#tabelaOrcamento tr', tr => v(tr.querySelector('.qtd-item')) * v(tr.querySelector('.val-item')))
  });

  /* Módulo 3: Curva S e PERT */
  cap('tabelaCronograma', 'KPI "Acumulado" = Σ [% mensal] · KPI "Valor do período" = [BAC] × [% mensal]');
  const st = g('statusCurvaS');
  if (st) desafio(st, 'beforebegin', {
    id: 'k_curva', tit: 'Desafio KPI: Desvio físico da obra',
    f: 'KPI "Desvio físico" = [Acumulado realizado %] − [Acumulado previsto %]', lab: 'Qual é o desvio físico? (pontos percentuais)',
    exp: () => sum('.real-pct', v) - sum('.prev-pct', v),
    rev: ok => { st.style.display = ok ? '' : 'none'; }
  });
  const bP = q('button[onclick="calcularPERT()"]');
  if (bP) {
    bP.style.display = 'none';
    desafio(bP, 'beforebegin', {
      id: 'k_pert', tit: 'Desafio KPI: Duração esperada (PERT)',
      f: 'KPI "Duração esperada (TE)" = ([O] + 4 × [M] + [P]) ÷ 6', lab: 'Qual é a duração esperada TE? (dias)',
      exp: () => (v(g('pertO')) + 4 * v(g('pertM')) + v(g('pertP'))) / 6,
      rev: ok => { if (ok) calcularPERT(); else g('resPERT').classList.add('hidden'); }
    });
  }

  /* Módulo 4: medição */
  cap('tabelaMedicao', 'KPI "Qtd acumulada" = [Qtd anterior] + [Qtd período] · KPI "Saldo a executar" = [Qtd prevista] − [Qtd acumulada]');
  const rm = g('resMed');
  if (rm) desafio(rm, 'beforebegin', {
    id: 'k_med', tit: 'Desafio KPI: Valor total medido no período',
    f: 'KPI "Valor medido" = [Qtd do período] × [Custo unit.] (some todos os itens)', lab: 'Qual é o valor total medido? (R$)',
    exp: () => sum('#tabelaMedicao .qtd-periodo', e => v(e) * (parseFloat(e.getAttribute('data-val')) || 0)),
    rev: ok => { rm.style.display = ok ? '' : 'none'; }
  });

  /* Módulo 5: EVM */
  const bE = q('button[onclick="calcularEVM()"]');
  if (bE) {
    bE.style.display = 'none';
    const c = document.createElement('div');
    c.className = 'space-y-3';
    c.innerHTML = '<p class="font-bold text-slate-800">Calcule os indicadores com o PV, EV e AC acima. BAC = valor do contrato.</p>';
    bE.insertAdjacentElement('beforebegin', c);
    const pv = () => v(g('evmPV')), ev = () => v(g('evmEV')), ac = () => v(g('evmAC')), bac = () => v(g('cadValorLicitacao')) || 12000000;
    const spi = () => pv() ? ev() / pv() : 0, cpi = () => ac() ? ev() / ac() : 0, eac = () => cpi() ? bac() / cpi() : bac();
    const E = [
      ['k_sv', 'Variação de prazos (SV)', '[EV] − [PV]', 'SV (R$)', () => ev() - pv()],
      ['k_cv', 'Variação de custos (CV)', '[EV] − [AC]', 'CV (R$)', () => ev() - ac()],
      ['k_spi', 'Índice de desempenho de prazos (SPI)', '[EV] ÷ [PV]', 'SPI', spi],
      ['k_cpi', 'Índice de desempenho de custos (CPI)', '[EV] ÷ [AC]', 'CPI', cpi],
      ['k_eac', 'Estimativa de custo no término (EAC)', '[BAC] ÷ [CPI]', 'EAC (R$)', eac]
    ];
    E.forEach(x => desafio(c, 'beforeend', { id: x[0], f: `KPI "${x[1]}" = ${x[2]}`, lab: x[3], exp: x[4] }));
    hooks.push(() => {
      const all = E.every(x => DES.find(o => o.id === x[0]).done);
      g('resEVM').classList.toggle('hidden', !all);
      if (!all) return;
      g('valSV').textContent = fm(ev() - pv()); g('valCV').textContent = fm(ev() - ac());
      g('valSPI').textContent = spi().toFixed(2); g('valCPI').textContent = cpi().toFixed(2);
      g('valEAC').textContent = fm(eac());
      g('descEVM').textContent = `SPI ${spi().toFixed(2)}: ${spi() < 1 ? 'obra atrasada em relação ao planejado' : spi() > 1 ? 'obra adiantada' : 'obra no prazo'}. CPI ${cpi().toFixed(2)}: ${cpi() < 1 ? 'custo acima do previsto' : cpi() > 1 ? 'custo abaixo do previsto' : 'custo conforme o previsto'}. Projeção EAC: ${fm(eac())}.`;
    });
  }

  ['input', 'change'].forEach(t => document.addEventListener(t, () => setTimeout(avalia, 0)));
  document.addEventListener('click', () => setTimeout(avalia, 60));
  avalia();
})();
