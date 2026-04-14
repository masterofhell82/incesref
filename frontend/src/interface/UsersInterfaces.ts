export interface UsersInterfaces {
    id: number;
    nac?: string;
    cedula?: string;
    nombres: string;
    apellidos: string;
    sexo?: string;
    fechaNace: string;
    telefono?: string;
    correo?: string;
    username: string;
    password?: string;
    rol?: string;
    rolId: number;
    estadoId: number;
    activado: boolean;
}
