/* ══════════════════════════════════════════════════════════════════════════════
   MONKEY-PATCH DE FUNCIONES DE REPORTES
   Este script mejora visualmente las funciones existentes sin cambiar su lógica
   ══════════════════════════════════════════════════════════════════════════════ */

// Esperar a que el app esté listo
window.addEventListener('load', function() {
  setTimeout(function() {
    try {
      patchReportFunctions();
      console.log('✅ Funciones de reportes parchadas exitosamente');
    } catch (error) {
      console.error('❌ Error al parchear funciones:', error);
    }
  }, 1000);
});

function patchReportFunctions() {
  // Verificar que las funciones necesarias existan
  if (typeof window.setView !== 'function') {
    console.warn('⚠️ Funciones base no disponibles aún');
    return;
  }

  // Guardar la función original de reportRowsUser
  const originalReportRowsUser = window.reportRowsUser;

  // Reemplazar reportRowsUser SOLO para mejorar visualmente, manteniendo la lógica
  if (typeof originalReportRowsUser === 'function') {
    window.reportRowsUser = function(rows) {
      // Llamar a la función original primero
      const originalHTML = originalReportRowsUser.call(this, rows);
      
      // Si no hay reportes, retornar lo original
      if (!rows || rows.length === 0) {
        return originalHTML;
      }
      
      // Si hay reportes, mejorar visualmente
      return rows.map(r => generateReportCardImproved(r)).join('');
    };
  }
}

// ─── GENERADOR DE TARJETA MEJORADA ───
function generateReportCardImproved(report) {
  if (!report) return '';
  
  const statusEmoji = {
    'Abierto': '🔵',
    'En revisión': '👁️',
    'En proceso': '⚙️',
    'Resuelto': '✅',
    'Rechazado': '❌'
  }[report.status] || '❓';

  const statusColor = {
    'Resuelto': 'var(--ok)',
    'Rechazado': 'var(--bad)',
    'En proceso': '#f59e0b'
  }[report.status] || 'var(--warn)';

  const statusClass = report.status === 'Resuelto' ? 'ok' : report.status === 'Rechazado' ? 'bad' : 'warn';

  return `
    <div class="list-row report-card-improved" style="border-left:4px solid ${statusColor};margin-bottom:12px;padding:16px;border-radius:10px;background:var(--soft);transition:all 0.2s ease" onmouseover="this.style.boxShadow='0 4px 12px rgba(8,119,255,0.15)';this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='none';this.style.transform='translateY(0)'">
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap">
          <b style="font-size:14px;color:var(--text)">${report.code || 'REPORTE'}</b>
          <span class="tag ${statusClass}" style="font-size:11px;font-weight:700;padding:4px 8px">${statusEmoji} ${report.status || 'En revisión'}</span>
        </div>
        <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px">${report.product_name || 'Producto'}</div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:8px">
          ${report.reason ? `<div>📌 ${report.reason}</div>` : ''}
          ${report.created_at ? `<div>📅 ${new Date(report.created_at).toLocaleDateString('es-ES')} ${new Date(report.created_at).toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'})}</div>` : ''}
        </div>
        ${report.description ? `
          <div style="padding:10px;background:var(--panel);border-radius:8px;font-size:12px;color:var(--text);border-left:3px solid var(--blue);margin-top:8px">
            <strong>Descripción:</strong><br>
            ${report.description.substring(0, 150)}${report.description.length > 150 ? '...' : ''}
          </div>
        ` : ''}
      </div>
      <div class="row-actions">
        <button class="ghost" onclick="alert('ID Reporte: ${report.id || 'N/A'}\\nCódigo: ${report.code || 'N/A'}\\nEstado: ${report.status || 'N/A'}\\nProducto: ${report.product_name || 'N/A'}')" style="font-size:12px;padding:8px 12px;border:1px solid var(--line);border-radius:6px;background:transparent;cursor:pointer;transition:all 0.2s" onmouseover="this.style.background='rgba(8,119,255,0.1)'" onmouseout="this.style.background='transparent'">
          👁️ Detalles
        </button>
      </div>
    </div>
  `;
}

// ─── FUNCIONES AUXILIARES DE UTILIDAD ───

function calculateHoursElapsed(createdAt) {
  if (!createdAt) return 'Sin fecha';
  const created = new Date(createdAt);
  const now = new Date();
  const hours = Math.floor((now - created) / (1000 * 60 * 60));
  if (hours < 1) return 'hace poco';
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

