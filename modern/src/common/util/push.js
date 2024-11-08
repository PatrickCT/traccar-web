/* eslint-disable func-names */
/* eslint-disable no-unreachable */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-alert */
import { createBaseURL } from './utils';

class PushNotificationsManager {
  constructor() {
    this.subscription = null;
    this.applicationServerPublicKey = 'BKQ1UpKmuE7iIKJD1R6FnlvvvB9V_S5NbalA9_CNqr1a8MILkL3XkccJGrO0nnXH2CsJG5becvnnOaNb5FV9aFA';
    this.isSubscribed = false;
    this.swRegistration = null;

    // this.urlB64ToUint8Array = this.urlB64ToUint8Array.bind(this);
    this.init = this.init.bind(this);
    this.subscribeUser = this.subscribeUser.bind(this);
    this.unsubscribeUser = this.unsubscribeUser.bind(this);
    this.init();
  }

  static urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i += 1) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  init() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register(`${createBaseURL()}/push-sw.js`)
        .then((swReg) => { // Use arrow function here
          this.swRegistration = swReg; // Now 'this' refers to the class instance
          // initialize
          swReg.pushManager.getSubscription().then((subscription) => {
            this.subscription = subscription;
            this.isSubscribed = this.subscription !== null;
          });
        })
        .catch(() => {
        });
    }
  }

  static updateSubscriptionOnServer(subscription, endpoint) {
    if (subscription) {
      fetch('https://crmgpstracker.mx:4545/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: window.getUser() || null,
          subscription,
          hostname: window.location.hostname,
        }),
      })
        .then((response) => response.json())
        .then((data) => window.updatePushId(data.data.push_user.id))
        .catch((err) => alert('No se pudo subscribir a las notificaciones push'));
    } else {
      fetch(`https://crmgpstracker.mx:4545/api/subscriptions/${btoa(endpoint)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => window.updatePushId(null))
        .catch((err) => alert('No se pudo cancelar la subscripción a las notificaciones push'));
    }
  }

  subscribeUser() {
    if (window.flutter_inappwebview) {
      window.flutter_inappwebview.callHandler('flutter-push-info-user', JSON.stringify(((user) => ({ name: user?.name || '', id: user?.id || 0 }))(window.getUser() || null)));
      return;
    }
    const applicationServerKey = PushNotificationsManager.urlB64ToUint8Array(this.applicationServerPublicKey);
    this.swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    })
      .then((subscription) => {
        this.subscription = subscription;
        PushNotificationsManager.updateSubscriptionOnServer(subscription, null);

        this.isSubscribed = true;
      })
      .catch(() => {
      });
  }

  unsubscribeUser() {
    this.swRegistration.pushManager.getSubscription()
      .then((subscription) => {
        if (subscription) {
          PushNotificationsManager.updateSubscriptionOnServer(null, subscription.endpoint);
          subscription.unsubscribe();
        }
      })
      .catch(() => {
      })
      .then(() => {
        this.subscription = null;
        this.isSubscribed = false;
      });
  }
}

export default PushNotificationsManager;
