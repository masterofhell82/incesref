import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { post, put } from '@/Services/HttpRequest';
import { tiposFormaciones } from '@/Services/EndPoints';
import { TypesTraining } from '@/interface/FormationsInterfaces';

import { Input, Button } from 'antd';
const { TextArea } = Input;
import { NotificationType } from '@/interface/NotificationInterface';
import Modals from '@/components/Modals/Modals';

const FormTypesTraining = ({
  data,
  isOpen,
  action,
  notify,
}: {
  data: TypesTraining | null;
  isOpen: boolean;
  action: () => void;
  notify: (type: NotificationType, title: string, description: string) => void;
}) => {
  const isEdit = !!data && Object.keys(data).length > 0;
  const getInitialForm = (data: TypesTraining | null) => ({
    id: data?.id ?? null,
    nombre: data?.nombre ?? '',
    descripcion: data?.descripcion ?? '',
  });
  const [dataForm, setDataForm] = useState(getInitialForm(data));

  const Schema = Yup.object().shape({
    id: isEdit ? Yup.number() : Yup.number().nullable(),
    nombre: isEdit ? Yup.string() : Yup.string().required('El nombre es requerido'),
    descripcion: isEdit ? Yup.string() : Yup.string().required('La descripción es requerida'),
  });

  const formik = useFormik({
    initialValues: dataForm,
    validationSchema: Schema,
    onSubmit: async (values) => {
      try {
        if (dataForm.id) {
          await put(`${tiposFormaciones}/${dataForm.id}`, JSON.stringify(values));
          notify('success', 'Éxito', 'El tipo de formación ha sido actualizado exitosamente');
        } else {
          await post(tiposFormaciones, JSON.stringify(values));
          notify('success', 'Éxito', 'El tipo de formación ha sido registrado exitosamente');
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
    if (data) {
      setDataForm(getInitialForm(data));
    }
  }, [data]);

  return (
    <>
      <Modals
        title={isEdit ? `Editar Tipo de Formación: ${data?.nombre}` : 'Agregar Tipo de Formación'}
        isModalOpen={isOpen}
        handleCancel={action}
        width={500}
        footer={null}
      >
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="mt-4 flex flex-row gap-4">
            {/* nombre */}
            <div className="w-full">
              <label className="mb-1 block" htmlFor="nombre">
                Nombre:
              </label>
              <Input
                value={formik.values.nombre}
                onChange={(e) => {
                  formik.setFieldValue('nombre', e.target.value.toUpperCase());
                }}
                status={formik.touched.nombre && formik.errors.nombre ? 'error' : undefined}
              />
              {formik.touched.nombre && formik.errors.nombre && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.nombre}</div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block" htmlFor="descripcion">
              Descripción:
            </label>
            <TextArea
              value={formik.values.descripcion}
              onChange={(e) => formik.setFieldValue('descripcion', e.target.value)}
            />
            {formik.touched.descripcion && formik.errors.descripcion && (
              <div className="mt-1 text-xs text-red-500">{formik.errors.descripcion}</div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
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

export default FormTypesTraining;
