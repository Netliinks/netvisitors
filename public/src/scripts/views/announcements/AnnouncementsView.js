import { Config } from "../../Configs.js";
import { registerEntity, getEntityData, setFile, getFile, updateEntity, getFilterEntityData, getFilterEntityCount } from "../../endpoints.js";
import { CloseDialog, inputObserver, userInfo, fillBtnPagination, pageNumbers, calculateLine } from "../../tools.js";
import { UIContentLayout, UIAnnouncementCreator, UIAnnouncementEditor } from "./Layout.js";
import { UITableSkeletonTemplate } from "./Template.js";
const tableRows = Config.tableRows;
let currentPage = Config.currentPage;
const pageName = 'Anuncios';
const customerId = localStorage.getItem('customer_id');
let infoPage = {
    count: 0,
    offset: Config.offset,
    currentPage: currentPage,
    search: ""
};
const getAnnouncements = async () => {
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
    });
    if (infoPage.search != "") {
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
                                "property": "content",
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
            //fetchPlan: 'full',
        });
    }
    infoPage.count = await getFilterEntityCount("Announcement", raw);
    return await getFilterEntityData("Announcement", raw);
};
export class AnnouncementsView {
    constructor() {
        this.dialogContainer = document.getElementById('app-dialogs');
        this.siebarDialogContainer = document.getElementById('entity-editor-container');
        this.appContainer = document.getElementById('datatable-container');
        this.render = async (offset, actualPage, search) => {
            infoPage.offset = offset;
            infoPage.currentPage = actualPage;
            infoPage.search = search;
            this.appContainer.innerHTML = '';
            this.appContainer.innerHTML = UIContentLayout;
            const viewTitle = document.getElementById('view-title');
            const tableBody = document.getElementById('datatable-body');
            if (viewTitle)
                viewTitle.innerText = pageName;
            tableBody.innerHTML = '.Cargando...';
            let announcementsArray = await getAnnouncements();
            tableBody.innerHTML = UITableSkeletonTemplate.repeat(tableRows);
            this.load(tableBody, currentPage, announcementsArray);
            this.searchAnnouncements(tableBody);
            this.pagination(announcementsArray, tableRows, infoPage.currentPage);
        };
        this.load = (tableBody, currentPage, announcements) => {
            tableBody.innerHTML = '';
            if (announcements.length === 0) {
                let row = document.createElement('TR');
                row.innerHTML = `
                <td>No existen datos</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            `;
                tableBody.appendChild(row);
            }
            else {
                for (let i = 0; i < announcements.length; i++) {
                    let announcement = announcements[i];
                    let row = document.createElement('TR');
                    row.innerHTML = `
                    <td>${calculateLine(announcement?.title ?? '', 40)}</td>
                    <td>${calculateLine(announcement?.content ?? '', 40)}</td>
                    <td>${announcement?.user?.firstName ?? ''} ${announcement?.user?.lastName ?? ''}</td>
                    <td>${announcement?.creationDate ?? ''} ${announcement?.creationTime ?? ''}</td>
                    <td class="entity_options">
                        <button class="button" id="edit-entity" data-entityId="${announcement.id}">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                    </td>
                `;
                    tableBody.appendChild(row);
                }
            }
            this.register();
            this.edit();
        };
        this.searchAnnouncements = async (tableBody) => {
            const search = document.getElementById('search');
            const btnSearch = document.getElementById('btnSearch');
            if (search) {
                search.value = infoPage.search;
            }
            if (btnSearch && search) {
                btnSearch.addEventListener('click', async () => {
                    new AnnouncementsView().render(Config.offset, Config.currentPage, search.value.toLowerCase().trim());
                });
            }
        };
        this.register = () => {
            const openEditor = document.getElementById('new-entity');
            if (!openEditor)
                return;
            openEditor.addEventListener('click', () => {
                this.siebarDialogContainer.innerHTML = '';
                this.siebarDialogContainer.style.display = 'flex';
                this.siebarDialogContainer.innerHTML = UIAnnouncementCreator;
                const closeSidebar = document.getElementById('close');
                if (closeSidebar) {
                    closeSidebar.addEventListener('click', () => {
                        new CloseDialog().x(this.siebarDialogContainer);
                    });
                }
                inputObserver();
                this.post();
            });
        };
        this.post = () => {
            const _buttonPostAnnouncement = document.getElementById('post-announcement');
            const _announcementTitle = document.getElementById('announcement-title');
            const _announcementContent = document.getElementById('announcement-content');
            const _announcementPicture = document.getElementById('announcement-picture');
            const _announcementInitDate = document.getElementById('announcement-visualizationDate');
            const _announcementInitTime = document.getElementById('announcement-visualizationTime');
            const _announcementEndDate = document.getElementById('announcement-expirationDate');
            const _announcementEndTime = document.getElementById('announcement-expirationTime');
            if (!_buttonPostAnnouncement)
                return;
            _buttonPostAnnouncement.addEventListener('click', async () => {
                let _userInfo = await userInfo;
                let currentUserInfo = await getEntityData('User', `${_userInfo.attributes.id}`);
                const _date = new Date();
                const _hours = _date.getHours();
                const _minutes = _date.getMinutes();
                const _seconds = _date.getSeconds();
                const _fixedHours = ('0' + _hours).slice(-2);
                const _fixedMinutes = ('0' + _minutes).slice(-2);
                const _fixedSeconds = ('0' + _seconds).slice(-2);
                const currentTime = `${_fixedHours}:${_fixedMinutes}:${_fixedSeconds}`;
                const _day = _date.getDate();
                const _month = _date.getMonth() + 1;
                const _year = _date.getFullYear();
                const date = `${_year}-${('0' + _month).slice(-2)}-${('0' + _day).slice(-2)}`;
                let attachment;
                if (_announcementPicture && _announcementPicture.files.length !== 0) {
                    let rawImage = _announcementPicture.files[0];
                    const sizeMegaBytes = rawImage.size / (1024 * 1024);
                    if (sizeMegaBytes > 3) {
                        alert(`El archivo excede el límite permitido de 3 MB (${Number(sizeMegaBytes.toFixed(2))} MB).`);
                        _announcementPicture.value = '';
                        return;
                    }
                    const cleanName = rawImage.name.replace(/\s+/g, '');
                    const blob = rawImage.slice(0, rawImage.size, rawImage.type);
                    const renamedFile = new File([blob], cleanName, { type: rawImage.type });
                    let image = await setFile(renamedFile);
                    let body = JSON.stringify(image);
                    let parse = JSON.parse(body);
                    attachment = parse.fileRef;
                }
                const announcementRaw = JSON.stringify({
                    "title": `${_announcementTitle.value}`,
                    "content": `${_announcementContent.value}`,
                    "user": {
                        "id": `${_userInfo.attributes.id}`
                    },
                    "business": {
                        "id": `${currentUserInfo.business.id}`
                    },
                    "customer": {
                        "id": `${customerId}`
                    },
                    "creationTime": `${currentTime}`,
                    "creationDate": `${date}`,
                    "attachment": attachment ? `${attachment}` : undefined,
                });
                if (_announcementTitle.value === '') {
                    alert('El campo "título" no puede estar vacío');
                }
                else if (_announcementContent.value === '') {
                    alert('El campo "Contenido" no puede estar vacío');
                }
                else {
                    await registerEntity(announcementRaw, 'Announcement')
                        .then(res => {
                        setTimeout(() => {
                            new CloseDialog().x(this.siebarDialogContainer);
                            this.render(infoPage.offset, infoPage.currentPage, infoPage.search);
                        }, 1000);
                    });
                }
            });
        };
        this.edit = () => {
            const editButtons = document.querySelectorAll('#edit-entity');
            editButtons.forEach((button) => {
                button.addEventListener('click', async () => {
                    let announcementId = button.dataset.entityid;
                    const data = await getEntityData('Announcement', announcementId);
                    this.siebarDialogContainer.innerHTML = '';
                    this.siebarDialogContainer.style.display = 'flex';
                    this.siebarDialogContainer.innerHTML = UIAnnouncementEditor;
                    const closeSidebar = document.getElementById('close');
                    if (closeSidebar) {
                        closeSidebar.addEventListener('click', () => {
                            new CloseDialog().x(this.siebarDialogContainer);
                        });
                    }
                    inputObserver();
                    const _titleInput = document.getElementById('announcement-title');
                    const _contentInput = document.getElementById('announcement-content');
                    const _authorInput = document.getElementById('announcement-author');
                    const _dateInput = document.getElementById('announcement-date');
                    if (_titleInput)
                        _titleInput.value = data?.title ?? '';
                    if (_contentInput)
                        _contentInput.value = data?.content ?? '';
                    if (_authorInput)
                        _authorInput.value = `${data?.user?.firstName ?? ''} ${data?.user?.lastName ?? ''}`;
                    if (_dateInput)
                        _dateInput.value = `${data?.creationDate ?? ''} ${data?.creationTime ?? ''}`;
                    const picture = document.getElementById('announcement-picture-view');
                    if (data.attachment !== undefined && picture) {
                        const image = await getFile(data.attachment);
                        picture.src = image;
                    }
                    else {
                        const placeholder = document.getElementById('picture-placeholder');
                        if (placeholder)
                            placeholder.innerHTML = '';
                    }
                    const updateButton = document.getElementById('update-announcement-btn');
                    if (updateButton) {
                        updateButton.addEventListener('click', () => {
                            let announcementRaw = JSON.stringify({
                                "title": `${_titleInput.value}`,
                                "content": `${_contentInput.value}`
                            });
                            updateEntity('Announcement', announcementId, announcementRaw)
                                .then((res) => {
                                setTimeout(() => {
                                    new CloseDialog().x(this.siebarDialogContainer);
                                    this.render(infoPage.offset, infoPage.currentPage, infoPage.search);
                                }, 1000);
                            });
                        });
                    }
                });
            });
        };
    }
    pagination(items, limitRows, currentPage) {
        const paginationWrapper = document.getElementById('pagination-container');
        if (!paginationWrapper)
            return;
        paginationWrapper.innerHTML = '';
        let pageCount = Math.ceil(infoPage.count / limitRows);
        let button;
        if (pageCount <= Config.maxLimitPage) {
            for (let i = 1; i < pageCount + 1; i++) {
                button = setupButtons(i);
                paginationWrapper.appendChild(button);
            }
            fillBtnPagination(currentPage, Config.colorPagination);
        }
        else {
            pagesOptions(items, currentPage);
        }
        function setupButtons(page) {
            const button = document.createElement('button');
            button.classList.add('pagination_button');
            button.setAttribute("name", "pagination-button");
            button.setAttribute("id", "btnPag" + page);
            button.innerText = page.toString();
            button.addEventListener('click', () => {
                infoPage.offset = Config.tableRows * (page - 1);
                currentPage = page;
                new AnnouncementsView().render(infoPage.offset, currentPage, infoPage.search);
            });
            return button;
        }
        function pagesOptions(items, currentPage) {
            paginationWrapper.innerHTML = '';
            let pages = pageNumbers(pageCount, Config.maxLimitPage, currentPage);
            const prevButton = document.createElement('button');
            prevButton.classList.add('pagination_button');
            prevButton.innerText = "<<";
            paginationWrapper.appendChild(prevButton);
            const nextButton = document.createElement('button');
            nextButton.classList.add('pagination_button');
            nextButton.innerText = ">>";
            for (let i = 0; i < pages.length; i++) {
                if (pages[i] > 0 && pages[i] <= pageCount) {
                    button = setupButtons(pages[i]);
                    paginationWrapper.appendChild(button);
                }
            }
            paginationWrapper.appendChild(nextButton);
            fillBtnPagination(currentPage, Config.colorPagination);
            setupButtonsEvents(prevButton, nextButton);
        }
        function setupButtonsEvents(prevButton, nextButton) {
            prevButton.addEventListener('click', () => {
                new AnnouncementsView().render(Config.offset, Config.currentPage, infoPage.search);
            });
            nextButton.addEventListener('click', () => {
                infoPage.offset = Config.tableRows * (pageCount - 1);
                new AnnouncementsView().render(Config.offset, pageCount, infoPage.search);
            });
        }
    }
}
