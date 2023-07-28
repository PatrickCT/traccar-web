export const t = () => { };
export const mainTour = () => {
    const driverObj = window.driver.js.driver({
        overlayColor: '#163b61',
        showProgress: true,
        allowClose: false,
        steps: [
            { element: '#btn-reports', popover: { title: '', description: 'Presione este boton' } },
            { element: '#lst-reports', popover: { title: '', description: 'Elija el tipo de reporte de esta lista' } },
            { element: '#cmb-report-devices', popover: { title: '', description: 'Elija uno o mas dispositivos' } },
            { element: '#cmb-report-from', popover: { title: '', description: 'Elija un periodo de tiempo' } },
            { element: '#cmb-report-btn-search', popover: { title: '', description: 'Presione este boton' } },
        ],
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        doneBtnText: 'Listo',
    });

    driverObj.drive();
};