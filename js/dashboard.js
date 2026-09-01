/* VoxShield AI - Dashboard Analytics Controller */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('dashboardApp')) return;

  const statTotalCalls = document.getElementById('statTotalCalls');
  const statHighRisk = document.getElementById('statHighRisk');
  const statAvgScore = document.getElementById('statAvgScore');
  const statThreats = document.getElementById('statThreats');
  const btnClearStats = document.getElementById('btnClearStats');

  const riskDistributionChart = document.getElementById('riskDistributionChart');
  const topCategoriesChart = document.getElementById('topCategoriesChart');

  function renderDashboard() {
    const stats = StorageManager.getStats();
    const history = StorageManager.getHistory();

    if (statTotalCalls) statTotalCalls.textContent = stats.totalCalls || 0;
    if (statHighRisk) statHighRisk.textContent = stats.highRiskCalls || 0;
    if (statAvgScore) statAvgScore.textContent = (stats.avgRiskScore || 0) + '/100';
    if (statThreats) statThreats.textContent = stats.threatsDetected || 0;

    renderDistributionBars(history);
    renderTopCategoriesBars(history);
  }

  function renderDistributionBars(history) {
    if (!riskDistributionChart) return;

    let safe = 0, low = 0, suspicious = 0, high = 0;
    history.forEach(h => {
      if (h.riskScore >= 76) high++;
      else if (h.riskScore >= 51) suspicious++;
      else if (h.riskScore >= 26) low++;
      else safe++;
    });

    const total = history.length || 1;
    const pSafe = Math.round((safe / total) * 100);
    const pLow = Math.round((low / total) * 100);
    const pSusp = Math.round((suspicious / total) * 100);
    const pHigh = Math.round((high / total) * 100);

    riskDistributionChart.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:0.3rem;">
          <span>🚨 High Risk (${high})</span>
          <span>${pHigh}%</span>
        </div>
        <div style="height:10px; background:rgba(255,255,255,0.08); border-radius:5px; overflow:hidden;">
          <div style="width:${pHigh}%; height:100%; background:var(--risk-high); transition:width 1s;"></div>
        </div>
      </div>

      <div style="margin-bottom: 1rem;">
        <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:0.3rem;">
          <span>⚠️ Suspicious (${suspicious})</span>
          <span>${pSusp}%</span>
        </div>
        <div style="height:10px; background:rgba(255,255,255,0.08); border-radius:5px; overflow:hidden;">
          <div style="width:${pSusp}%; height:100%; background:var(--risk-suspicious); transition:width 1s;"></div>
        </div>
      </div>

      <div style="margin-bottom: 1rem;">
        <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:0.3rem;">
          <span>🔷 Low Risk (${low})</span>
          <span>${pLow}%</span>
        </div>
        <div style="height:10px; background:rgba(255,255,255,0.08); border-radius:5px; overflow:hidden;">
          <div style="width:${pLow}%; height:100%; background:var(--risk-low); transition:width 1s;"></div>
        </div>
      </div>

      <div>
        <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:0.3rem;">
          <span>✅ Safe (${safe})</span>
          <span>${pSafe}%</span>
        </div>
        <div style="height:10px; background:rgba(255,255,255,0.08); border-radius:5px; overflow:hidden;">
          <div style="width:${pSafe}%; height:100%; background:var(--risk-safe); transition:width 1s;"></div>
        </div>
      </div>
    `;
  }

  function renderTopCategoriesBars(history) {
    if (!topCategoriesChart) return;

    const counts = {
      'Urgency Manipulation': 0,
      'Financial Pressure': 0,
      'Credential Request': 0,
      'Threat / Intimidation': 0,
      'Impersonation': 0,
      'Social Engineering': 0
    };

    history.forEach(h => {
      if (h.threatCategories) {
        h.threatCategories.forEach(tc => {
          if (tc.detected && counts[tc.name] !== undefined) {
            counts[tc.name]++;
          }
        });
      }
    });

    const maxCount = Math.max(...Object.values(counts), 1);

    topCategoriesChart.innerHTML = Object.keys(counts).map(catName => {
      const cnt = counts[catName];
      const pct = Math.round((cnt / maxCount) * 100);
      return `
        <div style="margin-bottom: 0.9rem;">
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.25rem;">
            <span>${catName}</span>
            <span style="font-weight:700;">${cnt} calls</span>
          </div>
          <div style="height:8px; background:rgba(255,255,255,0.08); border-radius:4px; overflow:hidden;">
            <div style="width:${pct}%; height:100%; background:linear-gradient(90deg, var(--accent-cyan), var(--accent-purple)); transition:width 1s;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  if (btnClearStats) {
    btnClearStats.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all history and reset dashboard statistics?')) {
        StorageManager.clearHistory();
        renderDashboard();
      }
    });
  }

  renderDashboard();
});
