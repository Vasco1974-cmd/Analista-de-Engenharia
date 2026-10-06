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

  const A = { max: 1, cur: 1, dec: '', built: false };
  const Z = { cust: 0, des: 0 };
  let D = {};

  /* ---------- pedaços de HTML ---------- */
  const IN = 'w-full mt-1 p-2.5 border rounded-lg bg-white', LB = 'font-bold text-slate-600';
  const grid = (c, a) => `<div class="grid grid-cols-1 md:grid-cols-${c} gap-3">${a.join('')}</div>`;
  const sys = (k, l) => `<div class="bg-blue-50 border border-blue-200 rounded-lg p-3"><p class="text-[10px] font-bold uppercase text-blue-700">${l}</p><p data-k="${k}" class="text-sm font-extrabold text-blue-900">—</p></div>`;
  const num = (id, l, chk) => `<div><label class="${LB}">${l}</label><input type="number" step="any" id="${id}" oninput="an.calc()" class="${IN}">${chk ? `<p data-k="${id}_chk" class="text-[11px]"></p>` : ''}</div>`;
  const txt = (id, l, ro) => `<div><label class="${LB}">${l}</label><input type="text" id="${id}" ${ro ? 'readonly' : ''} class="${IN} ${ro ? 'bg-slate-100 font-bold' : ''}"></div>`;
  const ta = (id, l) => `<div><label class="${LB}">${l}</label><textarea id="${id}" rows="3" class="${IN}"></textarea></div>`;
  const rad = (nm, l, o) => `<div><p class="${LB} mb-1">${l}</p><div class="flex flex-wrap gap-4">${o.map(x => `<label class="flex items-center gap-1.5"><input type="radio" name="${nm}" value="${x}"> ${x}</label>`).join('')}</div></div>`;
  const res = k => `<div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-900"><p class="font-bold">Resultado da etapa</p><p data-k="${k}"></p></div>`;
  const bt = (t, fn) => `<button onclick="${fn}" class="no-print w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-xs shadow">${t}</button>`;
  const P = (n, t, body, btn) => `<div id="pn${n}" class="hidden space-y-4 border border-slate-200 rounded-xl p-4 bg-white"><h4 class="font-bold text-sm text-slate-800">${t}</h4>${body}<p id="msg${n}" class="text-rose-700 font-bold"></p>${btn}</div>`;
  const sel = id => `<select id="${id}" onchange="an.calc()" class="p-1.5 border rounded bg-white"><option value="">—</option><option value="1">↓ Baixa</option><option value="2">→ Média</option><option value="3">↑ Alta</option></select>`;

  function panels() {
    const p1 = P(1, '1. Análise Econômica do Contrato',
      '<p class="text-slate-500">Dados trazidos automaticamente do cadastro acima.</p>' +
      grid(3, [sys('valor', 'Valor do contrato'), sys('area', 'Área construída'), sys('prazo', 'Prazo')]) +
      num('preco', '1. Preço de venda por m² (R$/m²)', 1) +
      grid(2, [num('mrg', '2. Margem bruta estimada (%)'), sys('mrgF', 'Sistema calcula: margem bruta estimada')]) +
      sys('cmaxF', '3. Custo máximo compatível com a margem') +
      ta('t1', '4. Interpretação: o que esses números indicam sobre o contrato?') + res('res1'),
      bt('AVANÇAR PARA PRODUTIVIDADE →', 'an.next(1)'));

    const p2 = P(2, '2. Análise de Prazo e Produtividade',
      grid(2, [sys('area', 'Área'), sys('prazo', 'Prazo')]) +
      num('pm', 'Pergunta 1. Qual é a produção física média necessária por mês? (m²/mês)', 1) +
      num('ac', 'Pergunta 2. O caso informa que 20% da área poderá ficar concentrada nos últimos 3 meses. Qual área ficará concentrada nesse período? (m²)', 1) +
      num('pc', 'Pergunta 3. Qual será a produção média necessária nos últimos 3 meses? (m²/mês)', 1) +
      rad('cls', 'Pergunta 4. Como você classifica esse cenário?', ['Confortável', 'Exige atenção', 'Alto risco de produtividade']) +
      ta('an2', 'Pergunta 5. Por que a concentração de serviços no final da obra pode ser problemática?') + res('res2'),
      bt('AVANÇAR PARA CUSTOS E MARGEM →', 'an.next(2)'));

    const p3 = P(3, '3. Análise de Custos e Margem',
      '<p class="text-slate-600">Tenho a receita do contrato. Quanto posso gastar e ainda manter a margem?</p>' +
      grid(3, [sys('valor', 'Receita contratual'), sys('mrgIni', 'Margem desejada'), sys('cmaxV', 'Custo máximo admissível')]) +
      grid(2, CUSTOS.map(c => num(c[0], c[1] + ' (R$)'))) +
      grid(2, [sys('cust', 'Custo total projetado'), sys('mproj', 'Margem projetada')]) +
      '<p data-k="dif" class="text-[11px] text-slate-600"></p>' +
      rad('mrgok', 'A margem projetada permanece próxima dos <span data-k="mrgIni">—</span> inicialmente estimados?', ['Sim', 'Não', 'Está em situação de alerta']) +
      ta('an3', 'Justifique sua avaliação:'),
      bt('AVANÇAR PARA CAPITAL DE GIRO →', 'an.next(3)'));

    const p4 = P(4, '4. Capital de Giro e Mobilização',
      '<p class="text-slate-600">O cronograma de mobilização inicial exige um desembolso pesado nos primeiros 60 dias. <b>Período crítico: primeiros 60 dias.</b></p>' +
      grid(2, DESEMB.map(c => num(c[0], c[1] + ' (R$)'))) +
      grid(2, [sys('desemb', 'Desembolso inicial estimado'), sys('pdes', 'Peso sobre a receita')]) +
      rad('pres', 'Como você classifica a pressão sobre o capital de giro?', ['🟢 Baixa', '🟡 Moderada', '🟠 Alta', '🔴 Crítica']) +
      ta('an4', 'Por que o desembolso inicial pode representar um risco mesmo que o contrato seja lucrativo?'),
      bt('AVANÇAR PARA MATRIZ DE RISCOS →', 'an.next(4)'));

    const p5 = P(5, '5. Matriz de Riscos',
      `<div class="overflow-x-auto"><table class="w-full text-left"><thead><tr class="bg-slate-100 text-slate-600 font-bold"><th class="p-2">Risco</th><th class="p-2">Probabilidade</th><th class="p-2">Impacto</th><th class="p-2 text-center">Nível (P × I)</th></tr></thead><tbody>` +
      RISC.map((r, i) => `<tr class="border-b"><td class="p-2 font-bold">${r}</td><td class="p-2">${sel('p' + i)}</td><td class="p-2">${sel('i' + i)}</td><td class="p-2 text-center" id="nv${i}">—</td></tr>`).join('') +
      '</tbody></table></div>' +
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
  const ck = (id, e, t) => g(id).value === '' ? '' : (Math.abs(v(id) - e) <= Math.max(.01, Math.abs(e) * .005) ? '✔ Confere. ' : '✖ Revise. ') + t;
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
    Z.cust = cust; Z.des = des;
    D = {
      valor: val ? fm(val) : '—', area: ar ? n0(ar) + ' m²' : '—', prazo: pz ? n0(pz) + ' meses' : '—',
      pm2: pm2 ? fm(pm2) + '/m²' : '—', mrgIni: mp ? np(mp) + '%' : '—',
      mrgF: mp ? `${fm(val)} × ${np(mp)}% = ${fm(mR)}` : '—',
      cmaxF: mp ? `${fm(val)} − ${fm(mR)} = ${fm(cmax)}` : '—', cmaxV: mp ? fm(cmax) : '—',
      preco_chk: ck('preco', pm2, `${fm(val)} ÷ ${n0(ar)} m² = ${fm(pm2)}/m²`),
      res1: g('preco').value !== '' && mp > 0
        ? `O contrato apresenta preço médio de ${fm(pm2)}/m² e margem bruta estimada de ${np(mp)}%, correspondente a aproximadamente ${mi(mR)}.`
        : 'Informe o preço de venda e a margem para ver o resultado.',
      prodMed: pmed ? n2(pmed) + ' m²/mês' : '—', prodConc: pc ? n2(pc) + ' m²/mês' : '—',
      pm_chk: ck('pm', pmed, `${n0(ar)} m² ÷ ${n0(pz)} meses = ${n2(pmed)} m²/mês`),
      ac_chk: ck('ac', ac, `20% × ${n0(ar)} m² = ${n0(ac)} m²`),
      pc_chk: ck('pc', pc, `${n0(ac)} m² ÷ 3 meses = ${n2(pc)} m²/mês`),
      res2: `A produção média planejada é de ${n2(pmed)} m²/mês. Caso 20% da área seja concentrada nos últimos três meses, a produtividade necessária nesse período sobe para ${n2(pc)} m²/mês, aumentando a pressão sobre equipes, equipamentos, suprimentos e prazo.`,
      cust: cust ? fm(cust) : '—', mproj: cust ? np(mproj) + '%' : '—',
      dif: cust && mp ? `Diferença para a meta: ${np(mproj - mp)} ponto(s) percentual(is).` : '',
      desemb: des ? fm(des) : '—', pdes: des && val ? `${np(des / val * 100)}% da receita contratual` : '—',
      risco: g('rp').value || '—', topRisk: top ? `${top.r} (${top.s} · ${top.t})` : '—'
    };
    document.querySelectorAll('#fluxoAn [data-k]').forEach(e => {
      const k = e.dataset.k;
      if (!(k in D)) return;
      e.textContent = D[k];
      if (k.endsWith('_chk')) e.className = 'text-[11px] font-bold ' + (D[k][0] === '✔' ? 'text-emerald-700' : 'text-rose-700');
    });
  }

  /* ---------- navegação ---------- */
  function bar() {
    g('anBar').innerHTML =
      `<button onclick="an.novo()" class="px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-100"><i class="fa-solid fa-plus mr-1"></i>Novo Projeto</button>` +
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
    g('fluxoAn').innerHTML = '<div id="anBar" class="flex flex-wrap gap-2"></div>' + panels();
    go(1, false);
  }

  function show() {
    if (!A.built) build();
    g('fluxoAn').classList.remove('hidden');
    calc();
  }

  function novo() {
    if (!confirm('Iniciar um novo projeto? O cadastro, o orçamento e a análise atuais serão limpos.')) return;
    ['cadNome', 'cadCliente', 'cadContrato', 'cadValorLicitacao', 'cadPrazo', 'cadArea'].forEach(i => { const e = g(i); if (e) e.value = ''; });
    ['tabelaMOP', 'tabelaOrcamento'].forEach(i => { const e = g(i); if (e) e.innerHTML = ''; });
    if (typeof atualizarTotalMOPGeral === 'function') atualizarTotalMOPGeral();
    if (typeof carregarTabelaMedicao === 'function') carregarTabelaMedicao();
    g('resCad').classList.add('hidden');
    g('fluxoAn').classList.add('hidden');
    build();
    const e = g('cadNome'); e.focus(); e.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------- liga ao botão "Salvar Premissas" ---------- */
  const box = document.createElement('div');
  box.id = 'fluxoAn';
  box.className = 'hidden space-y-4 text-xs';
  g('resCad').insertAdjacentElement('afterend', box);

  const salvarOriginal = window.salvarCadastro;
  window.salvarCadastro = function () {
    if (v('cadValorLicitacao') <= 0 || v('cadArea') <= 0 || v('cadPrazo') <= 0) {
      alert('Informe o valor da licitação, o prazo e a área construída para salvar.');
      return;
    }
    salvarOriginal();
    show();
  };

  window.an = { calc, go, next, dec, emit, novo };
})();
