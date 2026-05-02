import Config from "./Config";

/* Auth, Access and Users to admin app. */
export const getLogin = `${Config.API_URL}/login`;

export const setLogout = `${Config.API_URL}/logout/`;

export const verifytoken = `${Config.API_URL}/verifytoken`;

export const users = `${Config.API_URL}/users`;

export const userChangePassword = `${users}/cambiar-contraseña/`;

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
export const programas = `${Config.API_URL}/programas`;
export const tiposFormaciones = `${Config.API_URL}/tipoformacion`;
export const formaciones = `${Config.API_URL}/cursos`;
export const contenidosFormaciones = `${formaciones}/contenido`;

// Routers to Person
export const getPerson = `${Config.API_URL}/person`;
export const getPersonById = (id: string) => `${Config.API_URL}/person/${id}`;


// Roles
export const roles = `${Config.API_URL}/roles`;

//Certificates
export const certificates = `${Config.API_URL}/certificates`;
export const coursesCertificates = `${certificates}/courses`;
export const getCertificateById = (id: string) => `${Config.API_URL}/certificate/${id}`;
export const viewCertificate = (id: string) => `${Config.API_URL}/viewcertificate/${id}`;
export const certificateTemplates = `${Config.API_URL}/certificates/templates`;
export const getCertificatesByPreimpress = (preimpress: string) => `${Config.API_URL}/certificates/${preimpress}`;
