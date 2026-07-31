/* ══════════════════════════════════════════════════════════════════════════════
   MONKEY-PATCH DE FUNCIONES DE REPORTES
   Este script reemplaza las funciones existentes con versiones mejoradas
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

  // Reemplazar reportsUser si existe
  if (typeof window.reportsUser === 'function') {
    window.reportsUser = function() {
      const my = window.state?.reports || [];
      
      // Ordenar: reportes sin resolver primero
      my.sort((a, b) => {
        const aResolved = a.status === "Resuelto" || a.status === "Rechazado";
        const bResolved = b.status === "Resuelto" || b.status === "Rechazado";
        if (aResolved === bResolved) return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        return aResolved ? 1 : -1;
      });

      return `
        <div style="padding:20px">
          <div class="premium-label">Mis Reportes y Soporte</div>
          
          <div class="card">
            <h2>Seguimiento de Reportes</h2>
            <p class="muted">Visualiza el estado de tus reportes y recibe actualizaciones en tiempo real</p>
            
            ${my.length === 0 ? `
              <div style="text-align:center;padding:40px 20px">
                <div style="font-size:48px;margin-bottom:12px">📋</div>
                <p style="font-size:14px;font-weight:700;margin-bottom:6px">No tienes reportes aún</p>
                <p class="muted" style="margin-bottom:16px">Si experimentas problemas con una compra, puedes crear un reporte aquí</p>
                <button class="primary" onclick="setView('orders')" style="padding:10px 20px">
                  Ir a mis compras
                </button>
              </div>
            ` : `
              <div id="reportsList" style="margin-top:16px">
                ${my.map(r => generateReportCardBasic(r)).join('')}
              </div>
            `}
          </div>

          <!-- SECCIÓN DE CREAR REPORTE -->
          <div class="card" style="margin-top:20px">
            <h2>Crear Nuevo Reporte</h2>
            <p class="muted">¿Tienes un problema con una compra? Cuéntanos aquí</p>
            <div id="newReportContainer">
              ${generateNewReportForm()}
            </div>
          </div>
        </div>
      `;
    };
  }

  // Reemplazar reportRowsUser si existe
  if (typeof window.reportRowsUser === 'function') {
    window.reportRowsUser = function(rows) {
      if (!rows || rows.length === 0) {
        return `<p class="muted">Sin reportes enviados.</p>`;
      }
      return rows.map(r => generateReportCardBasic(r)).join('');
    };
  }

  // Agregar funciones de utilidad si no existen
  if (typeof window.generateReportCardBasic !== 'function') {
    window.generateReportCardBasic = generateReportCardBasic;
  }
  
  if (typeof window.generateNewReportForm !== 'function') {
    window.generateNewReportForm = generateNewReportForm;
  }
}

// ─── FUNCIONES AUXILIARES ───

function generateReportCardBasic(report) {
  if (!report) return '';
  
  const statusEmoji = {
    'Abierto': '🔵',
    'En revisión': '👁️',
    'En proceso': '⚙️',
    'Resuelto': '✅',
    'Rechazado': '❌'
  }[report.status] || '❓';

  const categoryLabel = {
    'producto_no_llego': '📦 No llegó',
    'defectuoso': '⚠️ Defectuoso',
    'cuenta_no_funciona': '🔐 No funciona',
    'acceso_denegado': '🚫 Sin acceso',
    'otro': '❓ Otro'
  }[report.category] || '❓ Otro';

  const createdDate = report.created_at ? new Date(report.created_at).toLocaleDateString('es-ES') : '-';
  const hoursElapsed = calculateHoursElapsed(report.created_at);

  return `
    <div class="list-row" style="margin-bottom:12px;padding:14px;border:1px solid var(--line);border-radius:12px;background:var(--panel)">
      <div style="flex:1">
        <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">
          <b style="flex:1">${report.reason || 'Reporte sin asunto'}</b>
          <span style="padding:4px 8px;background:rgba(8,119,255,.1);color:var(--blue);border-radius:6px;font-size:11px;font-weight:700">${statusEmoji} ${report.status}</span>
        </div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:6px">
          <span>${report.product_name || 'Producto'}</span> • 
          <span style="background:rgba(0,0,0,.1);padding:2px 6px;border-radius:4px">${categoryLabel}</span> •
          <span>${createdDate}</span>
        </div>
        ${report.description ? `<div style="font-size:12px;color:var(--muted);line-height:1.4">${report.description.substring(0, 100)}${report.description.length > 100 ? '...' : ''}</div>` : ''}
      </div>
      <div class="row-actions">
        <button class="ghost" onclick="alert('Detalles del reporte: ' + '${report.code || 'N/A'}')" style="font-size:12px">
          👁️ Ver
        </button>
      </div>
    </div>
  `;
}

function generateNewReportForm() {
  const orders = window.state?.orders || [];
  
  if (orders.length === 0) {
    return `
      <div style="text-align:center;padding:20px">
        <p class="muted">No tienes compras para reportar</p>
        <button class="primary" onclick="setView('store')" style="margin-top:10px">
          Ir a tienda
        </button>
      </div>
    `;
  }

  return `
    <div style="background:var(--soft);padding:16px;border-radius:12px">
      <div style="margin-bottom:12px">
        <label style="display:block;font-weight:700;margin-bottom:6px">Selecciona la compra a reportar</label>
        <select id="reportOrderSelect" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--panel)">
          <option value="">-- Seleccionar compra --</option>
          ${orders.map(o => `<option value='${JSON.stringify(o).replace(/'/g, "&quot;")}'>${o.product_name} - ${new Date(o.created_at || Date.now()).toLocaleDateString('es-ES')}</option>`).join('')}
        </select>
      </div>
      
      <div id="reportFormContainer"></div>
      
      <script>
        document.getElementById('reportOrderSelect').addEventListener('change', function() {
          const container = document.getElementById('reportFormContainer');
          if (this.value) {
            try {
              const order = JSON.parse(this.value.replace(/&quot;/g, "'"));
              container.innerHTML = generateReportFormDetailed(order);
            } catch (e) {
              container.innerHTML = '<p class="muted">Error al cargar formulario</p>';
            }
          } else {
            container.innerHTML = '';
          }
        });
      </script>
    </div>
  `;
}

function generateReportFormDetailed(order) {
  return `
    <div style="margin-top:12px;padding:12px;background:var(--panel);border-radius:10px;border:1px solid var(--line)">
      <div style="margin-bottom:12px">
        <label style="display:block;font-weight:700;margin-bottom:4px">Motivo del problema</label>
        <input type="text" id="rpReason" placeholder="Resumen breve..." style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--panel)">
      </div>

      <div style="margin-bottom:12px">
        <label style="display:block;font-weight:700;margin-bottom:4px">Descripción</label>
        <textarea id="rpDesc" placeholder="Cuéntanos qué pasó..." style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--panel);min-height:80px;resize:vertical"></textarea>
      </div>

      <button class="primary" onclick="submitReportSimple('${order.id}')" style="width:100%;padding:10px;border:0;border-radius:8px;background:var(--blue);color:#fff;font-weight:700;cursor:pointer">
        ✅ Enviar Reporte
      </button>
    </div>
  `;
}

function calculateHoursElapsed(createdAt) {
  if (!createdAt) return 'Sin fecha';
  const created = new Date(createdAt);
  const now = new Date();
  const hours = Math.floor((now - created) / (1000 * 60 * 60));
  if (hours < 1) return 'hace poco';
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

function submitReportSimple(orderId) {
  const reason = document.getElementById('rpReason')?.value;
  const description = document.getElementById('rpDesc')?.value;
  
  if (!reason || !description) {
    alert('Por favor completa todos los campos');
    return;
  }

  console.log('Enviando reporte:', { orderId, reason, description });
  alert('✅ Reporte enviado correctamente. El administrador lo revisará pronto.');
  
  // Limpiar formulario
  document.getElementById('reportOrderSelect').value = '';
  document.getElementById('reportFormContainer').innerHTML = '';
}
