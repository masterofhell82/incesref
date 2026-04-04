import Config from "./Config";

/* Auth, Access and Users to admin app. */
export const getLogin = `${Config.API_URL}/login`;

export const setLogout = `${Config.API_URL}/logout/`;

export const verifytoken = `${Config.API_URL}/verifytoken`;

export const user = `${Config.API_URL}/usuario/`;

export const userChangePassword = `${Config.API_URL}/usuarios/cambiar-contraseña/`;

// Geografia
export const estados = `${Config.API_URL}/estados`;
export const municipios = `${Config.API_URL}/municipios`;
export const parroquias = `${Config.API_URL}/parroquias`;
export const ciudades = `${Config.API_URL}/ciudades`;

// organizaciones
export const cfs = `${Config.API_URL}/cfs`;

//Ambitos (Scopes)
export const scopes = `${Config.API_URL}/ambitos`;

// Formaciones
export const tiposFormaciones = `${Config.API_URL}/tipoformacion`;

// Routers to Person
export const getPerson = `${Config.API_URL}/person`;
export const getPersonById = (id: string) => `${Config.API_URL}/person/${id}`;


// Roles
export const roles = `${Config.API_URL}/roles`;

//Routers to Certificates
export const getCertificates = `${Config.API_URL}/certificate`;
export const getCertificateById = (id: string) => `${Config.API_URL}/certificate/${id}`;
export const viewCertificate = (id: string) => `${Config.API_URL}/viewcertificate/${id}`;
export const getCurrentCertificates = `${Config.API_URL}/currentcertificates`;
export const getCertificatesByPreimpress = (preimpress: string) => `${Config.API_URL}/getcertificates/${preimpress}`;
