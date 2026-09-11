import { getEntityData, updateEntity } from "../../endpoints.js";
import { settingsLayout } from "./Layout.js";
import { InterfaceElement } from "../../types.js";

export class Settings {
    private content: InterfaceElement = document.getElementById('datatable-container');

    public async render(): Promise<void> {
        this.content.innerHTML = '';
        this.content.innerHTML = settingsLayout;

        const customerId: string | null = localStorage.getItem('customer_id');
        if (!customerId) return;

        const customer: any = await getEntityData('Customer', customerId);

        const permitPersonalStatic: InterfaceElement = document.getElementById('permitPersonalStatic');
        const statusMessage: InterfaceElement = document.getElementById('status-message');
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
