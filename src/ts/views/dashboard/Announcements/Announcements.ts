// @filename: announcements

import { deleteEntity, getUserInfo, registerEntity, getEntityData, setFile, getFile, updateEntity, getFilterEntityData } from "../../../endpoints.js";
import { CloseDialog, inputObserver, userInfo } from "../../../tools.js";
import { InterfaceElement, InterfaceElementCollection } from "../../../types.js";
import { announcementCreatorController } from "./AnnouncementsCreatorControllers.js";

export class Announcements {
    private _newAnnouncementButton: InterfaceElement = document.getElementById('new-announcement')
    private _announcementCardContainer: InterfaceElement = document.getElementById('cards-container')
    private _announcementCardControlsContainers: InterfaceElement = document.getElementById('cards-controls-container')

    public async render(): Promise<any> {
        this._announcementCardContainer.innerHTML = ''
        this._announcementCardControlsContainers.innerHTML = ''
        const customerId = localStorage.getItem('customer_id');
        //const announcements: any = await getEntitiesData('Announcement')
        //const announcementsList = announcements.filter((data: any) => `${data.customer?.id}` === `${customerId}`)
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
            
        })
        let announcementsList = await getFilterEntityData("Announcement", raw)
        //let _userinfo: any = await getUserInfo()
        //console.log(_userinfo)
        let prop: any

        announcementsList.forEach(async (announcement: any): Promise<void> => {
            const _card = document.createElement('DIV')

            _card.classList.add('card')
            _card.innerHTML = `
                <button class="btn btn_update_announcement" data-announcementid="${announcement.id}" id="update-announcement"><i class="fa-solid fa-search"></i></button><br>
                <button class="btn btn_remove_announcement" data-announcementid="${announcement.id}" id="remove-announcement"><i class="fa-solid fa-trash"></i></button>
                <h3 class="card_title">${announcement.title}</h3>
                <p class="card_content">${announcement.content}</p>
            `

            //let _currentUserId = _userinfo.attributes.id

            this._announcementCardContainer.appendChild(_card)
            const _dotButton = document.createElement('BUTTON')
            _dotButton.classList.add('card_dotbutton')
            this._announcementCardControlsContainers.appendChild(_dotButton)

        }) // End Rendering

        this._newAnnouncementButton.addEventListener('click', (): void => {
            this.publish()
        })

        const container: InterfaceElement = document.querySelector('.cards_container')
        container.style.transform = 'translatex(0%)'

        // BUTTONS
        const _controlButtons: InterfaceElement = document.querySelectorAll('.card_dotbutton')
        _controlButtons[0].classList.add('card_dotbutton-active')
        _controlButtons.forEach((_controlButton: InterfaceElement) => {
            let index = 0;
            _controlButton.addEventListener('click', (e: any): void => {
                const parent: InterfaceElement = _controlButton.parentNode
                const grantParent: InterfaceElement = parent.parentNode
                const container: InterfaceElement = grantParent.querySelector('.cards_container')

                const childrenList = Array.from(parent.children)
                index = childrenList.indexOf(_controlButton)
                container.style.transform = `translatex(-${index * 100}%)`
                // Remove active status
                _controlButtons.forEach((_controlButton: InterfaceElement) => _controlButton.classList.remove('card_dotbutton-active'))
                // Add active status
                _controlButton.classList.add('card_dotbutton-active')
            })
        })

        this.update()
        this.remove()
    }

    private async publish(): Promise<void> {
        const _sidebarRightcontainer: InterfaceElement = document.getElementById('entity-editor-container')
        _sidebarRightcontainer.innerHTML = ''
        _sidebarRightcontainer.style.display = 'flex'
        _sidebarRightcontainer.innerHTML = announcementCreatorController

        this.post()
        this.close()
        inputObserver()
    }

    private async post(): Promise<void> {
        const _buttonPostAnnouncement: InterfaceElement = document.getElementById('post-announcement')
        const _announcementTitle: InterfaceElement = document.getElementById('announcement-title')
        const _announcementContent: InterfaceElement = document.getElementById('announcement-content')
        const _announcementPicture: InterfaceElement = document.getElementById('announcement-picture')
        const _announcementInitDate: InterfaceElement = document.getElementById('announcement-visualizationDate')
        const _announcementInitTime: InterfaceElement = document.getElementById('announcement-visualizationTime')
        const _announcementEndDate: InterfaceElement = document.getElementById('announcement-expirationDate')
        const _announcementEndTime: InterfaceElement = document.getElementById('announcement-expirationTime')
        let _userInfo: any = await userInfo
        let currentUserInfo = await getEntityData('User', `${_userInfo.attributes.id}`)
            
        _announcementPicture.onchange = async(event: any) => {
            let rawImage: File = _announcementPicture.files[0]
            let size = rawImage.size
            let sizekiloBytes = size / 1024
            let sizeMegaBytes = sizekiloBytes / 1024
            if(sizeMegaBytes > currentUserInfo.business.imageSize){
                alert(`Archivo excedido de ${currentUserInfo.business.imageSize} mb (${Number(sizeMegaBytes.toFixed(2))} mb).`);
                _announcementPicture.value = ''
            }
          }
        _buttonPostAnnouncement.addEventListener('click', async (): Promise<void> => {
            //let _userInfo: any = await userInfo
            //let currentUserInfo = await getEntityData('User', `${_userInfo.attributes.id}`)
            const _date = new Date()
            // TIME
            const _hours: number = _date.getHours()
            const _minutes: number = _date.getMinutes()
            const _seconds: number = _date.getSeconds()
            const _fixedHours: string = ('0' + _hours).slice(-2)
            const _fixedMinutes: string = ('0' + _minutes).slice(-2)
            const _fixedSeconds: string = ('0' + _seconds).slice(-2)
            const currentTime = `${_fixedHours}:${_fixedMinutes}:${_fixedSeconds}`
            // DATE
            const _day: number = _date.getDate()
            const _month: number = _date.getMonth() + 1
            const _year: number = _date.getFullYear()
            const date: string = `${_year}-${('0' + _month).slice(-2)}-${('0' + _day).slice(-2)}`
            const customerId = localStorage.getItem('customer_id')
            let attachment
            if (_announcementPicture.files.length !== 0) {
                let rawImage: File = _announcementPicture.files[0]
                let image = await setFile(rawImage)
                let body = JSON.stringify(image)
                let parse = JSON.parse(body)
                attachment = parse.fileRef
             }
            // RAW
            const announcementRaw: string = JSON.stringify({
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
                "visualizationTime": `${_announcementInitTime.value}`,
                "visualizationDate": `${_announcementInitDate.value}`,
                "expirationTime": `${_announcementEndTime.value}`,
                "expirationDate": `${_announcementEndDate.value}`,
                "attachment": `${attachment}`,
            })

            
            //console.log(image)
            if (_announcementTitle.value === '') {
                alert('El campo "título" no puede estar vacío')
            } else if (_announcementContent.value === '') {
                alert('El campo "Contenido" no puede estar vacío')
            } else {

                await registerEntity(announcementRaw, 'Announcement')
                    .then(res => {
                        setTimeout((): void => {
                            const container = document.getElementById('entity-editor-container')
                            new CloseDialog().x(container)
                            this.render()
                        }, 1000)
                    })
            }

        })
    }

    private async remove(): Promise<void> {
        // Remove Announcement
        const _removeAnnouncementButtons: InterfaceElement = document.querySelectorAll('#remove-announcement')
        _removeAnnouncementButtons.forEach((button: InterfaceElement) => {
            button.addEventListener('click', (): void => {
                let announcementId: string = button.dataset.announcementid
                deleteEntity('Announcement', announcementId)
                    .then(res => {
                        setTimeout((): void => {
                            this.render()
                        }, 100)
                    })
            })
        });
    }

    private async update(): Promise<void> {
        // Remove Announcement
        const _updateAnnouncementButtons: InterfaceElement = document.querySelectorAll('#update-announcement')
        _updateAnnouncementButtons.forEach((button: InterfaceElement) => {
            button.addEventListener('click', async(): Promise<void> => {
                let announcementId: string = button.dataset.announcementid
                const data: any = await getEntityData('Announcement', announcementId)
                const _sidebarRightcontainer: InterfaceElement = document.getElementById('entity-editor-container')
                _sidebarRightcontainer.innerHTML = ''
                _sidebarRightcontainer.style.display = 'flex'
                _sidebarRightcontainer.innerHTML = `
                    <div class="entity_editor" id="entity-editor">
                        <div class="entity_editor_header">
                            <div class="user_info">
                                <div class="avatar"><i class="fa-solid fa-rectangle-ad"></i></div>
                                <h1 class="entity_editor_title">
                                    Editar <br>
                                    <small>Anuncio</small>
                                </h1>
                            </div>
                
                            <button class="btn btn_close_editor" id="close">
                                <i class="fa-regular fa-x"></i>
                            </button>
                        </div>
                
                        <!-- EDITOR BODY --->
                        <div class="entity_editor_body padding_t_8_important">
                            <br>
                            <!-- ANNOUNCEMENT TITLE -->
                            <div class="material_input">

                                <input type="text" id="announcement-title" class="input_filled" autocomplete="none" value="${data?.title ?? ''}">
                                <label for="announcement-title">
                                    <i class="fa-solid fa-heading"></i>
                                    Título
                                </label>
                            </div>
                
                            <!-- BOOKMARK: PICTURE IMPORT -->
                            <div id="picture-placeholder">
                                <img id="announcement-picture" width="100%" class="note_picture margin_b_8">
                            </div>
                
                            <!-- ANNOUNCEMENT CONTENT -->
                            <div class="form_input">
                                <label for="announcement-content" class="form_label"><i class="fa-solid fa-paragraph"></i> Contenido del anuncio:</label>
                                <textarea id="announcement-content" name="announcement-content" row="30" class="input_textarea">${data?.content ?? ''}</textarea>
                            </div>
                
                            <div class="sidebar_section">
                                <h5 class="section_title text_center">Duración</h5>
                            </div>
                
                            <div class="form_group">
                                <div class="v_inputs">
                                    <div class="form_input">
                                        <label class="form_label" for="announcement-visualizationDate">Desde: </label>
                                        <input type="date" class="input_clear input_widder input_centertext" id="announcement-visualizationDate" value="${data?.visualizationDate ?? ''}">
                                    </div>
                
                                    <div class="form_input">
                                        <input type="time" class="input_clear input_widder input_centertext margin_t_16" id="announcement-visualizationTime" value="${data?.visualizationTime ?? ''}">
                                    </div>
                                </div>
                
                                <div class="v_inputs">
                                    <div class="form_input">
                                        <label class="form_label" for="announcement-expirationDate">Hasta: </label>
                                        <input type="date" class="input_clear input_widder input_centertext" id="announcement-expirationDate" value="${data?.expirationDate ?? ''}">
                                    </div>
                
                                    <div class="form_input">
                                        <input type="time" class="input_clear input_widder input_centertext margin_t_16" id="announcement-expirationTime" value="${data?.expirationTime ?? ''}">
                                    </div>
                                </div>
                            </div>
                        </div>
                
                        <!-- EDITOR FOOTER -->
                        <div class="entity_editor_footer">
                            <button class="btn btn_primary btn_widder" id="update-announcement">Guardar Cambios</button>
                        </div>
                    </div>
                `

                inputObserver()
                const placeholder: InterfaceElement = document.getElementById('picture-placeholder')
                const picture: InterfaceElement = document.getElementById('announcement-picture')
                if (data.attachment !== undefined) {
                    const image = await getFile(data.attachment)
                    picture.src = image
                    this.zoom(data)
                }else{
                    placeholder.innerHTML = ''
                }

                this.close()
                this.updateData(announcementId)
                
            })
        });
    }

    private updateData(id: string): void {
        let updateButton: InterfaceElement = document.getElementById('update-announcement')
        const _values: InterfaceElementCollection = {
            title: document.getElementById('announcement-title'),
            content: document.getElementById('announcement-content'),
            visualizationDate: document.getElementById('announcement-visualizationDate'),
            visualizationTime: document.getElementById('announcement-visualizationTime'),
            expirationDate: document.getElementById('announcement-expirationDate'),
            expirationTime: document.getElementById('announcement-expirationTime')
        }
        updateButton.addEventListener('click', () => {
            let announcementRaw = JSON.stringify({
                "title": `${_values.title.value}`,
                "content": `${_values.content.value}`,
                "visualizationDate": `${_values.visualizationDate.value}`,
                "visualizationTime": `${_values.visualizationTime.value}`,
                "expirationDate": `${_values.expirationDate.value}`,
                "expirationTime": `${_values.expirationTime.value}`
            })

            updateEntity('Announcement', id, announcementRaw)
            .then((res) => {
                setTimeout((): void => {
                    const container = document.getElementById('entity-editor-container')
                    new CloseDialog().x(container)
                    this.render()
                }, 1000)
            })
        })
    }

    private zoom = (data: any):void =>{
        const picture: InterfaceElement = document.getElementById('announcement-picture')
        const close: InterfaceElement = document.getElementById("close-modalZoom");
        const modalZoom: InterfaceElement = document.getElementById('modalZoom')
        picture.addEventListener('click', (): void => {
            //this.dialogContainer.style.display = 'block'
            //this.dialogContainer.innerHTML = modalZoomImage
            const editor: InterfaceElement = document.getElementById('entity-editor-container')
            editor.style.display = 'none'
            const img01: InterfaceElement = document.getElementById('img01')
            const caption: InterfaceElement = document.getElementById('caption')
            modalZoom.style.display = 'block'
            img01.src = picture.src;
            caption.innerHTML = `${data?.title ?? ''}`
        })
        close.addEventListener('click', (): void => {
            modalZoom.style.display = 'none'
            const editor: InterfaceElement = document.getElementById('entity-editor-container')
            editor.style.display = 'flex'
        })
    }

    private close(): void {
        const closeButton: InterfaceElement = document.getElementById('close')
        const editor: InterfaceElement = document.getElementById('entity-editor-container')

        closeButton.addEventListener('click', () => {
            new CloseDialog().x(editor)
        }, false)
    }
}
