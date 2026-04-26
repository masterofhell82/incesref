import React, { useEffect, useState } from 'react';
import { post, put } from '@/Services/HttpRequest';
import { contenidosFormaciones } from '@/Services/EndPoints';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { NotificationType } from '@/interface/NotificationInterface';
import type { TrainingCoursesContent } from '@/interface/FormationsInterfaces';

import Modals from '@/components/Modals/Modals';

import { Input, Button } from 'antd';

const FormFormationContent = ({
  data,
  shortname,
  isOpen,
  action,
  notify,
}: {
  data: TrainingCoursesContent | null;
  shortname: string;
  isOpen: boolean;
  action: () => void;
  notify: (type: NotificationType, title: string, description: string) => void;
}) => {
  const isEdit = !!data && Object.keys(data).length > 0;
  const getInitialForm = (data: TrainingCoursesContent | null) => {
    return {
      id: data?.id ?? null,
      shortnameCurso: data?.shortname_curso ?? shortname,
      contenido: data?.contenido ?? '',
      horas: data?.horas ?? '',
    };
  };

  const [dataForm, setDataForm] = useState(getInitialForm(data));

  const Schema = Yup.object().shape({
    id: isEdit ? Yup.number() : Yup.number().nullable(),
    shortnameCurso: isEdit
      ? Yup.string()
      : Yup.string().required('El nombre del curso es requerido'),
    contenido: isEdit ? Yup.string() : Yup.string().required('El contenido es requerido'),
    horas: isEdit ? Yup.string() : Yup.string().required('Las horas son requeridas'),
  });

  const formik = useFormik({
    initialValues: dataForm,
    validationSchema: Schema,
    onSubmit: async (values) => {
      try {
        if (dataForm.id) {
          await put(`${contenidosFormaciones}/${dataForm.id}`, JSON.stringify(values));
          notify('success', 'Éxito', 'El contenido ha sido actualizado exitosamente');
        } else {
          await post(contenidosFormaciones, JSON.stringify(values));
          notify('success', 'Éxito', 'El contenido ha sido registrado exitosamente');
        }
        action();
      } catch (error) {
        console.error('Error submitting form:', error);
        notify('error', 'Error', 'Hubo un error al enviar el formulario');
      } finally {
        formik.setSubmitting(false);
      }
    },
  });

  const handleSubmit = async () => {
    formik.setSubmitting(true);
    await formik.handleSubmit();
  };

  useEffect(() => {
    console.log(data, shortname);

    if (data) {
      setDataForm(getInitialForm(data));
    }
  }, [data]);

  return (
    <>
      <Modals
        title={isEdit ? `Editar ${data?.shortname_curso}` : `Agregar ${shortname}`}
        isModalOpen={isOpen}
        handleCancel={action}
        width={750}
        footer={null}
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="nombre">
                Shortname del curso
              </label>
              <Input
                placeholder="Ej. PPL.0000.0000"
                value={formik.values.shortnameCurso}
                readOnly
                onChange={(e) =>
                  formik.setFieldValue('shortnameCurso', e.target.value.toUpperCase())
                }
                status={
                  formik.touched.shortnameCurso && formik.errors.shortnameCurso
                    ? 'error'
                    : undefined
                }
              />
              {formik.touched.shortnameCurso && formik.errors.shortnameCurso && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.shortnameCurso}</div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="nombre">
                Horas
              </label>
              <Input
                placeholder="Ej. 40"
                value={formik.values.horas}
                onBlur={formik.handleBlur}
                onChange={(e) => formik.setFieldValue('horas', e.target.value.toUpperCase())}
                status={formik.touched.horas && formik.errors.horas ? 'error' : undefined}
              />
              {formik.touched.horas && formik.errors.horas && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.horas}</div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium" htmlFor="nombre">
                Contenido
              </label>
              <Input.TextArea
                placeholder="Ej. Fundamentos de soldadura, tipos de soldadura, seguridad en soldadura, etc."
                value={formik.values.contenido}
                onBlur={formik.handleBlur}
                onChange={(e) => formik.setFieldValue('contenido', e.target.value.toUpperCase())}
                status={formik.touched.contenido && formik.errors.contenido ? 'error' : undefined}
                rows={4}
              />
              {formik.touched.contenido && formik.errors.contenido && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.contenido}</div>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2 border-t border-stone-200 pt-4 dark:border-gray-700">
            <Button size="large" color="volcano" variant="solid" onClick={() => action()}>
              Cancelar
            </Button>
            <Button size="large" color="purple" variant="solid" onClick={handleSubmit}>
              {isEdit ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </Modals>
    </>
  );
};

export default FormFormationContent;
