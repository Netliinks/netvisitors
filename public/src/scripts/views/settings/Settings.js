import { getEntityData, updateEntity } from "../../endpoints.js";
import { settingsLayout } from "./Layout.js";
export class Settings {
    constructor() {
        this.content = document.getElementById('datatable-container');
    }
    async render() {
        this.content.innerHTML = '';
        this.content.innerHTML = settingsLayout;
        const customerId = localStorage.getItem('customer_id');
        if (!customerId)
            return;
        const customer = await getEntityData('Customer', customerId);
        const permitPersonalStatic = document.getElementById('permitPersonalStatic');
        const statusMessage = document.getElementById('status-message');
        if (customer.permitPersonalStatic) {
            permitPersonalStatic.checked = true;
        }
        permitPersonalStatic.addEventListener('change', async () => {
            const originalState = !permitPersonalStatic.checked;
            statusMessage.style.opacity = '0';
            const raw = JSON.stringify({
                "permitPersonalStatic": permitPersonalStatic.checked
            });
            try {
                await updateEntity('Customer', customerId, raw);
                statusMessage.innerText = 'Actualizado correctamente';
                statusMessage.style.color = '#28a745';
                statusMessage.style.opacity = '1';
                setTimeout(() => {
                    statusMessage.style.opacity = '0';
                }, 2500);
            }
            catch (error) {
                statusMessage.innerText = 'No se pudo ejecutar';
                statusMessage.style.color = '#dc3545';
                statusMessage.style.opacity = '1';
                permitPersonalStatic.checked = originalState;
                setTimeout(() => {
                    statusMessage.style.opacity = '0';
                }, 2500);
            }
        });
    }
}
