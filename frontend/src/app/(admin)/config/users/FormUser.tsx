import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { get, post, put } from '@/Services/HttpRequest';
import { estados, users, roles } from '@/Services/EndPoints';

import type { UsersInterfaces } from '@/interface/UsersInterfaces';
import { NotificationType } from '@/interface/NotificationInterface';
import { Option } from '@/interface/CoreInterfaces';
import { Roles } from '@/interface/RolesInterfaces';
import { GeoEstados } from '@/interface/GeographyInterface';

import { Input, DatePicker, Button, Select, Space } from 'antd';
import Modals from '@/components/Modals/Modals';
import dayjs from 'dayjs';

const FormUser = ({
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
  const [estadosOptions, setEstadosOptions] = useState<Option[]>([]);
  const [rolesOptions, setRolesOptions] = useState<Option[]>([]);

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
      id: data?.id ?? null,
      nac: data?.nac ?? '',
      cedula: data?.cedula ?? '',
      nombres: data?.nombres ?? '',
      apellidos: data?.apellidos ?? '',
      correo: data?.correo ?? '',
      username: data?.username ?? '',
      password: '',
      confirmPassword: '',
      telefono: data?.telefono ?? '',
      rolId: data?.rolId ?? null,
      estadoId: data?.estadoId ?? null,
      sexo: data?.sexo ?? undefined,
      fechaNace: fechaNace ? dayjs(fechaNace).add(1, 'day').format('YYYY-MM-DD') : null,
    };
  };

  const [dataForm, setDataForm] = useState(getInitialForm(data));

  const Schema = Yup.object().shape({
    id: isEdit ? Yup.number() : Yup.number().nullable(),
    nac: isEdit ? Yup.string() : Yup.string().required('La nacionalidad es requerida'),
    cedula: isEdit ? Yup.string() : Yup.string().required('La cédula es requerida'),
    nombres: isEdit ? Yup.string() : Yup.string().required('El nombre es requerido'),
    apellidos: isEdit ? Yup.string() : Yup.string().required('Los apellidos son requeridos'),
    correo: isEdit
      ? Yup.string()
      : Yup.string().email('Correo no válido').required('El correo es requerido'),
    username: isEdit ? Yup.string() : Yup.string().required('El usuario es requerido'),
    telefono: isEdit ? Yup.string() : Yup.string().required('El teléfono es requerido'),
    password: isEdit
      ? Yup.string()
      : Yup.string()
          .min(6, 'La contraseña debe tener al menos 6 caracteres')
          .required('La contraseña es requerida'),
    confirmPassword: isEdit
      ? Yup.string()
      : Yup.string()
          .oneOf([Yup.ref('password')], 'Las contraseñas deben coincidir')
          .required('La confirmación de contraseña es requerida'),
    rolId: isEdit ? Yup.number() : Yup.number().required('El rol es requerido'),
    estadoId: isEdit ? Yup.number() : Yup.number().required('El estado es requerido'),
    sexo: isEdit ? Yup.string() : Yup.string().required('El sexo es requerido'),
    fechaNace: isEdit ? Yup.date() : Yup.date().required('La fecha de nacimiento es requerida'),
  });

  const formik = useFormik({
    initialValues: dataForm,
    validationSchema: Schema,
    onSubmit: async (values) => {
      try {
        if (dataForm.id) {
          await put(`${users}/${dataForm.id}`, JSON.stringify(values));
          notify('success', 'Éxito', 'El usuario ha sido actualizado exitosamente');
        } else {
          await post(users, JSON.stringify(values));
          notify('success', 'Éxito', 'El usuario ha sido registrado exitosamente');
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

  const fetchEstados = async () => {
    try {
      const response = await get(estados);
      const options = response.data.map((estado: GeoEstados) => ({
        value: estado.id,
        label: estado.estado,
      }));
      setEstadosOptions(options);
    } catch (error) {
      console.error('Error fetching estados:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await get(roles);
      const options = response.data.map((rol: Roles) => ({
        value: rol.id,
        label: rol.nombre,
      }));
      setRolesOptions(options);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  useEffect(() => {
    fetchEstados();
    fetchRoles();
    if (data) {
      setDataForm(getInitialForm(data));
    }
  }, [data]);

  return (
    <>
      <Modals
        title={isEdit ? `Editar Usuario: ${data?.nombres} ${data?.apellidos}` : 'Agregar Usuario'}
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
                  defaultValue="V"
                  options={nacOptions}
                  onChange={(e) => formik.setFieldValue('nac', e)}
                />
                <Input
                  value={formik.values.cedula}
                  placeholder="N° de Cédula"
                  onChange={(e) => formik.setFieldValue('cedula', e.target.value)}
                />
              </Space.Compact>
              {formik.touched.cedula && formik.errors.cedula && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.cedula}</div>
              )}
            </div>
            {/* nombre */}
            <div className="w-2/4">
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
            <div className="w-2/4">
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
            <div className="w-1/4">
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
            <div className="w-1/4">
              <label className="mb-1 block" htmlFor="fechaNace">
                Fecha de Nacimiento:
              </label>
              <DatePicker
                value={formik.values.fechaNace ? dayjs(formik.values.fechaNace) : null}
                onChange={(date, dateString) => {
                  formik.setFieldValue('fechaNace', dateString);
                }}
                style={{ width: '100%' }}
              />
              {formik.touched.fechaNace && formik.errors.fechaNace && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.fechaNace}</div>
              )}
            </div>
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
          </div>

          <div className="mt-4 flex flex-row gap-4">
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
            <div className="w-1/2">
              <label className="mb-1 block" htmlFor="username">
                Usuario:
              </label>
              <Input
                placeholder="Usuario (para login)"
                value={formik.values.username}
                onChange={(e) => {
                  formik.setFieldValue('username', e.target.value);
                }}
                status={formik.touched.username && formik.errors.username ? 'error' : undefined}
              />
              {formik.touched.username && formik.errors.username && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.username}</div>
              )}
            </div>
          </div>

          {!isEdit && (
            <div className="mt-4 flex flex-row gap-4">
              <div className="w-1/2">
                <label className="mb-1 block" htmlFor="password">
                  Contraseña:
                </label>
                <Input.Password
                  placeholder="Contraseña"
                  value={formik.values.password}
                  onChange={(e) => {
                    formik.setFieldValue('password', e.target.value);
                  }}
                  status={formik.touched.password && formik.errors.password ? 'error' : undefined}
                />
                {formik.touched.password && formik.errors.password && (
                  <div className="mt-1 text-xs text-red-500">{formik.errors.password}</div>
                )}
              </div>
              <div className="w-1/2">
                <label className="mb-1 block" htmlFor="confirmPassword">
                  Confirmar Contraseña:
                </label>
                <Input.Password
                  placeholder="Confirmar Contraseña"
                  value={formik.values.confirmPassword}
                  onChange={(e) => {
                    formik.setFieldValue('confirmPassword', e.target.value);
                  }}
                  status={
                    formik.touched.confirmPassword && formik.errors.confirmPassword
                      ? 'error'
                      : undefined
                  }
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <div className="mt-1 text-xs text-red-500">{formik.errors.confirmPassword}</div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-row gap-4">
            {/* Roles */}
            <div className="min-w-[150px] flex-1">
              <label className="mb-1 block" htmlFor="rolId">
                Rol
              </label>
              <Select
                placeholder="Seleccionar Rol"
                defaultValue={formik.values.rolId ?? undefined}
                options={rolesOptions}
                style={{ width: '100%' }}
                onChange={(e) => {
                  formik.setFieldValue('rolId', e);
                }}
              />
              {formik.touched.rolId && formik.errors.rolId && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.rolId}</div>
              )}
            </div>
            {/* Estado */}
            <div className="min-w-[150px] flex-1">
              <label className="mb-1 block" htmlFor="estadoId">
                Estado
              </label>
              <Select
                placeholder="Seleccionar Estado"
                defaultValue={formik.values.estadoId ?? undefined}
                options={estadosOptions}
                style={{ width: '100%' }}
                onChange={(e) => {
                  formik.setFieldValue('estadoId', e);
                }}
              />
              {formik.touched.estadoId && formik.errors.estadoId && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.estadoId}</div>
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

export default FormUser;
