/* eslint-disable import/prefer-default-export */
import { driver } from 'driver.js';

export const surveysTour = driver({
  animate: true, // Smooth animations
  allowClose: false, // Disable closing by clicking outside the highlight
  overlayClickNext: false, // Prevent clicking overlay to proceed
  overlayColor: 'black',
  overlayOpacity: '0.9',
  showButtons: false, // Hide navigation buttons
  nextBtnText: '—›',
  prevBtnText: '‹—',
  doneBtnText: '✕',
});

// Define the steps
const surveyTourSteps = [
  {
    element: '#btn-surveys', // The button's selector
    popover: {
      title: 'Encuestas pendientes',
      description: 'Tienes algunas encuentas pendientes por completar!',
      position: 'bottom', // Popup appears below the element
    },
  },
];

surveysTour.setSteps(surveyTourSteps);
