import { useSelector } from 'react-redux';

export const useAdministrator = () => useSelector((state) => {
  const admin = state.session.user.administrator;
  return admin;
});

export const useSupport = () => useSelector((state) => {
  const { admin, support } = state.session.user;
  return admin && support;
});

export const useManager = () => useSelector((state) => {
  const admin = state.session.user.administrator;
  const manager = (state.session.user.userLimit || 0) !== 0;
  return admin || manager;
});

export const useDeviceReadonly = () => useSelector((state) => {
  const admin = state.session.user.administrator;
  const serverReadonly = state.session.server.readonly;
  const userReadonly = state.session.user.readonly;
  const serverDeviceReadonly = state.session.server.deviceReadonly;
  const userDeviceReadonly = state.session.user.deviceReadonly;
  return !admin && (serverReadonly || userReadonly || serverDeviceReadonly || userDeviceReadonly);
});

export const useRestriction = (key) => useSelector((state) => {
  const admin = state.session.user.administrator;
  const serverValue = state.session.server[key];
  const userValue = state.session.user[key];
  return !admin && (serverValue || userValue);
});

export const useUser = () => useSelector((state) => state.session.user);

export const useCommonUser = () => useSelector((state) => {
  // const transporte = (state.session.user.attributes.hasOwnProperty('Transporte') && state.session.user.attributes.Transporte);
  const checador = (state.session.user.attributes.hasOwnProperty('Checador') && state.session.user.attributes.Checador);

  return !checador;
});

export const useTransporte = () => useSelector((state) => {
  const transporte = (state.session.user.attributes.hasOwnProperty('Transporte') && state.session.user.attributes.Transporte);

  return transporte;
});

export const useSalidasManuales = () => useSelector((state) => {
  const salidas = (state.session.user.attributes.hasOwnProperty('Transporte') && state.session.user.attributes.Transporte && state.session.user.attributes.hasOwnProperty('Salidas') && state.session.user.attributes.Salidas);

  return salidas;
});

export const useChecador = () => useSelector((state) => {
  const checador = (state.session.user?.attributes?.hasOwnProperty('Checador') && state.session.user?.attributes?.Checador);

  return checador;
});
