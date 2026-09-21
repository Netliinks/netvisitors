export const UIContentLayout = `
    <div class="datatable" id="datatable">
        <div class="datatable_header">
            <div class="datatable_title"><h1>Anuncios</h1></div>
            <div class="datatable_tools" id="datatable-tools">
                <input type="search" class="search_input" placeholder="Buscar" id="search">
                <button
                    class="datatable_button add_user"
                    id="btnSearch">
                    <i class="fa-solid fa-search"></i>
                </button>
                <button
                    class="datatable_button add_user"
                    id="new-entity">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
        </div>

        <table class="datatable_content">
        <thead><tr>
            <th><span>Título</span></th>
            <th><span>Contenido</span></th>
            <th><span>Creado por</span></th>
            <th><span>Fecha de creación</span></th>
            <th class="thead_centered" width=130><span>Acciones</span></th>
        </tr></thead>
        <tbody id="datatable-body" class="datatable_body">

        </tbody>
        </table>
    </div>
    <div class="datatable_footer">
        <div class="datatable_pagination" id="pagination-container"></div>
    </div>

    <!-- The Modal -->
    <div id="modalZoom" class="modal_zoom">
        <span class="close-zoom" id="close-modalZoom">&times;</span>
        <img class="modal-content-zoom" id="img01">
        <div id="caption" class="caption-zoom"></div>
    </div>
    `;
export const UIAnnouncementCreator = `
    <div class="entity_editor" id="entity-editor">
        <div class="entity_editor_header">
            <div class="user_info">
                <div class="avatar"><i class="fa-solid fa-rectangle-ad"></i></div>
                <h1 class="entity_editor_title">
                    Nuevo <br>
                    <small>Anuncio</small>
                </h1>
            </div>

            <button class="btn btn_close_editor" id="close">
                <i class="fa-regular fa-x"></i>
            </button>
        </div>

        <!-- EDITOR BODY --->
        <div class="entity_editor_body padding_t_8_important">
            <!-- ANNOUNCEMENT TITLE -->
            <div class="material_input">
                <input type="text" id="announcement-title" autocomplete="none">
                <label for="announcement-title">
                    <i class="fa-solid fa-heading"></i>
                    Título
                </label>
            </div>

            <!-- PICTURE IMPORT -->
            <input type="file" class="input_file margin_t_8 margin_b_16" accept="image/png, image/jpeg" id="announcement-picture">

            <!-- ANNOUNCEMENT CONTENT -->
            <div class="form_input">
                <label for="announcement-content" class="form_label"><i class="fa-solid fa-paragraph"></i> Contenido del anuncio:</label>
                <textarea id="announcement-content" name="announcement-content" row="30" class="input_textarea"></textarea>
            </div>

            <!--
            <div class="sidebar_section">
                <h5 class="section_title text_center">Duración</h5>
            </div>

            <div class="form_group">
                <div class="v_inputs">
                    <div class="form_input">
                        <label class="form_label" for="announcement-visualizationDate">Desde: </label>
                        <input type="date" class="input_clear input_widder input_centertext" id="announcement-visualizationDate">
                    </div>

                    <div class="form_input">
                        <input type="time" class="input_clear input_widder input_centertext margin_t_16" id="announcement-visualizationTime">
                    </div>
                </div>

                <div class="v_inputs">
                    <div class="form_input">
                        <label class="form_label" for="announcement-expirationDate">Hasta: </label>
                        <input type="date" class="input_clear input_widder input_centertext" id="announcement-expirationDate">
                    </div>

                    <div class="form_input">
                        <input type="time" class="input_clear input_widder input_centertext margin_t_16" id="announcement-expirationTime">
                    </div>
                </div>
            </div>
            -->
        </div>

        <!-- EDITOR FOOTER -->
        <div class="entity_editor_footer">
            <button class="btn btn_primary btn_widder" id="post-announcement">Publicar</button>
        </div>
    </div>
`;
export const UIAnnouncementEditor = `
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
                <input type="text" id="announcement-title" class="input_filled" autocomplete="none">
                <label for="announcement-title">
                    <i class="fa-solid fa-heading"></i>
                    Título
                </label>
            </div>

            <!-- PICTURE IMPORT -->
            <div id="picture-placeholder">
                <img id="announcement-picture-view" width="100%" class="note_picture margin_b_8">
            </div>

            <!-- ANNOUNCEMENT CONTENT -->
            <div class="form_input">
                <label for="announcement-content" class="form_label"><i class="fa-solid fa-paragraph"></i> Contenido del anuncio:</label>
                <textarea id="announcement-content" name="announcement-content" row="30" class="input_textarea"></textarea>
            </div>

            <!-- ANNOUNCEMENT DETAILS info -->
            <div class="input_detail">
                <label for="announcement-author"><i class="fa-solid fa-user"></i></label>
                <input type="text" id="announcement-author" class="input_filled" readonly>
            </div>
            <br>
            <div class="input_detail">
                <label for="announcement-date"><i class="fa-solid fa-calendar"></i></label>
                <input type="text" id="announcement-date" class="input_filled" readonly>
            </div>

            <!--
            <div class="sidebar_section">
                <h5 class="section_title text_center">Duración</h5>
            </div>

            <div class="form_group">
                <div class="v_inputs">
                    <div class="form_input">
                        <label class="form_label" for="announcement-visualizationDate">Desde: </label>
                        <input type="date" class="input_clear input_widder input_centertext" id="announcement-visualizationDate">
                    </div>

                    <div class="form_input">
                        <input type="time" class="input_clear input_widder input_centertext margin_t_16" id="announcement-visualizationTime">
                    </div>
                </div>

                <div class="v_inputs">
                    <div class="form_input">
                        <label class="form_label" for="announcement-expirationDate">Hasta: </label>
                        <input type="date" class="input_clear input_widder input_centertext" id="announcement-expirationDate">
                    </div>

                    <div class="form_input">
                        <input type="time" class="input_clear input_widder input_centertext margin_t_16" id="announcement-expirationTime">
                    </div>
                </div>
            </div>
            -->
        </div>

        <!-- EDITOR FOOTER -->
        <div class="entity_editor_footer">
            <button class="btn btn_primary btn_widder" id="update-announcement-btn">Guardar Cambios</button>
        </div>
    </div>
`;
