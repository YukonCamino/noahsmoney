function toggleStep(el) {
  var step = el.closest('.step');
  var key = 'step-' + el.dataset.step;
  var done = step.classList.toggle('done');
  localStorage.setItem(key, done ? '1' : '0');
}

function loadStepState() {
  document.querySelectorAll('.step-num[data-step]').forEach(function(el) {
    var key = 'step-' + el.dataset.step;
    if (localStorage.getItem(key) === '1') {
      el.closest('.step').classList.add('done');
    }
  });
}

function showTabByName(id) {
  var btn = document.querySelector('.tab-btn[onclick*="' + id + '"]');
  if (btn) showTab(id, btn);
}

function showTab(id, btn) {
  document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
  document.getElementById('tab-' + id).classList.add('active');
  btn.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function fmt(n) {
  return '$' + Math.round(n).toLocaleString();
}

function recalc() {
  var disability  = parseFloat(document.getElementById('disability').value)  || 0;
  var gibill      = parseFloat(document.getElementById('gibill').value)      || 0;
  var books       = parseFloat(document.getElementById('books').value)       || 0;
  var employment  = parseFloat(document.getElementById('employment').value)  || 0;
  var expenses    = parseFloat(document.getElementById('expenses').value)    || 0;

  var totalIncome  = disability + gibill + books + employment;
  var monthlySave  = Math.max(totalIncome - expenses, 0);
  // Compound at 7% annual return, contributing monthlySave for 10 months per year
  var monthlyRate = 0.07 / 12;
  var balance = 0;
  var yearBalances = [];
  for (var yr = 0; yr < 4; yr++) {
    for (var mo = 0; mo < 12; mo++) {
      balance = balance * (1 + monthlyRate);
      if (mo < 10) balance += monthlySave;
    }
    yearBalances.push(balance);
  }

  document.getElementById('total-income').textContent = fmt(totalIncome);
  document.getElementById('annual-income').textContent = fmt(totalIncome * 12);
  document.getElementById('monthly-save').textContent = fmt(monthlySave);
  document.getElementById('save-2yr').textContent     = fmt(yearBalances[1]);
  document.getElementById('save-4yr').textContent     = fmt(yearBalances[3]);

  var y1 = yearBalances[0];
  var y2 = yearBalances[1];
  var y3 = yearBalances[2];
  var y4 = yearBalances[3];
  var max = y4 || 1;

  function setBar(barId, valId, amount) {
    var pct = amount > 0 ? Math.max((amount / max) * 100, 6) : 0;
    document.getElementById(barId).style.width = pct + '%';
    document.getElementById(valId).textContent = fmt(amount);
  }

  setBar('bar-1', 'bar-1-val', y1);
  setBar('bar-2', 'bar-2-val', y2);
  setBar('bar-3', 'bar-3-val', y3);
  setBar('bar-4', 'bar-4-val', y4);
}

recalc();
loadStepState();
