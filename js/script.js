function addExpense() {
  var container = document.getElementById('extra-expenses');
  var row = document.createElement('div');
  row.className = 'calc-expense-row';
  row.innerHTML = '<input type="text" placeholder="Label" style="flex:1; padding:8px 10px; border:1px solid var(--border); border-radius:var(--radius); font-size:13px; font-family:inherit; color:var(--navy);">'
    + '<input type="number" class="calc-input calc-expense-input" value="0" oninput="recalc()" style="width:130px;">';
  container.appendChild(row);
  row.querySelector('input[type=text]').focus();
}

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
  var expenses = 0;
  document.querySelectorAll('.calc-expense-input').forEach(function(el) {
    expenses += parseFloat(el.value) || 0;
  });

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

  // Credit card payoff calc ($5,231 at 20% APR)
  var ccBalance = 5231;
  var ccRate = 0.20 / 12;
  var ccMonths = 0;
  var ccInterest = 0;
  var b = ccBalance;
  if (monthlySave > b * ccRate) {
    while (b > 0 && ccMonths < 120) {
      var interest = b * ccRate;
      ccInterest += interest;
      b = b + interest - monthlySave;
      ccMonths++;
    }
    var freeDate = new Date();
    freeDate.setMonth(freeDate.getMonth() + ccMonths);
    document.getElementById('cc-months').textContent = ccMonths;
    document.getElementById('cc-interest').textContent = fmt(ccInterest);
    document.getElementById('cc-free-date').textContent = freeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } else {
    document.getElementById('cc-months').textContent = '—';
    document.getElementById('cc-interest').textContent = '—';
    document.getElementById('cc-free-date').textContent = 'increase income or cut expenses';
  }

  // Allocation breakdown
  var invest    = monthlySave * 0.50;
  var emergency = monthlySave * 0.20;
  var vehicle   = monthlySave * 0.20;
  var fun       = monthlySave * 0.10;
  document.getElementById('alloc-invest').textContent    = fmt(invest) + '/mo';
  document.getElementById('alloc-emergency').textContent = fmt(emergency) + '/mo';
  document.getElementById('alloc-vehicle').textContent   = fmt(vehicle) + '/mo';
  document.getElementById('alloc-fun').textContent       = fmt(fun) + '/mo';
  document.getElementById('alloc-total').textContent     = fmt(monthlySave);
  document.getElementById('emergency-goal').textContent  = fmt(expenses * 3);

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

function recalcMortgage() {
  var disability  = parseFloat(document.getElementById('m-disability').value) || 0;
  var employment  = parseFloat(document.getElementById('m-employment').value) || 0;
  var annualRate  = parseFloat(document.getElementById('m-rate').value) || 6.5;
  var downPayment = parseFloat(document.getElementById('m-down').value) || 0;
  var otherDebts  = parseFloat(document.getElementById('m-debts').value) || 0;

  // VA lenders gross up tax-free disability income by 25%
  var grossedDisability = disability * 1.25;
  var qualifying = grossedDisability + employment;

  // VA DTI limit: 41%
  var maxTotalDebt = qualifying * 0.41;
  var maxMortgagePayment = Math.max(maxTotalDebt - otherDebts, 0);

  // Max loan via standard amortization inverse (30yr)
  var r = (annualRate / 100) / 12;
  var n = 360;
  var maxLoan = 0;
  if (r > 0 && maxMortgagePayment > 0) {
    maxLoan = maxMortgagePayment * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)));
  }
  var maxPrice = maxLoan + downPayment;

  document.getElementById('m-qualifying').textContent   = fmt(qualifying) + '/mo';
  document.getElementById('m-max-payment').textContent  = fmt(maxMortgagePayment) + '/mo';
  document.getElementById('m-max-loan').textContent     = fmt(maxLoan);
  document.getElementById('m-max-price').textContent    = fmt(maxPrice);
}

// Sync Phase 4 income inputs from Phase 3 when switching tabs
var _origShowTab = showTab;
showTab = function(id, btn) {
  _origShowTab(id, btn);
  if (id === 'phase4') {
    var d = parseFloat(document.getElementById('disability').value) || 0;
    var e = parseFloat(document.getElementById('employment').value) || 0;
    document.getElementById('m-disability').value = d;
    document.getElementById('m-employment').value = e;
    recalcMortgage();
  }
};

recalc();
recalcMortgage();
loadStepState();
