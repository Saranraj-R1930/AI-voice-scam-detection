/* VoxShield AI - History View & Modal Controller */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('historyApp')) return;

  const historyTableBody = document.getElementById('historyTableBody');
  const historySearch = document.getElementById('historySearch');
  const btnClearAllHistory = document.getElementById('btnClearAllHistory');

  // Modal elements
  const detailModal = document.getElementById('detailModal');
  const modalClose = document.getElementById('modalClose');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  function renderHistoryTable(searchTerm = '') {
    const history = StorageManager.getHistory();
    const filtered = history.filter(item => {
      const query = searchTerm.toLowerCase();
      return (
        item.filename.toLowerCase().includes(query) ||
        item.riskLevel.toLowerCase().includes(query) ||
        (item.transcript && item.transcript.toLowerCase().includes(query))
      );
    });

    if (filtered.length === 0) {
      historyTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding: 2.5rem; color: var(--text-muted);">
            No matching analysis records found.
          </td>
        </tr>
      `;
      return;
    }

    historyTableBody.innerHTML = filtered.map(item => `
      <tr>
        <td style="font-size:0.85rem; color:var(--text-muted);">${item.dateStr || 'Recent'}</td>
        <td style="font-weight:600;">${item.filename}</td>
        <td>
          <span style="font-weight:800; font-size:1.1rem; color:${getRiskColor(item.riskScore)};">
            ${item.riskScore}
          </span> / 100
        </td>
        <td>
          <span class="badge ${getBadgeClass(item.riskScore)}">
            ${item.riskLevel}
          </span>
        </td>
        <td>${item.threatCount || 0} Indicators</td>
        <td>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-secondary btn-sm btn-view-detail" data-id="${item.id}">View Details</button>
            <button class="btn btn-danger btn-sm btn-delete-item" data-id="${item.id}">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    // Attach listener for view details
    document.querySelectorAll('.btn-view-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        showDetailModal(id);
      });
    });

    // Attach listener for delete
    document.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Delete this analysis record?')) {
          StorageManager.deleteAnalysis(id);
          renderHistoryTable(historySearch ? historySearch.value : '');
        }
      });
    });
  }

  function getBadgeClass(score) {
    if (score >= 76) return 'badge-high';
    if (score >= 51) return 'badge-suspicious';
    if (score >= 26) return 'badge-low';
    return 'badge-safe';
  }

  function getRiskColor(score) {
    if (score >= 76) return 'var(--risk-high)';
    if (score >= 51) return 'var(--risk-suspicious)';
    if (score >= 26) return 'var(--risk-low)';
    return 'var(--risk-safe)';
  }

  function showDetailModal(id) {
    const history = StorageManager.getHistory();
    const item = history.find(h => h.id === id);
    if (!item) return;

    modalTitle.textContent = `Analysis Report: ${item.filename}`;
    
    const threatsHtml = (item.threatCategories || [])
      .filter(t => t.detected)
      .map(t => `<span class="badge badge-high" style="margin-right:0.4rem; margin-bottom:0.4rem;">${t.icon} ${t.name} (${t.confidence}%)</span>`)
      .join('') || '<span style="color:var(--text-muted)">None</span>';

    const recsHtml = (item.recommendations || [])
      .map(r => `<li style="margin-bottom:0.3rem;">${r}</li>`)
      .join('');

    modalBody.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; background:rgba(30,41,59,0.5); padding:1rem; border-radius:var(--radius-md);">
        <div>
          <div style="font-size:0.85rem; color:var(--text-muted);">Risk Assessment Score</div>
          <div style="font-size:2rem; font-weight:900; color:${getRiskColor(item.riskScore)};">
            ${item.riskScore} <span style="font-size:1rem; color:var(--text-muted);">/ 100</span>
          </div>
        </div>
        <div>
          <span class="badge ${getBadgeClass(item.riskScore)}" style="font-size:1rem; padding:0.5rem 1rem;">
            ${item.riskLevel}
          </span>
        </div>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <h4 style="margin-bottom:0.5rem; color:var(--text-main);">Detected Threat Indicators</h4>
        <div>${threatsHtml}</div>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <h4 style="margin-bottom:0.5rem; color:var(--text-main);">AI Summary Explanation</h4>
        <p style="color:var(--text-muted); font-size:0.95rem; line-height:1.5;">${item.explanation}</p>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <h4 style="margin-bottom:0.5rem; color:var(--text-main);">Safety Action Protocol</h4>
        <ul style="padding-left:1.2rem; color:var(--text-muted); font-size:0.9rem;">${recsHtml}</ul>
      </div>

      <div style="margin-bottom: 1rem;">
        <h4 style="margin-bottom:0.5rem; color:var(--text-main);">Raw Transcript Text</h4>
        <div style="background:var(--bg-input); padding:0.75rem; border-radius:var(--radius-sm); font-size:0.88rem; color:var(--text-muted); max-height:120px; overflow-y:auto;">
          ${item.transcript || 'No transcript text available.'}
        </div>
      </div>
    `;

    detailModal.classList.add('active');
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      detailModal.classList.remove('active');
    });
  }

  if (detailModal) {
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) detailModal.classList.remove('active');
    });
  }

  if (historySearch) {
    historySearch.addEventListener('input', (e) => {
      renderHistoryTable(e.target.value);
    });
  }

  if (btnClearAllHistory) {
    btnClearAllHistory.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete all historical analysis logs?')) {
        StorageManager.clearHistory();
        renderHistoryTable();
      }
    });
  }

  renderHistoryTable();
});
