export const settingsLayout = `
<div class="datatable" id="datatable">
  <div class="datatable_header">
    <div class="datatable_title" id="datatable-title"><h1>Configuración</h1></div>
  </div>

  <div class="datatable_content" style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
    <div class="card_setting" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; border: 1px solid #ddd; border-radius: 8px; background: #fff;">
        <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-weight: 600; font-size: 1.1rem;">Permitir personal estático</span>
            <span style="color: #666; font-size: 0.9rem;">Habilitar QR estático en accesos de clientes, empleados, contratistas.</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
            <span id="status-message" style="font-size: 0.8rem; font-weight: 600; transition: opacity 0.3s;"></span>
            <input type="checkbox" class="checkbox" id="permitPersonalStatic" style="transform: scale(1.5); cursor: pointer;">
        </div>
    </div>
  </div>
</div>
`;
