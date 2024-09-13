export const logintour = () => { };
export const loginTour = () => {
  const driverObj = window.driver({
    overlayColor: '#163b61',
    showProgress: true,
    allowClose: false,
    steps: [
      { element: '.page-header', popover: { title: '', description: 'Pasos para iniciar sesión' } },
      { element: '#user', popover: { title: '', description: 'Ingrese su usuario o correo aqui' } },
      { element: '#pass', popover: { title: '', description: 'Ingrese su contraseña aqui' } },
      { element: '#btn-login', popover: { title: '', description: 'Presione este boton para iniciar sesión' } },
    ],
    nextBtnText: 'Siguiente',
    prevBtnText: 'Anterior',
    doneBtnText: 'Listo',
  });

  driverObj.drive();
};
