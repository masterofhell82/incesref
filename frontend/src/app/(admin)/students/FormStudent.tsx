import React, { useEffect, useState } from 'react';
import { post, put } from '@/Services/HttpRequest';
import { getPerson } from '@/Services/EndPoints';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import type { UsersInterfaces } from '@/interface/UsersInterfaces';
import { NotificationType } from '@/interface/NotificationInterface';

import { Input, DatePicker, Button, Select, Space } from 'antd';
import Modals from '@/components/Modals/Modals';
import dayjs from 'dayjs';

const FormStudent = ({
  data,
  isOpen,
  action,
  notify,
}: {
  data: UsersInterfaces | null;
  isOpen: boolean;
  action: () => void;
  notify: (type: NotificationType, title: string, description: string) => void;
}) => {
  const isEdit = !!data && Object.keys(data).length > 0;

  const nacOptions = [
    { value: 'V', label: 'V' },
    { value: 'E', label: 'E' },
  ];

  const genderOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
  ];

  const getInitialForm = (data: UsersInterfaces | null) => {
    const fechaNace =
      data?.fechaNace ?? (data as UsersInterfaces & { fechaNac?: string })?.fechaNac;

    return {
      nac: data?.nac ?? '',
      cedula: data?.cedula ?? '',
      nombres: data?.nombres ?? '',
      apellidos: data?.apellidos ?? '',
      correo: data?.correo ?? '',
      telefono: data?.telefono ?? '',
      sexo: data?.sexo ?? undefined,
      fechaNace: fechaNace ? dayjs(fechaNace).add(1, 'day').format('YYYY-MM-DD') : null,
    };
  };

  const [dataForm, setDataForm] = useState(getInitialForm(data));

  const Schema = Yup.object().shape({
    nac: isEdit ? Yup.string() : Yup.string().required('La nacionalidad es requerida'),
    cedula: isEdit ? Yup.string() : Yup.string().required('La cédula es requerida'),
    nombres: isEdit ? Yup.string() : Yup.string().required('El nombre es requerido'),
    apellidos: isEdit ? Yup.string() : Yup.string().required('Los apellidos son requeridos'),
    correo: isEdit
      ? Yup.string()
      : Yup.string().email('Correo no válido').required('El correo es requerido'),
    telefono: isEdit ? Yup.string() : Yup.string().required('El teléfono es requerido'),
    sexo: isEdit ? Yup.string() : Yup.string().required('El sexo es requerido'),
    fechaNace: isEdit ? Yup.date() : Yup.date().required('La fecha de nacimiento es requerida'),
  });

  const formik = useFormik({
    initialValues: dataForm,
    validationSchema: Schema,
    onSubmit: async (values) => {
      try {
        if (isEdit) {
          await put(`${getPerson}/${data?.cedula}`, JSON.stringify(values));
          notify('success', 'Éxito', 'El estudiante ha sido actualizado exitosamente');
        } else {
          await post(getPerson, JSON.stringify(values));
          notify('success', 'Éxito', 'El estudiante ha sido registrado exitosamente');
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
        title={isEdit ? `Editar Estudiante: ${data?.nombres} ${data?.apellidos}` : 'Agregar Estudiante'}
        isModalOpen={isOpen}
        handleCancel={action}
        width={750}
        footer={null}
      >
        <form onSubmit={formik.handleSubmit} className="space-y-4 px-6 py-2">
          <div className="mt-4 flex flex-row gap-4">
            {/* ID */}
            <div className="w-1/2">
              <label className="mb-1 block" htmlFor="id">
                Cedula:
              </label>
              <Space.Compact>
                <Select
                  placeholder="--"
                  defaultValue={formik.values.nac}
                  options={nacOptions}
                  onChange={(e) => formik.setFieldValue('nac', e)}
                />
                <Input
                  value={formik.values.cedula}
                  placeholder="N° de Cédula"
                  onChange={(e) => formik.setFieldValue('cedula', e.target.value)}
                  disabled={isEdit}
                />
              </Space.Compact>
              {formik.touched.cedula && formik.errors.cedula && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.cedula}</div>
              )}
            </div>

            <div className="w-1/2">
              <label className="mb-1 block" htmlFor="sexo">
                Sexo:
              </label>
              <Select
                placeholder="Seleccionar Sexo"
                defaultValue={formik.values.sexo}
                options={genderOptions}
                style={{ width: '100%' }}
                onChange={(e) => {
                  formik.setFieldValue('sexo', e);
                }}
              />
              {formik.touched.sexo && formik.errors.sexo && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.sexo}</div>
              )}
            </div>
            <div className="w-1/2">
              <label className="mb-1 block" htmlFor="fechaNace">
                Fecha de Nacimiento:
              </label>
              <DatePicker
                value={formik.values.fechaNace ? dayjs(formik.values.fechaNace) : null}
                placeholder="Seleccionar Fecha"
                onChange={(date, dateString) => {
                  formik.setFieldValue('fechaNace', dateString);
                }}
                style={{ width: '100%' }}
              />
              {formik.touched.fechaNace && formik.errors.fechaNace && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.fechaNace}</div>
              )}
            </div>
            
          </div>

          <div className="mt-4 flex flex-row gap-4">
              {/* nombre */}
            <div className="w-1/2">
              <label className="mb-1 block" htmlFor="nombres">
                Nombres:
              </label>
              <Input
                placeholder="Nombres"
                value={formik.values.nombres}
                onChange={(e) => {
                  formik.setFieldValue('nombres', e.target.value);
                }}
                status={formik.touched.nombres && formik.errors.nombres ? 'error' : undefined}
              />
              {formik.touched.nombres && formik.errors.nombres && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.nombres}</div>
              )}
            </div>
            <div className="w-1/2">
              <label className="mb-1 block" htmlFor="apellidos">
                Apellidos:
              </label>
              <Input
                placeholder="Apellidos"
                value={formik.values.apellidos}
                onChange={(e) => {
                  formik.setFieldValue('apellidos', e.target.value);
                }}
                status={formik.touched.apellidos && formik.errors.apellidos ? 'error' : undefined}
              />
              {formik.touched.apellidos && formik.errors.apellidos && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.apellidos}</div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-row gap-4">
             <div className="w-1/2">
              <label className="mb-1 block" htmlFor="telefono">
                Teléfono:
              </label>
              <Input
                placeholder="Teléfono"
                value={formik.values.telefono}
                onChange={(e) => {
                  formik.setFieldValue('telefono', e.target.value);
                }}
                status={formik.touched.telefono && formik.errors.telefono ? 'error' : undefined}
              />
              {formik.touched.telefono && formik.errors.telefono && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.telefono}</div>
              )}
            </div>
            <div className="w-1/2">
              <label className="mb-1 block" htmlFor="correo">
                Correo:
              </label>
              <Input
                placeholder="Correo"
                value={formik.values.correo}
                onChange={(e) => {
                  formik.setFieldValue('correo', e.target.value);
                }}
                status={formik.touched.correo && formik.errors.correo ? 'error' : undefined}
              />
              {formik.touched.correo && formik.errors.correo && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.correo}</div>
              )}
            </div>
          </div>

          <div className="mt-10 flex justify-end gap-2">
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

export default FormStudent;
