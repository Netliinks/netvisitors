//
//  VisitsView.ts
//
//  Generated by Poll Castillo on 09/03/2023.
//
import { Config } from "../../../Configs.js"
import { getEntityData, getFile, getFilterEntityData, getFilterEntityCount } from "../../../endpoints.js"
import { CloseDialog, drawTagsIntoTables, renderRightSidebar, filterDataByHeaderType, inputObserver, verifyUserType, pageNumbers, fillBtnPagination  } from "../../../tools.js"
import { InterfaceElement, InterfaceElementCollection } from "../../../types.js"
import { UIContentLayout, UIRightSidebar } from "./Layout.js"
import { UITableSkeletonTemplate } from "./Template.js"
import { exportVisitCsv, exportVisitPdf, exportVisitXls } from "../../../exportFiles/visits.js"

// Local configs
const tableRows = Config.tableRows
let currentPage = Config.currentPage
const pageName = 'Visitas'
const customerId = localStorage.getItem('customer_id');
let infoPage = {
    count: 0,
    offset: Config.offset,
    currentPage: currentPage,
    search: ""
}
let dataPage: any
const GetVisits = async (): Promise<void> => {
    //const visitsRaw = await getEntitiesData('Visit')
    //const visits = visitsRaw.filter((data: any) => `${data.customer?.id}` === `${customerId}`);
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
                        "property": "dni",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                        "property": "firstName",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                        "property": "firstLastName",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                        "property": "secondLastName",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                        "property": "visitState.name",
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
                  }
                ]
              },
            sort: "-createdDate",
            limit: Config.tableRows,
            offset: infoPage.offset,
            fetchPlan: 'full',
            
        })
    }
    infoPage.count = await getFilterEntityCount("Visit", raw)
    dataPage = await getFilterEntityData("Visit", raw)
    return dataPage
}

export class Visits {
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

        let visitsArray: any = await GetVisits()
        tableBody.innerHTML = UITableSkeletonTemplate.repeat(tableRows)

        // Exec functions
        this.load(tableBody, currentPage, visitsArray)
        this.searchVisit(tableBody/*, visitsArray*/)
        new filterDataByHeaderType().filter()
        this.pagination(visitsArray, tableRows, infoPage.currentPage)
        this.export()

        // Rendering icons
    }

    public load = (tableBody: InterfaceElement, currentPage: number, visits: any): void => {
        tableBody.innerHTML = '' // clean table

        // configuring max table row size
        currentPage--
        let start: number = tableRows * currentPage
        let end: number = start + tableRows
        let paginatedItems: any = visits.slice(start, end)

        // Show message if page is empty
        if (visits.length === 0) {
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
                let visit = paginatedItems[i] // getting visit items
                let row: InterfaceElement = document.createElement('TR')
                row.innerHTML += `
                    <td style="white-space: nowrap">${visit.firstName} ${visit.firstLastName} ${visit.secondLastName}</td>
                    <td>${visit.dni}</td>
                    <td>${visit?.user?.username ?? ''}</td>
                    <td id="table-date">${visit.creationDate}</td>
                    <td id="table-time" style="white-space: nowrap">${visit.creationTime}</td>
                    <td>${verifyUserType(visit.user.userType)}</td>
                    <td class="tag"><span>${visit.visitState.name}</span></td>

                    <td>
                        <button class="button" id="entity-details" data-entityId="${visit.id}">
                            <i class="table_icon fa-regular fa-magnifying-glass"></i>
                        </button>
                    </td>
                `
                tableBody.appendChild(row)
                drawTagsIntoTables()
            }
            this.previewVisit()
            //this.fixCreatedDate()
        }
    }

    private searchVisit = async (tableBody: InterfaceElement /*, visits: any*/) => {
        const search: InterfaceElement = document.getElementById('search')
        const btnSearch: InterfaceElement = document.getElementById('btnSearch')
        search.value = infoPage.search
        await search.addEventListener('keyup', () => {
            /*const arrayVisits: any = visits.filter((visit: any) =>
                `${visit.dni}${visit.firstName}${visit.firstLastName}${visit.secondLastName}${visit.creationDate}${visit.visitState.name}${visit.user.userType}${visit.creationTime}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase())
            )

            let filteredVisit = arrayVisits.length
            let result = arrayVisits

            if (filteredVisit >= Config.tableRows) filteredVisit = Config.tableRows

            this.load(tableBody, currentPage, result)*/
        })
        btnSearch.addEventListener('click', async () => {
            new Visits().render(Config.offset , Config.currentPage, search.value.toLowerCase().trim())
        })
    }

    private previewVisit = async (): Promise<void> => {
        const openButtons: InterfaceElement = document.querySelectorAll('#entity-details')
        openButtons.forEach((openButton: InterfaceElement) => {
            const entityId: string = openButton.dataset.entityid
            openButton.addEventListener('click', (): void => {
                renderInterface(entityId)
            })
        })

        const renderInterface = async (entity: string): Promise<void> => {
            let entityData = await getEntityData('Visit', entity)
            //console.log(entityData)
            renderRightSidebar(UIRightSidebar)
            const controlImages: InterfaceElement = document.getElementById('galeria')
            const visitName: InterfaceElement = document.getElementById('visit-name')
            visitName.value = `${entityData.firstName} ${entityData.firstLastName}`

            const visitReason: InterfaceElement = document.getElementById('visit-reason')
            visitReason.value = entityData?.reason

            const visitAutorizedBy: InterfaceElement = document.getElementById('visit-authorizedby')
            visitAutorizedBy.value = entityData?.authorizer

            const visitStatus: InterfaceElement = document.getElementById('visit-status')
            visitStatus.innerText = entityData.visitState.name

            const visitCitadel: InterfaceElement = document.getElementById('visit-citadel')
            visitCitadel.value = entityData.citadel?.description

            const visitCitadelID: InterfaceElement = document.getElementById('visit-citadelid')
            visitCitadelID.value = entityData.citadel?.name

            const visitDepartment: InterfaceElement = document.getElementById('visit-department')
            visitDepartment.value = entityData.department?.name

            // Start marking
            const ingressDate: InterfaceElement = document.getElementById('ingress-date')
            ingressDate.value = entityData?.ingressDate ?? ''
            const ingressTime: InterfaceElement = document.getElementById('ingress-time')
            ingressTime.value = entityData?.ingressTime ?? ''
            const ingressGuardId: InterfaceElement = document.getElementById('ingress-guard-id')
            ingressGuardId.value = entityData?.ingressIssuedId?.username ?? ''
            const ingressGuardName: InterfaceElement = document.getElementById('ingress-guard-name')
            ingressGuardName.value = `${entityData?.ingressIssuedId?.firstName ?? ''} ${entityData?.ingressIssuedId?.lastName ?? ''}`
            // End marking
            const egressDate: InterfaceElement = document.getElementById('egress-date')
            egressDate.value = entityData?.egressDate ?? ''
            const egressTime: InterfaceElement = document.getElementById('egress-time')
            egressTime.value = entityData?.egressTime ?? ''
            const egressGuardId: InterfaceElement = document.getElementById('egress-guard-id')
            egressGuardId.value = entityData?.egressIssuedId?.username ?? ''
            const egressGuardName: InterfaceElement = document.getElementById('egress-guard-name')
            egressGuardName.value = `${entityData?.egressIssuedId?.firstName ?? ''} ${entityData?.egressIssuedId?.lastName ?? ''}`
            //console.log(entityData.citadel.name)
            if (entityData?.image !== undefined || entityData?.image3 !== undefined || entityData?.camera1 !== undefined || entityData?.camera2 !== undefined || entityData?.camera3 !== undefined|| entityData?.camera4 !== undefined) {
                let images = []
                if(entityData?.image !== undefined){
                    let details = {
                        "image": `${await getFile(entityData.image)}`,
                        "description": `Adjunto - ${entityData?.dni ?? ''}`,
                        "icon": "mobile",
                        "id": "image"
                    }
                    images.push(details)
                }
                if (entityData?.image3 !== undefined) {
                    let details = {
                        "image": `${await getFile(entityData.image3)}`,
                        "description": `Adjunto 2 - ${entityData?.dni ?? ''}`,
                        "icon": "mobile",
                        "id": "image3"
                    }
                    images.push(details)
                }
                if(entityData?.camera1 !== undefined){
                    let details = {
                        "image": `${await getFile(entityData.camera1)}`,
                        "description": `Cámara 1 - ${entityData?.dni ?? ''}`,
                        "icon": "camera",
                        "id": "camera1"
                    }
                    images.push(details)
                }
                if(entityData?.camera2 !== undefined){
                    let details = {
                        "image": `${await getFile(entityData.camera2)}`,
                        "description": `Cámara 2 - ${entityData?.dni ?? ''}`,
                        "icon": "camera",
                        "id": "camera2"
                    }
                    images.push(details)
                }
                if(entityData?.camera3 !== undefined){
                    let details = {
                        "image": `${await getFile(entityData.camera3)}`,
                        "description": `Cámara 3 - ${entityData?.dni ?? ''}`,
                        "icon": "camera",
                        "id": "camera3"
                    }
                    images.push(details)
                }
                if(entityData?.camera4 !== undefined){
                    let details = {
                        "image": `${await getFile(entityData.camera4)}`,
                        "description": `Cámara 4 - ${entityData?.dni ?? ''}`,
                        "icon": "camera",
                        "id": "camera4"
                    }
                    images.push(details)
                }
                if (entityData?.camera5 !== undefined) {
                    let details = {
                        "image": `${await getFile(entityData.camera5)}`,
                        "description": `Cámara 5 - ${entityData?.dni ?? ''}`,
                        "icon": "camera",
                        "id": "camera5"
                    };
                    images.push(details);
                }
                if (entityData?.camera6 !== undefined) {
                    let details = {
                        "image": `${await getFile(entityData.camera6)}`,
                        "description": `Cámara 6 - ${entityData?.dni ?? ''}`,
                        "icon": "camera",
                        "id": "camera6"
                    };
                    images.push(details);
                }
                if (entityData?.camera7 !== undefined) {
                    let details = {
                        "image": `${await getFile(entityData.camera7)}`,
                        "description": `Cámara 7 - ${entityData?.dni ?? ''}`,
                        "icon": "camera",
                        "id": "camera7"
                    };
                    images.push(details);
                }
                if (entityData?.camera8 !== undefined) {
                    let details = {
                        "image": `${await getFile(entityData.camera8)}`,
                        "description": `Cámara 8 - ${entityData?.dni ?? ''}`,
                        "icon": "camera",
                        "id": "camera8"
                    };
                    images.push(details);
                }
                for(let i=0; i<images.length; i++){
                    controlImages.innerHTML += `
                        <label><i class="fa-solid fa-${images[i].icon}"></i> ${images[i].description}</label>
                        <img width="100%" class="note_picture margin_b_8" src="${images[i].image}" id="entity-details-zoom" data-entityId="${images[i].id}" name="${images[i].id}">
                    `
                }
                this.previewZoom(images)
            }else{
                controlImages.innerHTML += `
                <div class="input_detail">
                    <label><i class="fa-solid fa-info-circle"></i> No hay imágenes</label>
                </div>
                `
            }

            this.closeRightSidebar()
            //drawTagsIntoTables()
        }

    }

    private closeRightSidebar = (): void => {
        const closeButton: InterfaceElement = document.getElementById('close')

        const editor: InterfaceElement = document.getElementById('entity-editor-container')

        closeButton.addEventListener('click', (): void => {
            new CloseDialog().x(editor)
        })
    }

    /*private fixCreatedDate = (): void => {
        const tableDate: InterfaceElementCollection = document.querySelectorAll('#table-date')

        tableDate.forEach((date: InterfaceElement) => {
            const separateDateAndTime = date.innerText.split('T')
            date.innerText = separateDateAndTime[0]
        })
    }*/

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
                new Visits().render(infoPage.offset, currentPage, infoPage.search)
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
                new Visits().render(Config.offset, Config.currentPage, infoPage.search)
            })

            nextButton.addEventListener('click', (): void => {
                infoPage.offset = Config.tableRows * (pageCount - 1)
                new Visits().render(infoPage.offset, pageCount, infoPage.search)
            })
        }
    }

    private previewZoom = async (arrayImages: any): Promise<void> => {
        const openButtons: InterfaceElement = document.querySelectorAll('#entity-details-zoom')
        openButtons.forEach((openButton: InterfaceElement) => {
            const entityId: string = openButton.dataset.entityid
            openButton.addEventListener('click', (): void => {

                renderInterfaceZoom(entityId, arrayImages)
            })
        })

        const renderInterfaceZoom = async (entity: string, arrayImages: any): Promise<void> => {
            let description = ''
            for(let i = 0; i < arrayImages.length; i++){
                if(arrayImages[i].id == entity){
                    description = arrayImages[i].description
                }
            }
            
            const picture: InterfaceElement = document.getElementsByName(`${entity}`)
            const close: InterfaceElement = document.getElementById("close-modalZoom");
            const modalZoom: InterfaceElement = document.getElementById('modalZoom')
            const editor: InterfaceElement = document.getElementById('entity-editor-container')
            editor.style.display = 'none'
            const img01: InterfaceElement = document.getElementById('img01')
            const caption: InterfaceElement = document.getElementById('caption')
            modalZoom.style.display = 'block'
            img01.src = picture[0].currentSrc
            caption.innerHTML = `${description}`

            close.addEventListener('click', (): void => {
                modalZoom.style.display = 'none'
                const editor: InterfaceElement = document.getElementById('entity-editor-container')
                editor.style.display = 'flex'
            })
        }
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
                                        "property": "creationDate",
                                        "operator": ">=",
                                        "value": `${_values.start.value}`
                                    },
                                    {
                                        "property": "creationDate",
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
                    const totalRegisters = await getFilterEntityCount("Visit", rawExport);
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
                        let visits = [];
                        let offset = 0;
                        for(let i = 0; i < pages; i++){
                            if(onPressed){
                                rawExport = rawToExport(offset);
                                array[i] = await getFilterEntityData("Visit", rawExport); //await getEvents();
                                for(let y=0; y<array[i].length; y++){
                                    visits.push(array[i][y]);
                                }
                                message1.value = `${visits.length} / ${totalRegisters}`;
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
                                        await exportVisitXls(visits, _values.start.value, _values.end.value);
                                    }
                                    else if (ele.value == "csv") {
                                        // @ts-ignore
                                        await exportVisitCsv(visits, _values.start.value, _values.end.value);
                                    }
                                    else if (ele.value == "pdf") {
                                        // @ts-ignore
                                        await exportVisitPdf(visits, _values.start.value, _values.end.value);
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