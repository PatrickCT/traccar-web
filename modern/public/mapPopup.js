const createPopUpFooterButtons = (include) => popupFooterButtons(include);

const createPopUpContent = (position, showHeaderButtons = true, showFooterButtons = true, includeFooterButtons = ['streetView', 'maps']) => {
    try {
        const user = window.getUser();
        // sections
        let html = '';

        html += '<div align="center" style="text-align: center !important;text-transform: uppercase !important;">';
        // header buttons
        if (showHeaderButtons && !user.deviceReadonly) {
            html += createPopUpHeadersButtons(position);
        }
        // name
        html += `<h3><b>${valueParser(position, 'name')}</b></h3>`;
        html += '</div>';
        // stats
        html += createPopUpData(position);
        // policy
        // footer bottons
        if (showFooterButtons && !user.deviceReadonly) {
            html += createPopUpFooterButtons(includeFooterButtons);
        }
        return html;
    } catch (_) {
    }

    return '';
};

export const createPopUp = (position, showHeaderButtons = true, showFooterButtons = true) => createPopUpContent(position, showHeaderButtons, showFooterButtons);