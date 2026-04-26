export interface TrainingCourses {
    id: number;
    shortname: string;
    nombre: string;
    descripcion: string;
    tipo_formacion: number | null;
    id_programa: number | null;
    is_contenido?: boolean;
}

export interface TrainingCoursesContent {
    id: number;
    shortname_curso: string;
    contenido: string;
    horas: number;
}

export interface TypesTraining {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface TrainingPrograms {
  id: number;
  nombre: string;
  descripcion: string;
  is_activo: boolean;
}
