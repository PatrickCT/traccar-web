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
      navigator.serviceWorker.register('push-sw.js')
        .then((swReg) => { // Use arrow function here
          this.swRegistration = swReg; // Now 'this' refers to the class instance
          // initialize
        })
        .catch(() => {
        });
    }
  }

  static updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server
    console.log(subscription);
  }

  subscribeUser() {
    const applicationServerKey = PushNotificationsManager.urlB64ToUint8Array(this.applicationServerPublicKey);
    this.swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    })
      .then((subscription) => {
        this.subscription = subscription;
        PushNotificationsManager.updateSubscriptionOnServer(subscription);

        this.isSubscribed = true;
      })
      .catch(() => {
      });
  }

  unsubscribeUser() {
    this.swRegistration.pushManager.getSubscription()
      .then((subscription) => {
        if (subscription) {
          subscription.unsubscribe();
        }
      })
      .catch(() => {
      })
      .then(() => {
        PushNotificationsManager.updateSubscriptionOnServer(null);
        this.subscription = null;
        this.isSubscribed = false;
      });
  }
}

export default PushNotificationsManager;
