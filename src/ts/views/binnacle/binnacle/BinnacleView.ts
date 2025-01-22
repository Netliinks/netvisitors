// @filename: EvetnsView.ts

import { Config } from "../../../Configs.js"
import { getEntityData, getFilterEntityData, getFilterEntityCount } from "../../../endpoints.js"
import { exportBinnacleCsv, exportBinnaclePdf, exportBinnacleXls } from "../../../exportFiles/binnacle.js"
import { CloseDialog, drawTagsIntoTables, renderRightSidebar, filterDataByHeaderType, inputObserver, pageNumbers, fillBtnPagination, calculateLine } from "../../../tools.js"
import { InterfaceElement, InterfaceElementCollection } from "../../../types.js"
import { UIContentLayout, UIRightSidebar } from "./Layout.js"
import { UITableSkeletonTemplate } from "./Template.js"

// Local configs
const tableRows = Config.tableRows
let currentPage = Config.currentPage
const pageName = 'Bitácora'
const customerId = localStorage.getItem('customer_id')
let infoPage = {
    count: 0,
    offset: Config.offset,
    currentPage: currentPage,
    search: ""
}
let dataPage: any
const getEvents = async (): Promise<void> => {
    /*const eventsRaw = await getEntitiesData('Notification')
    const events = eventsRaw.filter((data: any) => `${data.customer?.id}` === `${customerId}`)
    const removeOtroFromList = events.filter((data: any) => data.notificationType.name !== "Otro")
    const removeFuegoFromList = removeOtroFromList.filter((data: any) => data.notificationType.name !== '🔥 Fuego')
    const removeCaidoFromList = removeFuegoFromList.filter((data: any) => data.notificationType.name !== '🚨 Hombre Caído')
    const removeIntrusionFromList = removeCaidoFromList.filter((data: any) => data.notificationType.name !== '🚪 Intrusión')
    const removeRoboFromList = removeIntrusionFromList.filter((data: any) => data.notificationType.name !== '🏚 Robo')
    const removePanicoFromList = removeRoboFromList.filter((data: any) => data.notificationType.name !== 'Botón Pánico')*/
    let raw = JSON.stringify({
        "filter": {
            "conditions": [
              {
                "property": "customer.id",
                "operator": "=",
                "value": `${customerId}`
              },
              {
                "property": "notificationType.name",
                "operator": "<>",
                "value": `Otro`
              },
              {
                "property": "notificationType.name",
                "operator": "<>",
                "value": `🔥 Fuego`
              },
              {
                "property": "notificationType.name",
                "operator": "<>",
                "value": `🚨 Hombre Caído`
              },
              {
                "property": "notificationType.name",
                "operator": "<>",
                "value": `🚪 Intrusión`
              },
              {
                "property": "notificationType.name",
                "operator": "<>",
                "value": `🏚 Robo`
              },
              {
                "property": "notificationType.name",
                "operator": "<>",
                "value": `Botón Pánico`
              },
              {
                "property": "user.userType",
                "operator": "=",
                "value": `CUSTOMER`
              }
            ],
            
        }, 
        sort: "-createdDate",
        limit: Config.tableRows,
        offset: infoPage.offset,
        fetchPlan: 'full',
        
    })
    if(infoPage.search != ""){
        raw = JSON.stringify({
            "filter": {
                "conditions": [
                  {
                    "group": "OR",
                    "conditions": [
                      {
                        "property": "title",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                        "property": "description",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                          "property": "user.username",
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
                    "property": "notificationType.name",
                    "operator": "<>",
                    "value": `Otro`
                  },
                  {
                    "property": "notificationType.name",
                    "operator": "<>",
                    "value": `🔥 Fuego`
                  },
                  {
                    "property": "notificationType.name",
                    "operator": "<>",
                    "value": `🚨 Hombre Caído`
                  },
                  {
                    "property": "notificationType.name",
                    "operator": "<>",
                    "value": `🚪 Intrusión`
                  },
                  {
                    "property": "notificationType.name",
                    "operator": "<>",
                    "value": `🏚 Robo`
                  },
                  {
                    "property": "notificationType.name",
                    "operator": "<>",
                    "value": `Botón Pánico`
                  },
                  {
                    "property": "user.userType",
                    "operator": "=",
                    "value": `CUSTOMER`
                  }
                ]
              },
            sort: "-createdDate",
            limit: Config.tableRows,
            offset: infoPage.offset,
            fetchPlan: 'full',
            
        })
    }
    infoPage.count = await getFilterEntityCount("Notification", raw)
    dataPage = await getFilterEntityData("Notification", raw)
    return dataPage
}

export class Binnacle {
    private dialogContainer: InterfaceElement = document.getElementById('app-dialogs')
    private siebarDialogContainer: InterfaceElement = document.getElementById('entity-editor-container')
    private appContainer: InterfaceElement = document.getElementById('datatable-container')

    public render = async (offset: any, actualPage: any, search: any): Promise<void> => {
        infoPage.offset = offset
        infoPage.currentPage = actualPage
        infoPage.search = search
        this.appContainer.innerHTML = ''
        this.appContainer.innerHTML = UIContentLayout

        // Getting interface elements
        const viewTitle: InterfaceElement = document.getElementById('view-title')
        const tableBody: InterfaceElement = document.getElementById('datatable-body')

        // Changing interface element content
        viewTitle.innerText = pageName
        tableBody.innerHTML = '.Cargando...'

        let eventsArray: any = await getEvents()
        tableBody.innerHTML = UITableSkeletonTemplate.repeat(tableRows)

        // Exec functions
        this.load(tableBody, currentPage, eventsArray)
        this.searchNotes(tableBody/*, eventsArray*/)
        new filterDataByHeaderType().filter()
        this.pagination(eventsArray, tableRows, infoPage.currentPage)
        this.export()

        // Rendering icons
    }

    public load = (tableBody: InterfaceElement, currentPage: number, events: any): void => {
        tableBody.innerHTML = '' // clean table

        // configuring max table row size
        currentPage--
        let start: number = tableRows * currentPage
        let end: number = start + tableRows
        let paginatedItems: any = events.slice(start, end)

        // Show message if page is empty
        if (events.length === 0) {
            let row: InterfaceElement = document.createElement('TR')
            row.innerHTML = `
            <td>No existen datos<td>
            <td></td>
            <td></td>
            `

            tableBody.appendChild(row)
        }
        else {
            for (let i = 0; i < paginatedItems.length; i++) {
                let event = paginatedItems[i] // getting note items
                let row: InterfaceElement = document.createElement('TR')
                row.innerHTML += `
                    <td>${calculateLine(event?.title ?? '', 40)}</td>
                    <td>${calculateLine(event?.description ?? '', 40)}</td>
                    <td>${event?.user?.username ?? ''}</td>
                    <td id="table-date">${event.creationDate}</td>
                    <td>
                        <button class="button" id="entity-details" data-entityId="${event.id}">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </td>
                `
                tableBody.appendChild(row)
                
                // TODO: Corret this fixer
                // fixDate()
            }
            this.previewEvent()
        }
    }

    private searchNotes = async (tableBody: InterfaceElement/*, events: any*/) => {
        const search: InterfaceElement = document.getElementById('search')
        const btnSearch: InterfaceElement = document.getElementById('btnSearch')
        search.value = infoPage.search
        await search.addEventListener('keyup', () => {
            /*const arrayEvents: any = events.filter((event: any) =>
                `${event.title}
                ${event.description}
                ${event.creationDate}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase())
            )

            let filteredEvents = arrayEvents.length
            let result = arrayEvents

            if (filteredEvents >= Config.tableRows) filteredEvents = Config.tableRows

            this.load(tableBody, currentPage, result)
            this.pagination(result, tableRows, currentPage)
            */
            // Rendering icons
        })
        btnSearch.addEventListener('click', async () => {
            new Binnacle().render(Config.offset , Config.currentPage, search.value.toLowerCase().trim())
        })
    }

    private previewEvent = async (): Promise<void> => {
        const openPreview: InterfaceElement = document.querySelectorAll('#entity-details')
        openPreview.forEach((preview: InterfaceElement) => {
            let currentEventId = preview.dataset.entityid
            preview.addEventListener('click', (): void => {
                previewBox(currentEventId)
            })
        })

        const previewBox = async (noteId: string): Promise<void> => {
            const event = await getEntityData('Notification', noteId)

            renderRightSidebar(UIRightSidebar)
            const sidebarContainer: InterfaceElement = document.getElementById('entity-editor-container')
            const closeSidebar: InterfaceElement = document.getElementById('close')
            closeSidebar.addEventListener('click', (): void => {
                new CloseDialog().x(sidebarContainer)
            })
            // Event details
            const _details: InterfaceElementCollection = {
                title: document.getElementById('event-title'),
                content: document.getElementById('event-content'),
                author: document.getElementById('event-author'),
                authorId: document.getElementById('event-author-id'),
                date: document.getElementById('creation-date'),
                time: document.getElementById('creation-time')
            }

            /*const eventCreationDateAndTime = event.creationDate.split('T')
            const eventCreationTime = eventCreationDateAndTime[1]
            const eventCreationDate = eventCreationDateAndTime[0]*/

            _details.title.innerText = event.title
            _details.content.innerText = event.description
            _details.author.value = `${event.user.firstName} ${event.user.lastName}`
            _details.authorId.value = event.createdBy
            _details.date.value = event.creationDate
            _details.time.value = event.creationTime

            this.closeRightSidebar()
        }
    }

    private export = (): void => {
        const exportNotes: InterfaceElement = document.getElementById('export-entities');
        exportNotes.addEventListener('click', async() => {
            this.dialogContainer.style.display = 'block';
            this.dialogContainer.innerHTML = `
                <div class="dialog_content" id="dialog-content">
                    <div class="dialog">
                        <div class="dialog_container padding_8">
                            <div class="dialog_header">
                                <h2>Seleccionar la fecha</h2>
                            </div>

                            <div class="dialog_message padding_8">
                                <div class="form_group">
                                    <div class="form_input">
                                        <label class="form_label" for="start-date">Desde:</label>
                                        <input type="date" class="input_date input_date-start" id="start-date" name="start-date">
                                    </div>
                    
                                    <div class="form_input">
                                        <label class="form_label" for="end-date">Hasta:</label>
                                        <input type="date" class="input_date input_date-end" id="end-date" name="end-date">
                                    </div>

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
            let fecha = new Date(); //Fecha actual
            let mes: any = fecha.getMonth()+1; //obteniendo mes
            let dia: any = fecha.getDate(); //obteniendo dia
            let anio: any = fecha.getFullYear(); //obteniendo año
            if(dia<10)
                dia='0'+dia; //agrega cero si el menor de 10
            if(mes<10)
                mes='0'+mes //agrega cero si el menor de 10

            // @ts-ignore
            document.getElementById("start-date").value = anio+"-"+mes+"-"+dia;
            // @ts-ignore
            document.getElementById("end-date").value = anio+"-"+mes+"-"+dia;
            inputObserver();
            const _closeButton: InterfaceElement = document.getElementById('cancel');
            const exportButton: InterfaceElement = document.getElementById('export-data');
            const _dialog: InterfaceElement = document.getElementById('dialog-content');
            exportButton.addEventListener('click', async() => {
                const _values: any = {
                    start: document.getElementById('start-date'),
                    end: document.getElementById('end-date'),
                    exportOption: document.getElementsByName('exportOption')
                }
                let rawExport = JSON.stringify({
                    "filter": {
                        "conditions": [
                          {
                            "property": "customer.id",
                            "operator": "=",
                            "value": `${customerId}`
                          },
                          {
                            "property": "notificationType.name",
                            "operator": "<>",
                            "value": `Otro`
                          },
                          {
                            "property": "notificationType.name",
                            "operator": "<>",
                            "value": `🔥 Fuego`
                          },
                          {
                            "property": "notificationType.name",
                            "operator": "<>",
                            "value": `🚨 Hombre Caído`
                          },
                          {
                            "property": "notificationType.name",
                            "operator": "<>",
                            "value": `🚪 Intrusión`
                          },
                          {
                            "property": "notificationType.name",
                            "operator": "<>",
                            "value": `🏚 Robo`
                          },
                          {
                            "property": "notificationType.name",
                            "operator": "<>",
                            "value": `Botón Pánico`
                          },
                          {
                            "property": "creationDate",
                            "operator": ">=",
                            "value": `${_values.start.value}`
                          },
                          {
                            "property": "creationDate",
                            "operator": "<=",
                            "value": `${_values.end.value}`
                          },
                          {
                            "property": "user.userType",
                            "operator": "=",
                            "value": `CUSTOMER`
                          }
                        ],
                        
                    }, 
                    sort: "-createdDate",
                    fetchPlan: 'full',
                    
                })
                const events: any = await getFilterEntityData("Notification", rawExport) //await getEvents();
                for (let i = 0; i < _values.exportOption.length; i++) {
                    let ele: any = _values.exportOption[i]
                    if (ele.type = "radio") {
    
                        if (ele.checked){
                            if(ele.value == "xls"){
                                // @ts-ignore
                               exportBinnacleXls(events, _values.start.value, _values.end.value)
                            }else if(ele.value == "csv"){
                                // @ts-ignore
                                exportBinnacleCsv(events, _values.start.value, _values.end.value)
                            }else if(ele.value == "pdf"){
                                // @ts-ignore
                                exportBinnaclePdf(events, _values.start.value, _values.end.value)
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
                new Binnacle().render(infoPage.offset, currentPage, infoPage.search) //new Binnacle().load(tableBody, page, items)
            })

            return button
        }

        function pagesOptions(items: any, currentPage: any) {
            paginationWrapper.innerHTML = ''
            let pages = pageNumbers(pageCount, Config.maxLimitPage, currentPage)
            
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
                new Binnacle().render(Config.offset, Config.currentPage, infoPage.search)
            })

            nextButton.addEventListener('click', (): void => {
                infoPage.offset = Config.tableRows * (pageCount - 1)
                new Binnacle().render(infoPage.offset, pageCount, infoPage.search)
            })
        }
    }

    private closeRightSidebar = (): void => {
        const closeButton: InterfaceElement = document.getElementById('close')

        const editor: InterfaceElement = document.getElementById('entity-editor-container')

        closeButton.addEventListener('click', (): void => {
            new CloseDialog().x(editor)
        })
    }
}
