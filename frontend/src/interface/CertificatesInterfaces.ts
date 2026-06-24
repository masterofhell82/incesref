export interface CertifiedStudent {
  certificateId: number;
  consecutivo?: number;
  nacionalidad: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  genero: string;
  fechaNace: string;
  telefono: string;
  correo: string;
  tituloAsociado: string;
}

export interface CoursesCertificate {
  id: number;
  preimpreso: string;
  preimpreso_id: number;
  curso: string;
  participantes: number;
  fecha_inicio: string;
  fecha_fin: string;
  id_estado: number | null;
  id_cfs: number | null;
  shortname: string;
  id_ambito: number | null;
  entidad_trabajo_id: number | null;
}

export interface Certificate {
  id: number;
  nacionalidad: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  modalidad: string;
  consecutivo: string;
  certificateId: string;
  pre_comentario: string;
  svg_cara_a: string;
  svg_cara_b: string;
  is_vigente: boolean;
}

export interface SelectOption {
  value: number;
  label: string;
}
