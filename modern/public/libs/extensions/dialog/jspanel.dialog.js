/**
 * jsPanel - A JavaScript library to create highly configurable multifunctional floating panels that can also be used as modal, tooltip, hint or contextmenu
 * @version v4.16.1
 * @homepage https://jspanel.de/
 * @license MIT
 * @author Stefan Sträßer - info@jspanel.de
 * @author of dialog extension: Michael Daumling - michael@terrapinlogo.com
 * @github https://github.com/Flyer53/jsPanel4.git
 */
"use strict"; if (!jsPanel.dialog) { jsPanel.dialog = { version: "1.0.0", date: "2022-04-25 10:00", defaults: { theme: "none", header: !1, position: { my: "center-top", at: "center-top", offsetY: 30 }, contentSize: "auto", onwindowresize: !0, closeOnEscape: !1, closeOnBackdrop: !1, oninitialize: [] }, dialogTemplateId: "#dialogs", css: { primaryBtn: "blue", otherBtn: "white", buttonBar: "buttonbar", promptInput: "prompt-input" }, offsetY: 30, async modal(e, t = {}) { e = this.helpers.getHTML(e), (t = Object.assign({}, this.defaults, t)).content = e; const l = this.active; l && (t.position = Object.assign({}, t.position), t.position.offsetY = l.options.position.offsetY + this.offsetY), t.css = { panel: "jsPanel-dialog" }; for (let l of ["dialog-sm", "dialog-md", "dialog-lg", "dialog-xl"]) if (e.classList.contains(l)) { e.classList.remove(l), t.css.panel += " " + l; break } t.callback ? "function" == typeof t.callback && (t.callback = [t.callback]) : t.callback = [], t.callback.unshift((e => { e.makeDialog(), this.helpers.all.length && this.helpers.all[0].classList.add("background"), this.helpers.all.unshift(e) })), document.addEventListener("jspanelloaded", (e => { e.panel.options.oninitialize && jsPanel.processCallbacks(e.panel, e.panel.options.oninitialize, "every") }), { once: !0 }); const s = jsPanel.modal.create(t); return s.resize({ height: "auto" }), new Promise((e => { s.options.onclosed.push((t => { this.helpers.all.shift(), this.helpers.all.length && this.helpers.all[0].classList.remove("background"); const l = t.dialog.value; t.dialog.value = void 0, e(l) })) })) }, get active() { return this.helpers.all[0] }, get depth() { return this.helpers.all.length }, closeAll() { for (; this.helpers.all.length;) { const e = this.helpers.all.length; if (this.helpers.all[0].close(), this.helpers.all.length === e) return } for (let e of document.querySelectorAll(".jsPanel-modal.background")) e.remove() }, async alert(e, t = ["OK"], l = {}) { return e = this.helpers.getHTML(e), t.length || t.push("OK"), e.append(this.helpers.buttonBar(t)), this.modal(e, l) }, async confirm(e, t = !1, l = [], s = {}) { const a = { label: "Yes", value: "true" }, n = { label: "No", value: "false" }; let i = t ? [n, a] : [a, n]; return i = i.concat(l), "true" === await this.alert(e, i, s) }, async prompt(e, t = "", l = {}) { e = this.helpers.getHTML(`<div>${e}</div>`); const s = document.createElement("div"); if (e instanceof DocumentFragment) for (let t = e.firstChild; t; t = t.nextSibling)s.append(e); else s.append(e); const a = jsPanel.strToHtml(`<input name="input" type="text" class="${this.css.promptInput}" value="${t}"/>`); return s.append(a.firstElementChild), s.append(this.helpers.buttonBar(["OK", "Cancel"])), l = Object.assign({ onclick_OK: e => e.dialog.value = e.dialog.values.input, onclick_Cancel: async e => e.dialog.value = null }, l), await this.modal(s, l) }, helpers: { all: [], buttonBar(e) { const t = document.createElement("div"); t.classList.add(jsPanel.dialog.css.buttonBar); let l = ""; for (let [t, s] of e.map((e => "string" == typeof e ? { label: e, name: e, value: e } : e)).entries()) { let { label: a, value: n, css: i, name: o } = s; const r = jsPanel.dialog.css; i || (i = t ? r.otherBtn : r.primaryBtn); let c = ""; switch (o = o ? `name="${o}"` : "", t) { case 0: 1 === e.length && (c = " data-cancel"); break; case 1: c = " data-cancel" }l += `<button data-dismiss ${o} ${c} class="${i}" value="${n}">${a}</button>` } return t.innerHTML = l, t }, getHTML(e) { if (!(e instanceof Node)) { e = e.toString().trim(); try { let t = document.querySelector(e); if (!t) { const l = document.querySelector(jsPanel.dialog.dialogTemplateId); l && (t = l.content.querySelector(e)) } e = t ? t.cloneNode(!0) : jsPanel.strToHtml("<span>" + e + "</span>") } catch (t) { e = jsPanel.strToHtml(e.toString().trim()) } } if (e instanceof DocumentFragment) { let t = document.createElement("div"); for (let l of e.childNodes) t.append(l); return t } return e instanceof HTMLElement && (e.style.display = ""), e }, getValue(e, t, l = !0) { switch (t.getAttribute("type")) { case "radio": const s = t.getAttribute("name"), a = e.querySelector(`[name="${s}"]:checked`); return a ? a.value : ""; case "checkbox": return t.checked; default: if ("value" in t) return t.value; if (t.hasAttribute("value")) return t.getAttribute("value"); if (l) return t.innerHTML } }, setValue(e, t, l) { switch (t.getAttribute("type")) { case "radio": const s = t.getAttribute("name"), a = e.querySelector(`[name="${s}"][value="${l}"]`); a && (a.checked = !0); break; case "checkbox": t.checked = l; break; default: "value" in t ? t.value = l : t.hasAttribute("value") ? t.setAttribute("value", l.toString()) : t.innerHTML = l.toString() } } } }, document.addEventListener("click", (e => { let t = e.target.closest("[data-dismiss]"); if (!t) return; let l = t.closest(".jsPanel"); l && (t.click && t.click(), l.parentElement && l.close()) })), jsPanel.extend({ makeDialog() { this.dialog = { elements: new e(this), values: new t(this), value: void 0 }; const l = async e => { let t = e.target.closest("[name]"); if (e.stopPropagation(), t) { const l = t ? t.getAttribute("name") : "", s = `on${e.type}_${l}`; this.options[s] && jsPanel.processCallbacks(this, this.options[s], "every", t, e) } else t = e.target; t.hasAttribute("data-dismiss") && this.parentElement && (void 0 === this.dialog.value && (this.dialog.value = jsPanel.dialog.helpers.getValue(this, t, !1)), this.close()) }; this.addEventListener("click", l), this.addEventListener("input", l), this.addEventListener("dblclick", (e => { const t = this.querySelector("[data-dblclick]"); t && (e.stopPropagation(), t.click()) })), this.options.closeOnEscape = e => { const t = this.querySelector("[data-cancel]"); return t && t.click(), !1 } } }); class e { constructor(e) { for (let t of e.querySelectorAll("[name],[data-name]")) { const l = t.getAttribute("name") || t.getAttribute("data-name"); this.hasOwnProperty(l) || Object.defineProperty(this, l, { enumerable: !0, get() { const t = e.querySelectorAll(`[name="${l}"],[data-name="${l}"]`); return t.length <= 1 ? t[0] : t } }) } Object.seal(this) } get() { const e = {}; for (let [t, l] of Object.entries(this)) e[t] = l; return e } } class t { constructor(e) { for (let t of e.querySelectorAll("[name]")) { const l = t.getAttribute("name"); if (this.hasOwnProperty(l)) continue; (t.getAttribute("type") || "").toLowerCase(); Object.defineProperty(this, l, { enumerable: !0, get: () => jsPanel.dialog.helpers.getValue(e, t), set(l) { jsPanel.dialog.helpers.setValue(e, t, l) } }) } Object.seal(this) } get() { const e = {}; for (let [t, l] of Object.entries(this)) e[t] = l; return e } set(e) { for (let [t, l] of Object.entries(e)) this[t] = l } } } "undefined" != typeof module && (module.exports = jsPanel);