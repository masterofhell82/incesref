import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { get, post, put } from '@/Services/HttpRequest';
import { cfs, scopes, estados, municipios, parroquias } from '@/Services/EndPoints';

import { Modal, Input, Button, Select } from 'antd';
const { TextArea } = Input;
import type { ModalProps } from 'antd';
import type { Cores, NotificationType } from '@/interface/CoreInterfaces';

const stylesFn: ModalProps['styles'] = (info) => {
  if (info.props.footer) {
    return {
      container: {
        borderRadius: 14,
        border: '1px solid #ccc',
        padding: 0,
        overflow: 'hidden',
      },
      header: {
        padding: 16,
      },
      body: {
        padding: 16,
      },
      footer: {
        padding: '16px 10px',
        backgroundColor: '#fafafa',
      },
    } satisfies ModalProps['styles'];
  }
  return {};
};

const FormCores = ({
  data,
  isOpen,
  action,
  notify,
}: {
  data: Cores | null;
  isOpen: boolean;
  action: () => void;
  notify: (type: NotificationType, title: string, description: string) => void;
}) => {
  const isEdit = !!data && Object.keys(data).length > 0;

  const getInitialForm = (data: Cores | null) => ({
    id: data?.id ?? null,
    codigo: data?.codigo ?? '',
    nombre: data?.nombre ?? '',
    direccion: data?.direccion ?? '',
    id_estado: data?.id_estado ?? null,
    id_ambito: data?.id_ambito ?? null,
    id_municipios: data?.id_municipios ?? null,
    id_parroquias: data?.id_parroquias ?? null,
  });

  const [ambitos, setAmbitos] = useState([]);
  const [estadosData, setEstadosData] = useState([]);
  const [municipiosData, setMunicipiosData] = useState([]);
  const [parroquiasData, setParroquiasData] = useState([]);
  const [dataForm, setDataForm] = useState(getInitialForm(data));

  const Schema = Yup.object().shape({
    id: isEdit ? Yup.number() : Yup.number().nullable(),
    codigo: isEdit ? Yup.string() : Yup.string().required('El código es requerido'),
    nombre: isEdit ? Yup.string() : Yup.string().required('El nombre es requerido'),
    direccion: isEdit ? Yup.string() : Yup.string().required('La dirección es requerida'),
    id_estado: isEdit ? Yup.number() : Yup.number().required('El estado es requerido').nullable(),
    id_ambito: isEdit ? Yup.number() : Yup.number().required('El ámbito es requerido').nullable(),
    id_municipios: isEdit
      ? Yup.number()
      : Yup.number().required('El municipio es requerido').nullable(),
    id_parroquias: isEdit
      ? Yup.number()
      : Yup.number().required('La parroquia es requerida').nullable(),
  });

  const formik = useFormik({
    initialValues: dataForm,
    validationSchema: Schema,
    onSubmit: async (values) => {
      try {
        if (dataForm.id) {
          await put(`${cfs}/${dataForm.id}`, JSON.stringify(values));
          notify('success', 'Éxito', 'El centro de formación ha sido actualizado exitosamente');
        } else {
          await post(cfs, JSON.stringify(values));
          notify('success', 'Éxito', 'El centro de formación ha sido registrado exitosamente');
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
    formik.handleSubmit();
  };

  const getAmbitos = async () => {
    try {
      const response = await get(scopes);
      const scopesData = response.data.map((ambito: { id: number; nombre: string }) => ({
        value: ambito.id,
        label: ambito.nombre,
      }));
      setAmbitos(scopesData);
    } catch (error) {
      console.error('Error fetching ambitos:', error);
    }
  };

  const getEstados = async () => {
    try {
      const response = await get(estados);
      const estadosData = response.data.map((estado: { id: number; estado: string }) => ({
        value: estado.id,
        label: estado.estado,
      }));
      setEstadosData(estadosData);
    } catch (error) {
      console.error('Error fetching estados:', error);
    }
  };

  const getMunicipios = async (estadoId: number) => {
    try {
      const response = await get(`${municipios}/${estadoId}`);
      const municipiosData = response.data.map((municipio: { id: number; municipio: string }) => ({
        value: municipio.id,
        label: municipio.municipio,
      }));
      setMunicipiosData(municipiosData);
    } catch (error) {
      console.error('Error fetching municipios:', error);
    }
  };

  const getParroquias = async (municipioId: number) => {
    try {
      const response = await get(`${parroquias}/${municipioId}`);
      const parroquiasData = response.data.map((parroquia: { id: number; parroquia: string }) => ({
        value: parroquia.id,
        label: parroquia.parroquia,
      }));
      setParroquiasData(parroquiasData);
    } catch (error) {
      console.error('Error fetching parroquias:', error);
    }
  };

  useEffect(() => {
    setDataForm(getInitialForm(data));
    getAmbitos();
    getEstados();
    if (data?.id_estado) {
      getMunicipios(data.id_estado);
    }
    if (data?.id_municipios) {
      getParroquias(data.id_municipios);
    }
  }, [data]);

  return (
    <>
      <Modal
        title={
          isEdit
            ? `Editar el Centro de Formación: ${dataForm?.nombre}`
            : 'Agregar un Nuevo Centro de Formación'
        }
        centered
        open={isOpen}
        onOk={handleSubmit}
        onCancel={action}
        width={800}
        styles={stylesFn}
        mask={{ enabled: true, blur: true }}
        footer={null}
      >
        <hr className="mt-5 text-pink-900" />
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="mt-4 flex flex-row gap-4">
            {/* codigo */}
            <div className="max-w-xs flex-1">
              <label className="mb-1 block" htmlFor="codigo">
                N° de Código
              </label>
              <Input
                value={formik.values.codigo}
                onChange={(e) => {
                  formik.setFieldValue('codigo', e.target.value.toUpperCase());
                }}
                status={formik.touched.codigo && formik.errors.codigo ? 'error' : undefined}
              />
              {formik.touched.codigo && formik.errors.codigo && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.codigo}</div>
              )}
            </div>
            {/* Ambito */}
            <div className="w-1/2">
              <label className="mb-1 block" htmlFor="id_ambito">
                Ámbito
              </label>
              <Select
                placeholder="Seleccionar Ámbito"
                defaultValue={formik.values.id_ambito ?? undefined}
                options={ambitos}
                style={{ width: '100%' }}
                status={formik.touched.id_ambito && formik.errors.id_ambito ? 'error' : undefined}
                onChange={(e) => {
                  formik.setFieldValue('id_ambito', e);
                }}
              />
              {formik.touched.id_ambito && formik.errors.id_ambito && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.id_ambito}</div>
              )}
            </div>
          </div>

          <div className="mt-4">
            {/* nombre */}
            <div className="flex-1">
              <label className="mb-1 block" htmlFor="nombre">
                Nombre
              </label>
              <Input
                value={formik.values.nombre}
                onChange={(e) => formik.setFieldValue('nombre', e.target.value.toUpperCase())}
                status={formik.touched.nombre && formik.errors.nombre ? 'error' : undefined}
              />
              {formik.touched.nombre && formik.errors.nombre && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.nombre}</div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-row gap-4">
            {/* estado */}
            <div className="min-w-[150px] flex-1">
              <label className="mb-1 block" htmlFor="id_estado">
                Estado
              </label>
              <Select
                placeholder="Seleccionar Estado"
                defaultValue={formik.values.id_estado ?? undefined}
                options={estadosData}
                style={{ width: '100%' }}
                onChange={(e) => {
                  formik.setFieldValue('id_estado', e);
                  formik.setFieldValue('id_municipios', null);
                  formik.setFieldValue('id_parroquias', null);
                  getMunicipios(e);
                }}
              />
              {formik.touched.id_estado && formik.errors.id_estado && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.id_estado}</div>
              )}
            </div>
            {/* municipio */}
            <div className="min-w-[150px] flex-1">
              <label className="mb-1 block" htmlFor="id_municipios">
                Municipio
              </label>
              <Select
                placeholder="Seleccionar Municipio"
                defaultValue={formik.values.id_municipios ?? undefined}
                options={municipiosData}
                style={{ width: '100%' }}
                onChange={(e) => {
                  formik.setFieldValue('id_municipios', e);
                  formik.setFieldValue('id_parroquias', null);
                  getParroquias(e);
                }}
              />
              {formik.touched.id_municipios && formik.errors.id_municipios && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.id_municipios}</div>
              )}
            </div>
            {/* parroquia */}
            <div className="min-w-[150px] flex-1">
              <label className="mb-1 block" htmlFor="id_parroquias">
                Parroquia
              </label>
              <Select
                placeholder="Seleccionar Parroquia"
                defaultValue={formik.values.id_parroquias ?? undefined}
                options={parroquiasData}
                style={{ width: '100%' }}
                onChange={(e) => formik.setFieldValue('id_parroquias', e)}
              />
              {formik.touched.id_parroquias && formik.errors.id_parroquias && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.id_parroquias}</div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block" htmlFor="direccion">
              Dirección Exacta:
            </label>
            <TextArea
              value={formik.values.direccion}
              onChange={(e) => formik.setFieldValue('direccion', e.target.value.toUpperCase())}
            />
            {formik.touched.direccion && formik.errors.direccion && (
              <div className="mt-1 text-xs text-red-500">{formik.errors.direccion}</div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button size="large" color="volcano" variant="solid" onClick={() => action()}>
              Cancelar
            </Button>
            <Button
              size="large"
              color="purple"
              variant="solid"
              disabled={formik.isSubmitting}
              onClick={handleSubmit}
            >
              {isEdit ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default FormCores;
