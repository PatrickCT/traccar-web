// components/Snackbar.tsx
import React, { useEffect, useRef, useState } from 'react';
import styles from './Snackbar.module.css';

let globalQueue: SnackbarConfig[] = [];

// snackbar.js
// snackbar.ts
type SnackbarConfig = {
  message: string;
  dismissible?: boolean;
  onClose?: () => void;
  _sbid?: number;
};

class Snackbar {
  private active: SnackbarConfig | null = null;
  private queue: SnackbarConfig[] = [];
  private progress = -1;
  private timer: ReturnType<typeof setInterval> | null = null;

  private cssAnimationDelay = 1000;
  private visibilityDuration = 7000;

  private domElement: HTMLDivElement;
  private snackElement: HTMLDivElement | null = null;
  private progressElement: HTMLDivElement | null = null;

  constructor() {
    const existing = document.getElementById("global-snackbar") as HTMLDivElement | null;
    if (existing) {
      this.domElement = existing;
      return;
    }

    const domElement = document.createElement("div");
    domElement.className = "snackbar";
    domElement.id = "global-snackbar";
    document.body.appendChild(domElement);

    this.domElement = domElement;
    this.hide = this.hide.bind(this);
  }

  hide() {
    if (!this.snackElement) return;

    this.active = null;
    if (this.timer) clearInterval(this.timer);

    this.snackElement.classList.remove("active");

    setTimeout(() => {
      if (this.snackElement && this.snackElement.parentElement === this.domElement) {
        this.domElement.removeChild(this.snackElement);
      }
      this.progress = -1;
      this.snackElement = null;
      this.progressElement = null;

      if (this.queue.length) this.show(this.queue.shift()!, true);
    }, 500);
  }

  show(config: SnackbarConfig, important = false) {
    if (!config) return;

    if (!config._sbid) config._sbid = Date.now();
    const queuePopulated = this.queue.length;

    if (this.active && !important) {
      this.queue.push(config);
      return;
    }

    if (queuePopulated && config._sbid === this.queue[0]._sbid) {
      this.queue.shift();
    }

    if (this.active) {
      this.queue.unshift(this.active, config);
      this.hide();
      return;
    }

    this.active = config;

    const snackElement = document.createElement("div");
    snackElement.className = "snack";

    const snackMessage = document.createElement("span");
    snackMessage.innerText = config.message;
    snackElement.appendChild(snackMessage);

    if (config.dismissible) {
      const dismissBtn = document.createElement("button");
      dismissBtn.type = "button";
      dismissBtn.innerText = "✘";
      dismissBtn.onclick = () => {
        this.hide();
        config.onClose?.();
      };
      snackElement.appendChild(dismissBtn);
      snackElement.classList.add("dismissible");
    }

    const progressBar = document.createElement("div");
    progressBar.className = "progress";
    snackElement.appendChild(progressBar);

    this.progressElement = progressBar;
    this.snackElement = snackElement;
    this.domElement.appendChild(snackElement);

    this.progress = -1;
    this.timer = setInterval(() => {
      if (!this.progressElement || !this.snackElement) return;

      this.progress++;
      if (this.progress === 0) {
        this.snackElement.classList.add("active");
      }

      const width = this.snackElement.clientWidth;
      this.progressElement.style.width = `${(this.progress / 100) * width}px`;

      if (this.progress === 100) {
        this.hide();
      }
    }, Math.round(this.visibilityDuration / 100));
  }
}

const snackbar = new Snackbar();
export default snackbar;

