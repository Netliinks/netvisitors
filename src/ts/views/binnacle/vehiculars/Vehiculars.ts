//
//  AssistControl.ts
//
//  Generated by Poll Castillo on 15/03/2023.
//
import { Config } from "../../../Configs.js";
import { getEntityData, getFilterEntityData, getFilterEntityCount, getFile } from "../../../endpoints.js";
import { CloseDialog, drawTagsIntoTables, renderRightSidebar, filterDataByHeaderType, inputObserver, pageNumbers, fillBtnPagination } from "../../../tools.js";
import { UIContentLayout, UIRightSidebar } from "./Layout.js";
import { UITableSkeletonTemplate } from "./Template.js";
import { exportVehicularCsv, exportVehicularPdf, exportVehicularXls } from "../../../exportFiles/vehiculars.js";
import { InterfaceElement, InterfaceElementCollection } from "../../../types.js";
// Local configs
const tableRows = Config.tableRows;
let currentPage = Config.currentPage;
const pageName = 'Ingreso Vehicular';
const customerId = localStorage.getItem('customer_id');
let infoPage = {
    count: 0,
    offset: Config.offset,
    currentPage: currentPage,
    search: ""
}
let dataPage: any
const GetVehiculars = async () => {
    //const vehicularRaw = await getEntitiesData('Vehicular');
    //const vehicular = vehicularRaw.filter((data: any) => data.customer?.id === `${customerId}`);
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
                        "property": "licensePlate",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                        "property": "dni",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                        "property": "driver",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                        "property": "visitState.name",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      }
                    ]
                  },
                  {
                    "property": "customer.id",
                    "operator": "=",
                    "value": `${customerId}`
                  }
                ]
              },
            sort: "-createdDate",
            limit: Config.tableRows,
            offset: infoPage.offset,
            fetchPlan: 'full',
            
        })
    }
    infoPage.count = await getFilterEntityCount("Vehicular", raw)
    dataPage = await getFilterEntityData("Vehicular", raw)
    return dataPage;
};
export class Vehiculars {
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

        let eventsArray: any = await GetVehiculars()
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
                let vehicular = paginatedItems[i]; // getting visit items
                let row = document.createElement('TR');
                row.innerHTML += `
                <td style="white-space: nowrap">${vehicular.licensePlate}</td>
                <td>${vehicular.dni}</td>
                <td>${vehicular.driver}</td>
                <td id="table-date">${vehicular.ingressDate} ${vehicular.ingressTime}</td>
                <td id="table-date">${vehicular?.egressDate ?? ''} ${vehicular?.egressTime ?? ''}</td>
                <td class="tag"><span>${vehicular.visitState.name}</span></td>

                <td>
                    <button class="button" id="entity-details" data-entityId="${vehicular.id}">
                        <i class="table_icon fa-regular fa-magnifying-glass"></i>
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

    private searchNotes = async (tableBody: InterfaceElement /*, visits: any*/) => {
        const search: InterfaceElement = document.getElementById('search')
        const btnSearch: InterfaceElement = document.getElementById('btnSearch')
        search.value = infoPage.search
        await search.addEventListener('keyup', () => {
            /*const arrayVisits = visits.filter((vehicular: any) => `${vehicular.licensePlate}${vehicular.dni}${vehicular.driver}${vehicular.ingressDate}${vehicular.ingressTime}${vehicular.egressDate}${vehicular.egressTime}${vehicular.visitState.name}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase()));
            

            let filteredEvents = arrayVisits.length
            let result = arrayVisits

            if (filteredEvents >= Config.tableRows) filteredEvents = Config.tableRows

            this.load(tableBody, currentPage, result)
            this.pagination(result, tableRows, currentPage)

            // Rendering icons*/
        })
        btnSearch.addEventListener('click', async () => {
            new Vehiculars().render(Config.offset , Config.currentPage, search.value.toLowerCase().trim())
        })
    }

    private previewZoom = async (arrayImages: any) => {
            const openButtons = document.querySelectorAll('#entity-details-zoom');
            openButtons.forEach((openButton: any) => {
                const entityId = openButton.dataset.entityid;
                openButton.addEventListener('click', () => {
                    renderInterfaceZoom(entityId, arrayImages);
                });
            });
            const renderInterfaceZoom = async (entity:any, arrayImages:any) => {
                let description = '';
                for (let i = 0; i < arrayImages.length; i++) {
                    if (arrayImages[i].id == entity) {
                        description = arrayImages[i].description;
                    }
                }
                const picture:any = document.getElementsByName(`${entity}`);
                const close:any = document.getElementById("close-modalZoom");
                const modalZoom:any = document.getElementById('modalZoom');
                const editor:any = document.getElementById('entity-editor-container');
                editor.style.display = 'none';
                const img01:any = document.getElementById('img01');
                const caption:any = document.getElementById('caption');
                modalZoom.style.display = 'block';
                img01.src = picture[0].currentSrc;
                caption.innerHTML = `${description}`;
                close.addEventListener('click', () => {
                    modalZoom.style.display = 'none';
                    const editor:any = document.getElementById('entity-editor-container');
                    editor.style.display = 'flex';
                });
            };
        };

    private previewEvent = async (): Promise<void> => {
        const openPreview: InterfaceElement = document.querySelectorAll('#entity-details')
        openPreview.forEach((preview: InterfaceElement) => {
            let currentEventId = preview.dataset.entityid
            preview.addEventListener('click', (): void => {
                previewBox(currentEventId)
            })
        })

        const previewBox = async (entity: string): Promise<void> => {
            let markingData = await getEntityData('Vehicular', entity);
            renderRightSidebar(UIRightSidebar)
            const sidebarContainer: InterfaceElement = document.getElementById('entity-editor-container')
            const closeSidebar: InterfaceElement = document.getElementById('close')
            closeSidebar.addEventListener('click', (): void => {
                new CloseDialog().x(sidebarContainer)
            })
            // Event details
            const controlImages: InterfaceElement = document.getElementById('galeria');
            const _values: InterfaceElementCollection = {
                status: document.getElementById('marking-status'),
                name: document.getElementById('marking-name'),
                dni: document.getElementById('marking-dni'),
                license: document.getElementById('marking-license'),
                department: document.getElementById('marking-department'),
                contractor: document.getElementById('marking-contractor'),
                product: document.getElementById('marking-product'),
                type: document.getElementById('marking-type'),
                observation: document.getElementById('marking-observation'),
                dayManager: document.getElementById('marking-dayManager'),
                nightManager: document.getElementById('marking-nightManager'),
                // Start marking
                startDate: document.getElementById('marking-start-date'),
                startTime: document.getElementById('marking-start-time'),
                startGuardID: document.getElementById('marking-start-guard-id'),
                startGuardName: document.getElementById('marking-start-guard-name'),
                // End marking
                endDate: document.getElementById('marking-end-date'),
                endTime: document.getElementById('marking-end-time'),
                endGuardID: document.getElementById('marking-end-guard-id'),
                endGuardName: document.getElementById('marking-end-guard-name')
            }

            _values.status.innerText = markingData.visitState.name;
            _values.name.value = markingData?.driver ?? '';
            _values.dni.value = markingData?.dni ?? '';
            _values.license.value = markingData?.licensePlate ?? '';
            _values.department.value = markingData?.noGuide ?? '';
            _values.contractor.value = markingData?.supplier ?? '';
            _values.product.value = markingData?.product ?? '';
            _values.type.value = markingData?.type ?? '';
            _values.observation.value = markingData?.observation ?? '';
            _values.dayManager.value = markingData?.dayManager ?? '';
            _values.nightManager.value = markingData?.nightManager ?? '';
            // Start marking
            _values.startDate.value = markingData?.ingressDate ?? '';
            _values.startTime.value = markingData?.ingressTime ?? '';
            _values.startGuardID.value = markingData.ingressIssued?.username ?? '';
            // @ts-ignore
            _values.startGuardName.value = markingData.ingressIssued?.firstName ?? '' + ' ' + markingData.ingressIssued?.lastName ?? '';
            // End marking
            _values.endDate.value = markingData?.egressDate ?? '';
            _values.endTime.value = markingData?.egressTime ?? '';
            _values.endGuardID.value = markingData.egressIssued?.username ?? '';
            // @ts-ignore
            _values.endGuardName.value = markingData.egressIssued?.firstName ?? '' + ' ' + markingData.egressIssued?.lastName ?? '';
            if (markingData?.image !== undefined || markingData?.image2 !== undefined || markingData?.image3 !== undefined) {
                let images = [];
                if (markingData?.image !== undefined) {
                    let details = {
                        "image": `${await getFile(markingData.image)}`,
                        "description": `Adjunto - ${markingData?.licensePlate ?? ''}`,
                        "icon": "mobile",
                        "id": "image"
                    };
                    images.push(details);
                }
                if (markingData?.image2 !== undefined) {
                    let details = {
                        "image": `${await getFile(markingData.image2)}`,
                        "description": `Adjunto 2 - ${markingData?.licensePlate ?? ''}`,
                        "icon": "mobile",
                        "id": "image2"
                    };
                    images.push(details);
                }
                if (markingData?.image3 !== undefined) {
                    let details = {
                        "image": `${await getFile(markingData.image3)}`,
                        "description": `Adjunto 3 - ${markingData?.licensePlate ?? ''}`,
                        "icon": "mobile",
                        "id": "image3"
                    };
                    images.push(details);
                }
                for (let i = 0; i < images.length; i++) {
                    controlImages.innerHTML += `
                        <label><i class="fa-solid fa-${images[i].icon}"></i> ${images[i].description}</label>
                        <img width="100%" class="note_picture margin_b_8" src="${images[i].image}" id="entity-details-zoom" data-entityId="${images[i].id}" name="${images[i].id}">
                    `;
                }
                this.previewZoom(images);
            }
            else {
                controlImages.innerHTML += `
                    <div class="input_detail">
                        <label><i class="fa-solid fa-info-circle"></i> No hay imágenes</label>
                    </div>
                `;
            }
            this.closeRightSidebar()
        }
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
                const buttons = document.getElementsByName("pagination-button");
                buttons.forEach(button => {
                    button.style.background = "#ffffff"; 
                })
                infoPage.offset = Config.tableRows * (page - 1)
                currentPage = page
                fillBtnPagination(page, Config.colorPagination)
                new Vehiculars().render(infoPage.offset, currentPage, infoPage.search)
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
                new Vehiculars().render(Config.offset, Config.currentPage, infoPage.search)
            })

            nextButton.addEventListener('click', (): void => {
                infoPage.offset = Config.tableRows * (pageCount - 1)
                new Vehiculars().render(infoPage.offset, pageCount, infoPage.search)
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

    private export = (): void => {
        const exportNotes: InterfaceElement = document.getElementById('export-entities');
        exportNotes.addEventListener('click', async() => {
            this.siebarDialogContainer.innerHTML = '';
            this.siebarDialogContainer.style.display = 'flex';
            this.siebarDialogContainer.innerHTML = `
                <div class="entity_editor" id="entity-editor">
                <div class="entity_editor_header">
                    <div class="user_info">
                    <div class="avatar"><i class="fa-regular fa-file-export"></i></div>
                    <h1 class="entity_editor_title">Exportar<br><small>Datos</small></h1>
                    </div>

                    <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
                </div>

                <!-- EDITOR BODY -->
                <div class="entity_editor_body">
                    <div class="form_group">
                        <div class="form_input">
                            <label class="form_label" for="start-date">Desde:</label>
                            <input type="date" class="input_date input_date-start" id="start-date" name="start-date">
                        </div>
        
                        <div class="form_input">
                            <label class="form_label" for="end-date">Hasta:</label>
                            <input type="date" class="input_date input_date-end" id="end-date" name="end-date">
                        </div>

                    </div>

                    <div class="input_checkbox">
                        <label for="exportCsv">
                            <input type="radio" class="checkbox" id="exportCsv" name="exportOption" value="csv" /> CSV
                        </label>
                    </div>

                    <div class="input_checkbox">
                        <label for="exportXls">
                            <input type="radio" class="checkbox" id="exportXls" name="exportOption" value="xls" checked /> XLS
                        </label>
                    </div>

                    <div class="input_checkbox">
                        <label for="exportPdf">
                            <input type="radio" class="checkbox" id="exportPdf" name="exportOption" value="pdf" /> PDF
                        </label>
                    </div>

                </div>
                <!-- END EDITOR BODY -->

                <div class="entity_editor_footer">
                    <button class="btn btn_primary btn_widder" id="export-data">Listo</button>
                </div>
                </div>
            `;
            inputObserver();
            let fecha: any = new Date(); //Fecha actual
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
            const _closeButton: InterfaceElement = document.getElementById('close');
            const exportButton: InterfaceElement = document.getElementById('export-data');
            let onPressed = false;
            exportButton.addEventListener('click', async() => {
                if(!onPressed){
                    onPressed = true;
                    this.dialogContainer.style.display = 'block';
                    this.dialogContainer.innerHTML = `
                    <div class="dialog_content" id="dialog-content">
                        <div class="dialog">
                            <div class="dialog_container padding_8">
                                <div class="dialog_header">
                                    <h2>Exportando...</h2>
                                </div>

                                <div class="dialog_message padding_8">
                                    <div class="material_input">
                                        <input type="text" id="export-total" class="input_filled" value="..." readonly>
                                        <label for="export-total"><i class="fa-solid fa-cloud-arrow-down"></i>Obteniendo datos</label>
                                    </div>

                                    <div class="input_detail">
                                        <label for="message-export"><i class="fa-solid fa-file-export"></i></label>
                                        <p id="message-export" class="input_filled" readonly></p>
                                    </div>
                                </div>

                                <div class="dialog_footer">
                                    <button class="btn btn_primary" id="cancel">Cancelar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                    inputObserver();
                    const message1: InterfaceElement = document.getElementById("export-total");
                    const message2: InterfaceElement = document.getElementById("message-export");
                    const _closeButton: InterfaceElement = document.getElementById('cancel');
                    _closeButton.onclick = () => {
                        onPressed = false;
                        const _dialog = document.getElementById('dialog-content');
                        new CloseDialog().x(_dialog);
                    };
                    const _values: InterfaceElement = {
                        start: document.getElementById('start-date'),
                        end: document.getElementById('end-date'),
                        exportOption: document.getElementsByName('exportOption')
                    }
                    let rawToExport=(offset: any)=>{
                        let rawExport = JSON.stringify({
                            "filter": {
                                "conditions": [
                                    {
                                        "property": "customer.id",
                                        "operator": "=",
                                        "value": `${customerId}`
                                    },
                                    {
                                        "property": "ingressDate",
                                        "operator": ">=",
                                        "value": `${_values.start.value}`
                                    },
                                    {
                                        "property": "ingressDate",
                                        "operator": "<=",
                                        "value": `${_values.end.value}`
                                    }
                                ],
                            },
                            sort: "-createdDate",
                            limit: Config.limitExport,
                            offset: offset,
                            fetchPlan: 'full',
                        });
                        return rawExport;
                    }
                    let rawExport = rawToExport(0);
                    const totalRegisters = await getFilterEntityCount("Vehicular", rawExport);
                    if(totalRegisters === undefined){
                        onPressed = false;
                        const _dialog = document.getElementById('dialog-content');
                        new CloseDialog().x(_dialog);
                        alert("Ocurrió un error al exportar");
                    }else if(totalRegisters===0){
                        onPressed = false;
                        const _dialog = document.getElementById('dialog-content');
                        new CloseDialog().x(_dialog);
                        alert("No hay ningún registro");  
                    }else {
                        message1.value = `0 / ${totalRegisters}`;
                        const pages = Math.ceil(totalRegisters / Config.limitExport);
                        let array = [];
                        let vehiculars = [];
                        let offset = 0;
                        for(let i = 0; i < pages; i++){
                            if(onPressed){
                                rawExport = rawToExport(offset);
                                array[i] = await getFilterEntityData("Vehicular", rawExport); //await getEvents();
                                for(let y=0; y<array[i].length; y++){
                                    vehiculars.push(array[i][y]);
                                }
                                message1.value = `${vehiculars.length} / ${totalRegisters}`;
                                offset = Config.limitExport + (offset);
                            }
                        }
                    
                        for (let i = 0; i < _values.exportOption.length; i++) {
                            let ele = _values.exportOption[i];
                            if (ele.type = "radio") {
                                if (ele.checked) {
                                    message2.innerText = `Generando archivo ${ele.value},\nesto puede tomar un momento.`;
                                    if (ele.value == "xls") {
                                        // @ts-ignore
                                        await exportVehicularXls(vehiculars, _values.start.value, _values.end.value);
                                    }
                                    else if (ele.value == "csv") {
                                        // @ts-ignore
                                        await exportVehicularCsv(vehiculars, _values.start.value, _values.end.value);
                                    }
                                    else if (ele.value == "pdf") {
                                        // @ts-ignore
                                        await exportVehicularPdf(vehiculars, _values.start.value, _values.end.value);
                                    }
                                    const _dialog = document.getElementById('dialog-content');
                                    new CloseDialog().x(_dialog);
                                }
                            }
                        }
                        onPressed = false;
                    }
                }
                
                
            });
            _closeButton.onclick = () => {
                onPressed = false;
                const editor = document.getElementById('entity-editor-container');
                new CloseDialog().x(editor);
            };
        });
    };
}
