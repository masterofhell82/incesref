
export interface Cores {
    id: number;
    codigo: string;
    nombre: string;
    direccion: string;
    id_estado?: number;
    estado?: string;
    id_ambito?: number;
    ambito?: string;
    id_municipios?: number;
    id_parroquias?: number;
}

export interface Option {
    id: number;
    value: string;
}

export type NotificationType = 'success' | 'info' | 'warning' | 'error';
