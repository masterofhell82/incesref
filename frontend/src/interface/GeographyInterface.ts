export interface GeoCiudades {
    id: number;
    id_estado: number;
    ciudad?: string;
    capital?: number;
}

export interface GeoParroquias {
    id: number;
    id_municipios: number;
    parroquia?: string;
}

export interface GeoMunicipios {
    id: number;
    id_estado: number;
    municipio?: string;
}

export interface GeoEstados {
    id: number;
    estado?: string;
    iso_3166_2?: string;
    abreviatura?: string;
}
