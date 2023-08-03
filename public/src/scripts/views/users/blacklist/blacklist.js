// @filename: Departments.ts
import { deleteEntity, registerEntity, updateEntity, getEntityData, getFilterEntityData } from "../../../endpoints.js";
import { inputObserver, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination } from "../../../tools.js";
import { Config } from "../../../Configs.js";
import { tableLayout } from "./Layout.js";
import { tableLayoutTemplate } from "./Template.js";
import { exportBlackListCsv, exportBlackListPdf, exportBlackListXls } from "../../../exportFiles/blacklist.js";
const tableRows = Config.tableRows;
const currentPage = Config.currentPage;
const customerId = localStorage.getItem('customer_id');
let dataPage;
const getUsers = async () => {
    //const users = await getEntitiesData('BlacklistedUser');
    //const FCustomer = users.filter((data: any) => `${data.customer?.id}` === `${customerId}`);
    let raw = JSON.stringify({
        "filter": {
            "conditions": [
                {
                    "property": "customer.id",
                    "operator": "=",
                    "value": `${customerId}`
                }
            ],
        },
        sort: "-createdDate",
        fetchPlan: 'full',
    });
    dataPage = await getFilterEntityData("BlacklistedUser", raw);
    return dataPage;
};
export class Blacklist {
    constructor() {
        this.dialogContainer = document.getElementById('app-dialogs');
        this.entityDialogContainer = document.getElementById('entity-editor-container');
        this.content = document.getElementById('datatable-container');
        this.searchEntity = async (tableBody, data) => {
            const search = document.getElementById('search');
            await search.addEventListener('keyup', () => {
                const arrayData = data.filter((user) => `${user.dni}
                ${user.firstName}
                ${user.firstLastName}
                ${user.secondLastName}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase()));
                let filteredResult = arrayData.length;
                let result = arrayData;
                if (filteredResult >= tableRows)
                    filteredResult = tableRows;
                this.load(tableBody, currentPage, result);
            });
        };
        this.import = () => {
            const _importContractors = document.getElementById('import-entities');
            _importContractors.addEventListener('click', () => {
                this.entityDialogContainer.innerHTML = '';
                this.entityDialogContainer.style.display = 'flex';
                this.entityDialogContainer.innerHTML = `
                    <div class="entity_editor id="entity-editor">
                        <div class="entity_editor_header">
                            <div class="user_info">
                                <div class="avatar">
                                    <i class="fa-regular fa-up-from-line"></i>
                                </div>
                                <h1 class="entity_editor_title">Importar <br> <small>Persona</small></h1>
                            </div>
                            <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
                        </div>
                        <!--EDITOR BODY -->
                        <div class="entity_editor_body padding_t_8_important">
                            <div class="sidebar_section">
                                <div class="file_template">
                                    <i class="fa-solid fa-file-csv"></i>
                                    <div class="description">
                                        <p class="filename">Plantilla de Lista Negra</p>
                                        <a href="./public/src/templates/NetvisitorsBlackList.csv" download="./public/src/templates/NetvisitorsBlackList.csv" rel="noopener" target="_self" class="filelink">Descargar</a>
                                    </div>
                                </div>
                            </div>
                            <div class="sidebar_section">
                                <input type="file" id="file-handler">
                            </div>
                        </div>
                        <div class="entity_editor_footer">
                            <button class="btn btn_primary btn_widder" id="button-import">Importar<button>
                        </div>
                    </div>
                `;
                this.close();
                const _fileHandler = document.getElementById('file-handler');
                _fileHandler.addEventListener('change', () => {
                    readFile(_fileHandler.files[0]);
                });
                async function readFile(file) {
                    const fileReader = new FileReader();
                    fileReader.readAsText(file);
                    fileReader.addEventListener('load', (e) => {
                        let result = e.srcElement.result;
                        let resultSplit = result.split('\r');
                        let rawFile;
                        let stageUsers = [];
                        for (let i = 1; i < resultSplit.length; i++) {
                            let blackListData = resultSplit[i].split(';');
                            rawFile = JSON.stringify({
                                "firstName": `${blackListData[0]?.replace(/\n/g, '')}`,
                                "firstLastName": `${blackListData[1]?.replace(/\n/g, '')}`,
                                "secondLastName": `${blackListData[2]?.replace(/\n/g, '')}`,
                                "dni": `${blackListData[3]?.replace(/\n/g, '')}`,
                            });
                            stageUsers.push(rawFile);
                        }
                        const _import = document.getElementById('button-import');
                        _import.addEventListener('click', () => {
                            stageUsers.forEach((user) => {
                                registerEntity(user, 'BlacklistedUser')
                                    .then((res) => {
                                    setTimeout(async () => {
                                        let data = await getUsers();
                                        const tableBody = document.getElementById('datatable-body');
                                        const container = document.getElementById('entity-editor-container');
                                        new CloseDialog().x(container);
                                        new Blacklist().load(tableBody, currentPage, data);
                                    }, 1000);
                                });
                            });
                        });
                    });
                }
            });
        };
        this.export = () => {
            const exportUsers = document.getElementById('export-entities');
            exportUsers.addEventListener('click', async () => {
                this.dialogContainer.style.display = 'block';
                this.dialogContainer.innerHTML = `
                <div class="dialog_content" id="dialog-content">
                    <div class="dialog">
                        <div class="dialog_container padding_8">
                            <div class="dialog_header">
                                <h2>Seleccione un tipo</h2>
                            </div>

                            <div class="dialog_message padding_8">
                                <div class="form_group">
                                    <label for="exportCsv">
                                        <input type="radio" id="exportCsv" name="exportOption" value="csv" /> CSV
                                    </label>

                                    <label for="exportXls">
                                        <input type="radio" id="exportXls" name="exportOption" value="xls" checked /> XLS
                                    </label>

                                    <label for="exportPdf">
                                        <input type="radio" id="exportPdf" name="exportOption" value="pdf" /> PDF
                                    </label>
                                </div>
                            </div>

                            <div class="dialog_footer">
                                <button class="btn btn_primary" id="cancel">Cancelar</button>
                                <button class="btn btn_danger" id="export-data">Exportar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
                inputObserver();
                const _closeButton = document.getElementById('cancel');
                const exportButton = document.getElementById('export-data');
                const _dialog = document.getElementById('dialog-content');
                exportButton.addEventListener('click', async () => {
                    const _values = {
                        exportOption: document.getElementsByName('exportOption')
                    };
                    const users = dataPage; //await getUsers();
                    for (let i = 0; i < _values.exportOption.length; i++) {
                        let ele = _values.exportOption[i];
                        if (ele.type = "radio") {
                            if (ele.checked) {
                                if (ele.value == "xls") {
                                    // @ts-ignore
                                    exportBlackListXls(users);
                                }
                                else if (ele.value == "csv") {
                                    // @ts-ignore
                                    exportBlackListCsv(users);
                                }
                                else if (ele.value == "pdf") {
                                    // @ts-ignore
                                    exportBlackListPdf(users);
                                }
                            }
                        }
                    }
                });
                _closeButton.onclick = () => {
                    new CloseDialog().x(_dialog);
                };
            });
        };
    }
    async render() {
        this.content.innerHTML = '';
        this.content.innerHTML = tableLayout;
        const tableBody = document.getElementById('datatable-body');
        tableBody.innerHTML = '.Cargando...';
        let data = await getUsers();
        tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows);
        this.load(tableBody, currentPage, data);
        new filterDataByHeaderType().filter();
        this.searchEntity(tableBody, data);
        this.pagination(data, tableRows, currentPage);
    }
    load(table, currentPage, data) {
        table.innerHTML = '';
        currentPage--;
        let start = tableRows * currentPage;
        let end = start + tableRows;
        let paginatedItems = data.slice(start, end);
        if (data.length === 0) {
            let row = document.createElement('tr');
            row.innerHTML = `
        <td>los datos no coinciden con su búsqueda</td>
        <td></td>
        <td></td>
      `;
            table.appendChild(row);
        }
        else {
            for (let i = 0; i < paginatedItems.length; i++) {
                let blacklist = paginatedItems[i];
                let row = document.createElement('tr');
                row.innerHTML += `
          <td>${blacklist.dni}</dt>
          <td>${blacklist.firstName}</dt>
          <td>${blacklist.firstLastName}</dt>
          <td>${blacklist.secondLastName}</dt>
          <td class="entity_options">
            <button class="button" id="edit-entity" data-entityId="${blacklist.id}">
              <i class="fa-solid fa-pen"></i>
            </button>

            <button class="button" id="remove-entity" data-entityId="${blacklist.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </dt>
        `;
                table.appendChild(row);
            }
        }
        this.register();
        this.import();
        this.export();
        this.edit(this.entityDialogContainer, data);
        this.remove();
    }
    register() {
        // register entity
        const openEditor = document.getElementById('new-entity');
        openEditor.addEventListener('click', () => {
            renderInterface();
        });
        const renderInterface = async () => {
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
            <div class="entity_editor" id="entity-editor">
            <div class="entity_editor_header">
              <div class="user_info">
                <div class="avatar"><i class="fa-regular fa-user"></i></div>
                <h1 class="entity_editor_title">Registrar <br><small>Persona</small></h1>
              </div>
  
              <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
            </div>
  
            <!-- EDITOR BODY -->
            <div class="entity_editor_body">
              <div class="material_input">
                <input type="text" id="entity-firstname" autocomplete="none">
                <label for="entity-firstname">Nombre</label>
              </div>
  
              <div class="material_input">
                <input type="text" id="entity-firstLastName" autocomplete="none">
                <label for="entity-firstLastName">Apellido</label>
              </div>
  
              <div class="material_input">
                <input type="text" id="entity-secondlastname" autocomplete="none">
                <label for="entity-secondlastname">2do Apellido</label>
              </div>
  
              <div class="material_input">
                <input type="text"
                  id="entity-dni"
                  maxlength="10" autocomplete="none">
                <label for="entity-dni">Cédula</label>
              </div>
  
            </div>
            <!-- END EDITOR BODY -->
  
            <div class="entity_editor_footer">
              <button class="btn btn_primary btn_widder" id="register-entity">Guardar</button>
            </div>
          </div>
      `;
            // @ts-ignore
            inputObserver();
            //inputSelect('Customer', 'entity-customer')
            this.close();
            const registerButton = document.getElementById('register-entity');
            registerButton.addEventListener('click', () => {
                let _values;
                _values = {
                    firstName: document.getElementById('entity-firstname'),
                    firstLastName: document.getElementById('entity-firstLastName'),
                    secondLastName: document.getElementById('entity-secondlastname'),
                    dni: document.getElementById('entity-dni'),
                };
                const blackuserRaw = JSON.stringify({
                    "firstLastName": `${_values.firstLastName.value}`,
                    "secondLastName": `${_values.secondLastName.value}`,
                    "firstName": `${_values.firstName.value}`,
                    "customer": {
                        "id": `${customerId}`
                    },
                    "dni": `${_values.dni.value}`
                });
                if (_values.firstName.value === '' || _values.firstName.value === undefined) {
                    alert("¡Nombre vacío!");
                }
                else if (_values.firstLastName.value === '' || _values.firstLastName.value === undefined) {
                    alert("¡Primer apellido vacío!");
                }
                else if (_values.secondLastName.value === '' || _values.secondLastName.value === undefined) {
                    alert("¡Segundo apellido vacío!");
                }
                else if (_values.dni.value === '' || _values.dni.value === undefined) {
                    alert("DNI vacío!");
                }
                else {
                    reg(blackuserRaw);
                }
            });
        };
        const reg = async (raw) => {
            registerEntity(raw, 'BlacklistedUser')
                .then((res) => {
                setTimeout(async () => {
                    let data = await getUsers();
                    const tableBody = document.getElementById('datatable-body');
                    const container = document.getElementById('entity-editor-container');
                    new CloseDialog().x(container);
                    new Blacklist().load(tableBody, currentPage, data);
                }, 1000);
            });
        };
    }
    edit(container, data) {
        // Edit entity
        const edit = document.querySelectorAll('#edit-entity');
        edit.forEach((edit) => {
            const entityId = edit.dataset.entityid;
            edit.addEventListener('click', () => {
                RInterface('BlacklistedUser', entityId);
            });
        });
        const RInterface = async (entities, entityID) => {
            const data = await getEntityData(entities, entityID);
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
                <div class="entity_editor" id="entity-editor">
                <div class="entity_editor_header">
                    <div class="user_info">
                    <div class="avatar"><i class="fa-regular fa-user"></i></div>
                    <h1 class="entity_editor_title">Editar <br><small>Persona</small></h1>
                    </div>

                    <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
                </div>

                <!-- EDITOR BODY -->
                <div class="entity_editor_body">
                    <div class="material_input">
                    <input type="text" id="entity-firstname" class="input_filled" value="${data.firstName}">
                    <label for="entity-firstname">Nombre</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-firstLastName" class="input_filled" value="${data.firstLastName}">
                    <label for="entity-firstLastName">Apellido</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-secondlastname" class="input_filled" value="${data.secondLastName}">
                    <label for="entity-secondlastname">2do Apellido</label>
                    </div>

                    <div class="material_input">
                    <input type="text"
                        id="entity-dni"
                        class="input_filled"
                        maxlength="10"
                        value="${data?.dni ?? ''}">
                    <label for="entity-dni">Cédula</label>
                    </div>

                </div>
                <!-- END EDITOR BODY -->

                <div class="entity_editor_footer">
                    <button class="btn btn_primary btn_widder" id="update-changes">Guardar</button>
                </div>
                </div>
            `;
            inputObserver();
            this.close();
            updateBlackUser(entityID);
        };
        const updateBlackUser = async (contractorId) => {
            let updateButton;
            updateButton = document.getElementById('update-changes');
            const _values = {
                firstName: document.getElementById('entity-firstname'),
                firstLastName: document.getElementById('entity-firstLastName'),
                secondLastName: document.getElementById('entity-secondlastname'),
                dni: document.getElementById('entity-dni')
            };
            updateButton.addEventListener('click', () => {
                let blackuserRaw = JSON.stringify({
                    "firstLastName": `${_values.firstLastName.value}`,
                    "secondLastName": `${_values.secondLastName.value}`,
                    "firstName": `${_values.firstName.value}`,
                    "dni": `${_values.dni.value}`,
                });
                update(blackuserRaw);
            });
            /**
             * Update entity and execute functions to finish defying user
             * @param raw
             */
            const update = (raw) => {
                updateEntity('BlacklistedUser', contractorId, raw)
                    .then((res) => {
                    setTimeout(async () => {
                        let tableBody;
                        let container;
                        let data;
                        tableBody = document.getElementById('datatable-body');
                        container = document.getElementById('entity-editor-container');
                        data = await getUsers();
                        new CloseDialog().x(container);
                        new Blacklist().load(tableBody, currentPage, data);
                    }, 100);
                });
            };
        };
    }
    remove() {
        const remove = document.querySelectorAll('#remove-entity');
        remove.forEach((remove) => {
            const entityId = remove.dataset.entityid;
            remove.addEventListener('click', () => {
                this.dialogContainer.style.display = 'block';
                this.dialogContainer.innerHTML = `
          <div class="dialog_content" id="dialog-content">
            <div class="dialog dialog_danger">
              <div class="dialog_container">
                <div class="dialog_header">
                  <h2>¿Deseas eliminar esta persona?</h2>
                </div>

                <div class="dialog_message">
                  <p>Esta acción no se puede revertir</p>
                </div>

                <div class="dialog_footer">
                  <button class="btn btn_primary" id="cancel">Cancelar</button>
                  <button class="btn btn_danger" id="delete">Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        `;
                // delete button
                // cancel button
                // dialog content
                const deleteButton = document.getElementById('delete');
                const cancelButton = document.getElementById('cancel');
                const dialogContent = document.getElementById('dialog-content');
                deleteButton.onclick = () => {
                    deleteEntity('BlacklistedUser', entityId)
                        .then((res) => {
                        setTimeout(async () => {
                            let data = await getUsers();
                            const tableBody = document.getElementById('datatable-body');
                            new CloseDialog().x(dialogContent);
                            new Blacklist().load(tableBody, currentPage, data);
                        }, 1000);
                    });
                };
                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent);
                    this.render();
                };
            });
        });
    }
    close() {
        const closeButton = document.getElementById('close');
        const editor = document.getElementById('entity-editor-container');
        closeButton.addEventListener('click', () => {
            console.log('close');
            new CloseDialog().x(editor);
        });
    }
    pagination(items, limitRows, currentPage) {
        const tableBody = document.getElementById('datatable-body');
        const paginationWrapper = document.getElementById('pagination-container');
        paginationWrapper.innerHTML = '';
        let pageCount;
        pageCount = Math.ceil(items.length / limitRows);
        let button;
        if (pageCount <= Config.maxLimitPage) {
            for (let i = 1; i < pageCount + 1; i++) {
                button = setupButtons(i, items, currentPage, tableBody, limitRows);
                paginationWrapper.appendChild(button);
            }
            fillBtnPagination(currentPage, Config.colorPagination);
        }
        else {
            pagesOptions(items, currentPage);
        }
        function setupButtons(page, items, currentPage, tableBody, limitRows) {
            const button = document.createElement('button');
            button.classList.add('pagination_button');
            button.setAttribute("name", "pagination-button");
            button.setAttribute("id", "btnPag" + page);
            button.innerText = page;
            button.addEventListener('click', () => {
                const buttons = document.getElementsByName("pagination-button");
                buttons.forEach(button => {
                    button.style.background = "#ffffff";
                });
                currentPage = page;
                fillBtnPagination(page, Config.colorPagination);
                new Blacklist().load(tableBody, page, items);
            });
            return button;
        }
        function setupButtons2(page) {
            const button = document.createElement('button');
            button.classList.add('pagination_button');
            button.setAttribute("id", "btnPag" + page);
            button.innerText = page;
            button.addEventListener('click', () => {
                currentPage = page;
                pagesOptions(items, currentPage);
                new Blacklist().load(tableBody, page, items);
            });
            return button;
        }
        function pagesOptions(items, currentPage) {
            paginationWrapper.innerHTML = '';
            let pages = pageNumbers(items, Config.maxLimitPage, currentPage);
            const prevButton = document.createElement('button');
            prevButton.classList.add('pagination_button');
            prevButton.innerText = "<<";
            paginationWrapper.appendChild(prevButton);
            const nextButton = document.createElement('button');
            nextButton.classList.add('pagination_button');
            nextButton.innerText = ">>";
            for (let i = 0; i < pages.length; i++) {
                if (pages[i] <= pageCount) {
                    button = setupButtons2(pages[i]);
                    paginationWrapper.appendChild(button);
                }
            }
            paginationWrapper.appendChild(nextButton);
            fillBtnPagination(currentPage, Config.colorPagination);
            setupButtonsEvents(prevButton, nextButton);
        }
        function setupButtonsEvents(prevButton, nextButton) {
            prevButton.addEventListener('click', () => {
                pagesOptions(items, 1);
                new Blacklist().load(tableBody, 1, items);
            });
            nextButton.addEventListener('click', () => {
                pagesOptions(items, pageCount);
                new Blacklist().load(tableBody, pageCount, items);
            });
        }
    }
}
