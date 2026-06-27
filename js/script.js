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
  var disability = parseFloat(document.getElementById('disability').value) || 0;
  var gibill    = parseFloat(document.getElementById('gibill').value)    || 0;
  var books     = parseFloat(document.getElementById('books').value)     || 0;
  var expenses  = parseFloat(document.getElementById('expenses').value)  || 0;

  var totalIncome  = disability + gibill + books;
  var monthlySave  = Math.max(totalIncome - expenses, 0);
  var save2yr      = monthlySave * 20;  // 10 months x 2 years
  var save4yr      = monthlySave * 40;  // 10 months x 4 years

  document.getElementById('total-income').textContent = fmt(totalIncome);
  document.getElementById('monthly-save').textContent = fmt(monthlySave);
  document.getElementById('save-2yr').textContent     = fmt(save2yr);
  document.getElementById('save-4yr').textContent     = fmt(save4yr);

  var y1 = monthlySave * 10;
  var y2 = monthlySave * 20;
  var y3 = monthlySave * 30;
  var y4 = monthlySave * 40;
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
