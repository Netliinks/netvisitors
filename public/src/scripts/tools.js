import { getEntitiesData, getUserInfo, getFilterEntityData, getEntityData, registerEntity, _userAgent } from "./endpoints.js";
//
export const inputObserver = () => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach((input) => {
        input.addEventListener("keyup", (e) => {
            if (input.value == "" || input.value == " ")
                input.classList.remove('input_filled'),
                    input.value = "";
            else
                input.classList.add('input_filled');
        });
    });
};
export const inputSelect = async (entity, selectId, currentStatus) => {
    const data = await getEntitiesData(entity);
    const state = await currentStatus;
    const select = document.querySelector(`#${selectId}`);
    const inputParent = select.parentNode;
    const optionsContent = inputParent.querySelector('#input-options');
    const optionsContainer = document.createElement('div');
    optionsContainer.classList.add('input_options_container');
    optionsContent.appendChild(optionsContainer);
    for (let i = 0; i < data.length; i++) {
        const inputOption = document.createElement('div');
        select.setAttribute('data-optionid', data[0].id);
        select.setAttribute('value', data[0].name);
        inputOption.classList.add('input_option');
        inputOption.setAttribute('id', data[i].id);
        let nameData = data[i].name;
        if (nameData === 'Enabled') {
            nameData = 'Activo';
        }
        else if (nameData === 'Disabled') {
            nameData = 'Inactivo';
        }
        inputOption.innerHTML = nameData;
        optionsContainer.appendChild(inputOption);
    }
    const options = optionsContainer.querySelectorAll('.input_option');
    if (state === "Enabled") {
        select.value = "Activo";
        select.setAttribute('data-optionid', '60885987-1b61-4247-94c7-dff348347f93');
    }
    else if (state === 'Disabled') {
        select.value = "Inactivo";
        select.setAttribute('data-optionid', '225b5e5d-9bb1-469a-b2d9-ca85d53db47b');
    }
    else {
        select.value = data[0].name;
    }
    select.addEventListener('click', () => {
        inputParent.classList.toggle('select_active');
    });
    options.forEach((option) => {
        option.addEventListener('click', () => {
            select.value = option.innerText;
            select.removeAttribute('data-optionid');
            select.setAttribute('data-optionid', option.getAttribute('id'));
            inputParent.classList.remove('select_active');
        });
    });
};
export class FixStatusElement {
    fix(element) {
        const elementTextValue = element.innerText;
        if (elementTextValue === "Enabled")
            elementTextValue.innerText = 'Activo',
                elementTextValue.toUpperCase();
        else
            elementTextValue.toUpperCase();
    }
}
export class FixStatusInputElement {
    fix(inputId) {
        const inputs = document.querySelectorAll(`#${inputId}`);
        inputs.forEach((input) => {
            if (input.value === 'Enabled')
                input.value = 'Activo'.toUpperCase();
            else if (input.value == 'Disabled')
                input.value = 'Inactivo'.toUpperCase();
        });
    }
}
export const drawTagsIntoTables = () => {
    const tags = document.querySelectorAll('.tag span');
    tags.forEach((tag) => {
        let text = tag.innerText;
        if (text === "Enabled" ||
            text === "enabled" ||
            text === "ENABLED" ||
            text === "Activo" ||
            text === "ACTIVO") {
            tag.innerText = "Activo";
            tag.classList.add("tag_green");
        }
        else if (text === "Disabled" ||
            text === "disabled" ||
            text === "DISABLED" ||
            text === "Inactivo" ||
            text === "INACTIVO") {
            tag.innerText = "Inactivo";
            tag.classList.add("tag_gray");
        }
        else if (text === "Pendiente" ||
            text === "pendiente" ||
            text === "PENDIENTE") {
            tag.classList.add("tag_yellow");
        }
        else if (text === "No cumplido" ||
            text === "no cumplido" ||
            text === "NO CUMPLIDO") {
            tag.classList.add("tag_red");
        }
        else {
            tag.classList.add('tag_gray');
        }
    });
};
export class CloseDialog {
    x(container) {
        container.style.display = 'none';
        // const dialog: InterfaceElement = container.firstElementChild
        // dialog.remove()
    }
}
// SIDEBAR RENDERING TOOLS
export const renderRightSidebar = (UIFragment) => {
    const dialogContainer = document.getElementById('entity-editor-container');
    dialogContainer.innerHTML = '';
    dialogContainer.style.display = 'flex';
    dialogContainer.innerHTML = UIFragment;
};
export const fixDate = () => {
    const arrayDates = document.querySelectorAll('#table-date');
    arrayDates.forEach((date) => {
        const dateP1 = date.innerText.split('-');
        const dateP2 = dateP1[2].split('T');
        const dateP3 = dateP2[1].split(':');
        const YearDate = dateP1[0];
        const MonthDate = dateP1[1];
        const DayDate = dateP2[0];
        const Hours = dateP3[0];
        const Minutes = dateP3[1];
        const Seconds = dateP3[2];
        const DT = YearDate + ' ' + MonthDate + ' ' + DayDate;
        const Time = Hours + ':' + Minutes + ':' + Seconds.slice(0, 2);
        date.innerText = DT + ' ' + Time;
    });
};
export class filterDataByHeaderType {
    constructor() {
        this.datatable = document.getElementById('datatable');
        this.filter = () => {
            this.datatable.onclick = (e) => {
                if (e.target.tagName != "SPAN")
                    return;
                let span = e.target;
                let th = e.target.parentNode;
                const THead = this.datatable.querySelectorAll('tr th span');
                THead.forEach((header) => {
                    header.classList.remove('datatable_header_selected');
                });
                e.target.classList.add('datatable_header_selected');
                this.sortGrid(th.cellIndex, span.dataset.type, span);
            };
        };
        this.sortGrid = (colNum, type, span) => {
            let tbody = this.datatable.querySelector('tbody');
            let rowsArray = Array.from(tbody.rows);
            let compare;
            if (span.dataset.mode == "desc") {
                compare = (rowA, rowB) => {
                    return rowA.cells[colNum].innerHTML >
                        rowB.cells[colNum].innerHTML ? -1 : 1;
                };
                span.setAttribute("data-mode", "asc");
            }
            else {
                compare = (rowA, rowB) => {
                    return rowA.cells[colNum].innerHTML >
                        rowB.cells[colNum].innerHTML ? 1 : -1;
                };
                span.setAttribute("data-mode", "desc");
            }
            /*switch (type) {
                case 'name':
                    compare = (rowA: any, rowB: any) => {
                        return rowA.cells[colNum].innerHTML >
                            rowB.cells[colNum].innerHTML ? 1 : -1
                    }
                    break
                case 'id':
                    compare = (rowA: any, rowB: any) => {
                        return rowA.cells[colNum].innerHTML >
                            rowB.cells[colNum].innerHTML ? 1 : -1
                    }
                    break
                case 'status':
                    compare = (rowA: any, rowB: any) => {
                        return rowA.cells[colNum].innerHTML >
                            rowB.cells[colNum].innerHTML ? 1 : -1
                    }
                    break
                case 'citadel':
                    compare = (rowA: any, rowB: any) => {
                        return rowA.cells[colNum].innerHTML >
                            rowB.cells[colNum].innerHTML ? 1 : -1
                    }
                    break
            }*/
            rowsArray.sort(compare);
            tbody.append(...rowsArray);
        };
    }
}
export const userInfo = getUserInfo();
export const getVerifyEmail = async (email) => {
    let value = false;
    //console.log(email.includes("@"))
    if (email.includes("@") === true) {
        /*const users = await getEntitiesData('User');
        const data = users.filter((data) => `${data.email}`.includes(`${email}`));*/
        let raw = JSON.stringify({
            "filter": {
                "conditions": [
                    {
                        "property": "email",
                        "operator": "=",
                        "value": `${email}`
                    }
                ]
            }
        });
        let data = await getFilterEntityData("User", raw);
        if (data.length != 0) {
            value = true;
        }
    }
    return value;
};
export const getVerifyUsername = async (username) => {
    let value = "none";
    //console.log(email.includes("@"))
    if (username != '') {
        /*const users = await getEntitiesData('User');
        const data = users.filter((data) => `${data.email}`.includes(`${email}`));*/
        let raw = JSON.stringify({
            "filter": {
                "conditions": [
                    {
                        "property": "username",
                        "operator": "=",
                        "value": `${username}`
                    }
                ]
            }
        });
        let data = await getFilterEntityData("User", raw);
        if (data.length != 0) {
            value = `${verifyUserType(data[0].userType)}, super: ${data[0].isSuper ? 'Si' : 'No'}`;
        }
    }
    return value;
};
export const verifyUserType = (userType) => {
    if (userType == 'CUSTOMER') {
        return 'Cliente';
    }
    else if (userType == 'GUARD') {
        return 'Guardia';
    }
    else if (userType == 'EMPLOYEE') {
        return 'Empleado';
    }
    else if (userType == 'CONTRACTOR') {
        return 'Contratista';
    }
    else {
        return userType;
    }
};
export const registryPlataform = async (id) => {
    let platUser = await getEntityData('User', id);
    const _date = new Date();
    // TIME
    const _hours = _date.getHours();
    const _minutes = _date.getMinutes();
    const _seconds = _date.getSeconds();
    const _fixedHours = ('0' + _hours).slice(-2);
    const _fixedMinutes = ('0' + _minutes).slice(-2);
    const _fixedSeconds = ('0' + _seconds).slice(-2);
    const currentTime = `${_fixedHours}:${_fixedMinutes}:${_fixedSeconds}`;
    // DATE
    const _day = _date.getDate();
    const _month = _date.getMonth() + 1;
    const _year = _date.getFullYear();
    const date = `${_year}-${('0' + _month).slice(-2)}-${('0' + _day).slice(-2)}`;
    let plataformRaw = JSON.stringify({
        // @ts-ignore
        "userAgent": `${_userAgent}`,
        "customer": {
            "id": `${platUser.customer.id}`
        },
        "system": {
            "id": `3377a344-a1e9-7ea0-4204-44d4040debd2`
        },
        "user": {
            "id": `${platUser.id}`
        },
        // @ts-ignore
        "creationDate": `${date}`,
        // @ts-ignore
        "creationTime": `${currentTime}`,
    });
    await registerEntity(plataformRaw, 'WebAccess')
        .then(res => {
        console.log("Registrado");
    });
};
export const pageNumbers = (totalPages, max, currentPage) => {
    let limitMin;
    let limitMax;
    let ranges = [];
    if (currentPage == 1) {
        limitMin = 1;
        limitMax = max;
        for (let i = limitMin; i <= limitMax; i++) {
            ranges.push(i);
        }
    }
    /*else if(currentPage == totalPages){
        let limit = totalPages - max
        for(let i = limit; i <= totalPages; i++){
                ranges.push(i)
        }
    }*/ else {
        limitMin = currentPage - 4;
        for (let i = limitMin; i < currentPage; i++) {
            ranges.push(i);
        }
        limitMax = currentPage + 5;
        for (let i = currentPage; i <= limitMax; i++) {
            ranges.push(i);
        }
    }
    return ranges;
    /*console.log(items)
    console.log("items.length "+items.length)
    console.log("max "+max)
    console.log("currentPage "+currentPage)
    const half: number = Math.round(max/2)
    console.log("half "+half)
    let to = max
    console.log("to "+to)

    console.log("currentPage + half "+(currentPage + half))
    if(currentPage + half >= items.length){
        to = items.length
    } else if(currentPage > half){
        to = currentPage + half
    }
    console.log("to resultado "+to)
    let from = to - max

    return Array.from({length: max}, (_,i) => (i+1)+from)*/
};
export const fillBtnPagination = (currentPage, color) => {
    let btnActive = document.getElementById("btnPag" + currentPage);
    if (btnActive)
        btnActive.style.backgroundColor = color;
    //btnActive.focus();
};
export const currentDateTime = () => {
    const _date = new Date();
    // TIME
    const _hours = _date.getHours();
    const _minutes = _date.getMinutes();
    const _seconds = _date.getSeconds();
    const _fixedHours = ('0' + _hours).slice(-2);
    const _fixedMinutes = ('0' + _minutes).slice(-2);
    const _fixedSeconds = ('0' + _seconds).slice(-2);
    const currentTimeHHMMSS = `${_fixedHours}:${_fixedMinutes}:${_fixedSeconds}`;
    const currentTimeHHMM = `${_fixedHours}:${_fixedMinutes}`;
    // DATE
    const _day = _date.getDate();
    const _month = _date.getMonth() + 1;
    const _year = _date.getFullYear();
    const date = `${_year}-${('0' + _month).slice(-2)}-${('0' + _day).slice(-2)}`;
    return {
        date: date,
        timeHHMMSS: currentTimeHHMMSS,
        timeHHMM: currentTimeHHMM
    };
};
export const calculateGestionMarcation = (assistControl) => {
    let objDate = {};
    let arrayAssist = [];
    assistControl.forEach((marcation) => {
        // @ts-ignore
        let date = marcation.ingressDate + " " + marcation.user?.username ?? '';
        if (objDate[date]) {
            objDate[date].push(marcation);
        }
        else {
            objDate[date] = [marcation];
        }
    });
    //console.log(objDate)
    let key = Object.keys(objDate);
    for (let i = 0; i < key.length; i++) {
        let objects = objDate[key[i]];
        //console.log(objects)
        //console.log(objects.length)
        let valueMax = [];
        // @ts-ignore
        objects.map(element => {
            if (element.marcationState.name == 'Finalizado' && (element.egressTime != '' || element.egressTime != null || element.egressTime != undefined)) {
                valueMax.push(element);
            }
        });
        let maxDate = new Date(Math.max(
        // @ts-ignore
        ...valueMax.map(element => {
            return new Date(element.egressDate + " " + element.egressTime);
        })));
        let minDate = new Date(Math.min(
        // @ts-ignore
        ...objects.map(element => {
            return new Date(element.ingressDate + " " + element.ingressTime);
        })));
        //console.log("max "+maxDate)
        //console.log("min "+minDate)
        const format = (date) => {
            var year = date.getFullYear();
            var month = ("0" + (date.getMonth() + 1)).slice(-2);
            var day = ("0" + date.getDate()).slice(-2);
            var hours = ("0" + date.getHours()).slice(-2);
            var minutes = ("0" + date.getMinutes()).slice(-2);
            var seconds = ("0" + date.getSeconds()).slice(-2);
            return `${hours}:${minutes}:${seconds}`;
        };
        let fechaSalida = "";
        if (!isNaN(maxDate))
            fechaSalida = format(maxDate);
        let obj = {
            "firstName": `${objects[0]?.user?.firstName ?? ''}`,
            "lastName": `${objects[0]?.user?.lastName ?? ''}`,
            "dni": `${objects[0]?.user?.dni ?? ''}`,
            "ingressDate": `${objects[0].ingressDate}`,
            "egressDate": `${fechaSalida != ""
                ? objects[0].egressDate != undefined ? objects[0].egressDate : objects[0].ingressDate
                : ""}`,
            "ingressTime": `${format(minDate)}`,
            "egressTime": `${fechaSalida}`,
            "username": `${objects[0]?.user?.username ?? ''}`,
        };
        arrayAssist.push(obj);
    }
    return arrayAssist;
};
export const searchUniversalSingle = async (param, operator, value, table) => {
    const raw = JSON.stringify({
        "filter": {
            "conditions": [
                {
                    "property": `${param}`,
                    "operator": `${operator}`,
                    "value": `${value}`
                },
            ]
        },
        sort: "-createdDate",
    });
    const data = await getFilterEntityData(`${table}`, raw);
    if (data == undefined || data.length == 0) {
        alert(`${param} ${value} no obtenido(a)`);
    }
    else {
        return data;
    }
};
export const searchUniversalValue = async (param, operator, value, table) => {
    const raw = JSON.stringify({
        "filter": {
            "conditions": [
                {
                    "property": `${param}`,
                    "operator": `${operator}`,
                    "value": `${value}`
                },
                {
                    "property": `customer.id`,
                    "operator": `=`,
                    "value": ``
                },
            ]
        },
        sort: "createdDate",
    });
    const data = await getFilterEntityData(`${table}`, raw);
    if (data == undefined || data.length == 0) {
        alert(`${param} ${value} no obtenido(a)`);
    }
    else {
        return data;
    }
};
export const calculateLine = (text, limit) => {
    if (text != undefined) {
        if (text.length <= limit) {
            return text;
        }
        else {
            return text.slice(0, limit) + "...";
        }
    }
    else {
        return '';
    }
};
