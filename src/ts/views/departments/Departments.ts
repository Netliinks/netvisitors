// @filename: Departments.ts

import { deleteEntity, getEntityData, updateEntity, registerEntity, getFilterEntityData, getFilterEntityCount, deleteDepartment } from "../../endpoints.js"
import { inputObserver, inputSelect, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination } from "../../tools.js"
import { InterfaceElement } from "../../types.js"
import { Config } from "../../Configs.js"
import { tableLayout } from "./Layout.js"
import { tableLayoutTemplate } from "./Template.js"

const tableRows = Config.tableRows
const currentPage = Config.currentPage
const customerId = localStorage.getItem('customer_id');
let infoPage = {
    count: 0,
    offset: Config.offset,
    currentPage: currentPage,
    search: ""
}
let dataPage: any
const getDepartments = async (): Promise<void> => {
    //const departmentRaw: any = await getEntitiesData('Department')
    //const department = departmentRaw.filter((data: any) => `${data.customer?.id}` === `${customerId}`)
    let raw = JSON.stringify({
        "filter": {
            "conditions": [
              {
                "property": "customer.id",
                "operator": "=",
                "value": `${customerId}`
              },
              {
                "property": "state.name",
                "operator": "<>",
                "value": `${Config.nameDelete}`
              },
            ],
            
        }, 
        sort: "-createdDate",     
        limit: Config.tableRows,
        offset: infoPage.offset,
    })
    if(infoPage.search != ""){
        raw = JSON.stringify({
            "filter": {
                "conditions": [
                  {
                    "group": "OR",
                    "conditions": [
                      {
                        "property": "name",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      }
                    ]
                  },
                  {
                    "property": "customer.id",
                    "operator": "=",
                    "value": `${customerId}`
                  },
                  {
                    "property": "state.name",
                    "operator": "<>",
                    "value": `${Config.nameDelete}`
                  }
                ]
              },
            sort: "-createdDate",
            limit: Config.tableRows,
            offset: infoPage.offset
            
        })
    }
    infoPage.count = await getFilterEntityCount("Department", raw)
    dataPage = await getFilterEntityData("Department", raw)
    return dataPage

}

export class Departments {
    private dialogContainer: InterfaceElement =
        document.getElementById('app-dialogs')

    private entityDialogContainer: InterfaceElement =
        document.getElementById('entity-editor-container')

    private content: InterfaceElement =
        document.getElementById('datatable-container')

    public async render(offset: any, actualPage: any, search: any): Promise<void> {
        infoPage.offset = offset
        infoPage.currentPage = actualPage
        infoPage.search = search   
        this.content.innerHTML = ''
        this.content.innerHTML = tableLayout
        const tableBody: InterfaceElement = document.getElementById('datatable-body')
        tableBody.innerHTML = '.Cargando...'
        
        let data: any = await getDepartments()
        tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows)
        this.load(tableBody, currentPage, data)
        new filterDataByHeaderType().filter()
        this.searchEntity(tableBody/*, data*/)
        this.pagination(data, tableRows, infoPage.currentPage)
    }

    public load(table: InterfaceElement, currentPage: number, data?: any) {
        table.innerHTML = ''
        currentPage--
        let start: number = tableRows * currentPage
        let end: number = start + tableRows
        let paginatedItems: any = data.slice(start, end)
        if (data.length === 0) {
            let row: InterfaceElement = document.createElement('tr')
            row.innerHTML = `
        <td>los datos no coinciden con su búsqueda</td>
        <td></td>
        <td></td>
      `
            table.appendChild(row)
        }
        else {
            for (let i = 0; i < paginatedItems.length; i++) {
                let department = paginatedItems[i]
                let row: InterfaceElement =
                    document.createElement('tr')
                row.innerHTML += `
          <td>${department.name}</td>
          <td class="entity_options">
            <button class="btn btn_edit" id="edit-entity" data-entityid="${department.id}"><i class="fa-solid fa-pen-to-square"></i></button>

            <button class="button" id="remove-entity" data-entityId="${department.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        `
                table.appendChild(row)
            }
        }

        this.register()
        this.edit()
        this.remove()
    }

    public searchEntity = async (tableBody: InterfaceElement /*, data: any*/) => {
        const search: InterfaceElement = document.getElementById('search')
        const btnSearch: InterfaceElement = document.getElementById('btnSearch')
        search.value = infoPage.search
        await search.addEventListener('keyup', () => {
            /*const arrayData: any = data.filter((user: any) =>
                `${user.firstName}
                 ${user.lastName}
                 ${user.username}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase())
            )

            let filteredResult = arrayData.length
            let result = arrayData
            if (filteredResult >= tableRows) filteredResult = tableRows

            this.load(tableBody, currentPage, result)
            */
        })
        btnSearch.addEventListener('click', async () => {
            new Departments().render(Config.offset , Config.currentPage, search.value.toLowerCase().trim())
        })
    }

    public register() {
        // register entity
        const openEditor: InterfaceElement = document.getElementById('new-entity')
        openEditor.addEventListener('click', (): void => {
            renderInterface()
        })

        const renderInterface = async (): Promise<void> => {
            this.entityDialogContainer.innerHTML = ''
            this.entityDialogContainer.style.display = 'flex'
            this.entityDialogContainer.innerHTML = `
        <div class="entity_editor" id="entity-editor">
          <div class="entity_editor_header">
            <div class="user_info">
              <div class="avatar"><i class="fa-solid fa-building"></i></div>
              <h1 class="entity_editor_title">Registrar <br><small>Departamento</small></h1>
            </div>

            <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
          </div>

          <!-- EDITOR BODY -->
          <div class="entity_editor_body">
            <div class="material_input">
              <input type="text" id="entity-name" autocomplete="none">
              <label for="entity-name">Nombre</label>
            </div>

            <!--
            <div class="material_input_select">
              <label for="entity-customer">Cliente</label>
              <input type="text" id="entity-customer" class="input_select" readonly placeholder="cargando...">
              <div id="input-options" class="input_options">
              </div>
            </div> -->
          </div>
          <!-- END EDITOR BODY -->

          <div class="entity_editor_footer">
            <button class="btn btn_primary btn_widder" id="register-entity">Guardar</button>
          </div>
        </div>
      `

            // @ts-ignore
            inputObserver()
            //inputSelect('Customer', 'entity-customer')
            this.close()


            const registerButton: InterfaceElement = document.getElementById('register-entity')
            registerButton.addEventListener('click', (): void => {
                const inputsCollection: any = {
                    name: document.getElementById('entity-name'),
                    customer: document.getElementById('entity-customer'),
                }

                const raw = JSON.stringify({
                    "name": `${inputsCollection.name.value}`,
                    "customer": {
                        "id": `${customerId}`
                    }
                })

                registerEntity(raw, 'Department')
                setTimeout(() => {
                    const container: InterfaceElement = document.getElementById('entity-editor-container')

                    new CloseDialog().x(container)
                    new Departments().render(Config.offset, Config.currentPage, infoPage.search)
                }, 1000)
            })

        }

        const reg = async (raw: any) => {
        }
    }

    public edit(): void {
        const edit: InterfaceElement = document.querySelectorAll('#edit-entity');
          edit.forEach((edit: any) => {
              const entityId = edit.dataset.entityid;
              edit.addEventListener('click', () => {
                  RInterface('Department', entityId);
              });
          });
          const RInterface = async (entities: any, entityID: any) => {
              const data = await getEntityData(entities, entityID);
              this.entityDialogContainer.innerHTML = '';
              this.entityDialogContainer.style.display = 'flex';
              //<div class="entity_editor" id="entity-editor" style="max-width:80%"></div>
              this.entityDialogContainer.innerHTML = `
          <div class="entity_editor" id="entity-editor">
            <div class="entity_editor_header">
              <div class="user_info">
                <div class="avatar"><i class="fa-regular fa-map-location"></i></div>
                <h1 class="entity_editor_title">Editar <br><small>${data.name}</small></h1>
              </div>
              <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
            </div>
            <!-- EDITOR BODY -->
            <div class="entity_editor_body">
                  <div class="material_input">
                    <input type="text"
                      id="entity-name"
                      class="input_filled"
                      value="${data?.name ?? ''}">
                    <label for="entity-name">Nombre Departamento</label>
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
              UUpdate(entityID, data);
          };
          const UUpdate = async (entityId: any, data: any) => {
              const updateButton: InterfaceElement = document.getElementById('update-changes');
              const $value: any = {
                // @ts-ignore
                name: document.getElementById('entity-name'),
    
              };
              updateButton.addEventListener('click', async () => {
                if($value.name.value == "" || $value.name.value == undefined){
                    alert("Nombre de departamento vacío");
                }else{
                    updateButton.disabled = true;
                    const originalText = updateButton.innerText;
                    updateButton.innerText = "Actualizando...";

                    try {
                        let raw = JSON.stringify({
                            // @ts-ignore
                            "name": `${$value.name.value}`
                        });
                        await updateEntity('Department', entityId, raw);
                        let container = document.getElementById('entity-editor-container');
                        new CloseDialog().x(container);
                        new Departments().render(infoPage.offset, infoPage.currentPage, infoPage.search);
                    } catch (err: any) {
                        console.error(err);
                        alert("Error al actualizar departamento: " + (err.message || err));
                        updateButton.disabled = false;
                        updateButton.innerText = originalText;
                    }
                }
              });
          };
    }

    public remove(): void {
        const remove: InterfaceElement = document.querySelectorAll('#remove-entity');
        remove.forEach((remove: any) => {
            const entityId = remove.dataset.entityid;

            remove.addEventListener('click', () => {
                this.dialogContainer.style.display = 'flex';
                this.dialogContainer.innerHTML = `
          <div class="dialog_content" id="dialog-content">
            <div class="dialog dialog_danger">
              <div class="dialog_container">
                <div class="dialog_header">
                  <h2>¿Deseas eliminar este departamento?</h2>
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
                const deleteButton: InterfaceElement = document.getElementById('delete');
                const cancelButton: InterfaceElement = document.getElementById('cancel');
                const dialogContent: InterfaceElement = document.getElementById('dialog-content');
                deleteButton.onclick = async () => {
                    await deleteDepartment(entityId)
                        .then((res) => {
                            setTimeout(async () => {
                                //let data = await getUsers();
                                const tableBody: InterfaceElement = document.getElementById('datatable-body');
                                new CloseDialog().x(dialogContent);
                                new Departments().render(infoPage.offset, infoPage.currentPage, infoPage.search);
                            }, 1000);
                        });
                };
                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent);
                    //this.render();
                };
            });
        });
    }

    public close(): void {
        const closeButton: InterfaceElement = document.getElementById('close')
        const editor: InterfaceElement = document.getElementById('entity-editor-container')

        closeButton.addEventListener('click', () => {
            //console.log('close')
            new CloseDialog().x(editor)
        })
    }

    private pagination(items: [], limitRows: number, currentPage: number) {
        const tableBody: InterfaceElement = document.getElementById('datatable-body')
        const paginationWrapper: InterfaceElement = document.getElementById('pagination-container')
        paginationWrapper.innerHTML = ''

        let pageCount: number
        pageCount = Math.ceil(infoPage.count / limitRows)

        let button: InterfaceElement

        if(pageCount <= Config.maxLimitPage){
          for (let i = 1; i < pageCount + 1; i++) {
              button = setupButtons(
                  i /*, items, currentPage, tableBody, limitRows*/
              )

              paginationWrapper.appendChild(button)
          }
          fillBtnPagination(currentPage, Config.colorPagination)
        }else{
            pagesOptions(items, currentPage)  
        }

        function setupButtons(page: any /*, items: any, currentPage: number, tableBody: InterfaceElement, limitRows: number*/) {
            const button: InterfaceElement = document.createElement('button')
            button.classList.add('pagination_button')
            button.setAttribute("name", "pagination-button")
            button.setAttribute("id", "btnPag"+page)
            button.innerText = page

            button.addEventListener('click', (): void => {
                infoPage.offset = Config.tableRows * (page - 1)
                currentPage = page
                new Departments().render(infoPage.offset, currentPage, infoPage.search)
            })

            return button
        }

      function pagesOptions(items: any, currentPage: any) {
          paginationWrapper.innerHTML = ''
          let pages = pageNumbers(items, Config.maxLimitPage, currentPage)
          
          const prevButton: InterfaceElement = document.createElement('button')
          prevButton.classList.add('pagination_button')
          prevButton.innerText = "<<"     
          paginationWrapper.appendChild(prevButton)

          const nextButton: InterfaceElement = document.createElement('button')
          nextButton.classList.add('pagination_button')
          nextButton.innerText = ">>"
  
          for (let i = 0; i < pages.length; i++) {
              if(pages[i] > 0 && pages[i] <= pageCount){
                  button = setupButtons(
                      pages[i]
                  )
                  paginationWrapper.appendChild(button)
              }
          }
          paginationWrapper.appendChild(nextButton)
          fillBtnPagination(currentPage, Config.colorPagination)
          setupButtonsEvents(prevButton, nextButton)
      }

      function setupButtonsEvents(prevButton: InterfaceElement, nextButton: InterfaceElement) {
          prevButton.addEventListener('click', (): void => {
            new Departments().render(Config.offset, Config.currentPage, infoPage.search)
          })

          nextButton.addEventListener('click', (): void => {
            infoPage.offset = Config.tableRows * (pageCount - 1)
            new Departments().render(infoPage.offset, pageCount, infoPage.search)
          })
      }
    }
}