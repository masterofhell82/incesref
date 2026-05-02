export interface CoursesCertificate {
    id: number;
    preimpreso: string;
    curso: string;
    participantes: number;
    fecha_inicio: string;
    fecha_fin: string;
}

export interface Certificate {
    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    modalidad: string;
    certificateId: string;
    pre_comentario: string;
    svg_cara_a: string;
    svg_cara_b: string;
    is_vigente: boolean;
  }
