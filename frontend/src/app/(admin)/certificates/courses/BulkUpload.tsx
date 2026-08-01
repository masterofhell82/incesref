'use client';
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { get, post } from '@/Services/HttpRequest';
import {
  activeCourses,
  cfs,
  estados,
  preimpresos,
  formaciones,
  employerEntities,
} from '@/Services/EndPoints';

import Spinner from '@/components/spinner/Spinner';

import { Button, DatePicker, Input, Select, message } from 'antd';
import dayjs from 'dayjs';

import { GeoEstados } from '@/interface/GeographyInterface';
import type { SelectOption, CoursesCertificate } from '@/interface/CertificatesInterfaces';
import { TrainingCourses } from '@/interface/FormationsInterfaces';
import { EmployersData } from '@/interface/EmployersInterfaces';

import UploadStudent from './UploadStudent';
import { getRequestErrorMessage } from '@/types/ErrorType';

const BulkUpload = ({
  data,
  action,
}: {
  data?: CoursesCertificate | null;
  action?: () => void;
}) => {
  const isEdit = !!data && Object.keys(data).length > 0;

  const getInitialForm = (data?: CoursesCertificate | null) => ({
    id: data?.id ?? null,
    id_estado: data?.id_estado ?? null,
    id_cfs: data?.id_cfs ?? null,
    entidad_trabajo_id: data?.entidad_trabajo_id ?? null,
    preimpreso: data?.preimpreso ?? '',
    participantes: data?.participantes ?? 0,
    shortname: data?.shortname || undefined,
    fecha_inicio: data?.fecha_inicio ? dayjs(data.fecha_inicio) : null,
    fecha_fin: data?.fecha_fin ? dayjs(data.fecha_fin) : null,
    hoja: data?.hoja ?? '',
    libro: data?.libro ?? '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [preimpress, setPreimpress] = useState<number | null>(null);
  const [dataForm, setDataForm] = useState(getInitialForm(data));
  const [estadosOptions, setEstadosOptions] = useState<SelectOption[]>([]);
  const [cfsOptions, setCfsOptions] = useState<SelectOption[]>([]);
  const [employerOptions, setEmployerOptions] = useState<SelectOption[]>([]);
  const [allformaciones, setAllFormaciones] = useState<TrainingCourses[]>([]);
  const [formacionesOptions, setFormacionesOptions] = useState<SelectOption[]>([]);
  const [formationName, setFormationName] = useState<string>('');
  const [enableEmployer, setEnableEmployer] = useState(true);

  const schema = Yup.object().shape({
    id: Yup.number().nullable(),
    id_estado: Yup.number().nullable().required('El estado es requerido'),
    id_cfs: Yup.number().nullable().required('El CFS es requerido'),
    entidad_trabajo_id: Yup.number().nullable(), // No es requerido
    preimpreso: Yup.string().trim().required('El preimpreso es requerido'),
    shortname: Yup.string().trim().required('El nombre corto es requerido'),
    fecha_inicio: Yup.string().trim().required('La fecha de inicio es requerida'),
    fecha_fin: Yup.string().trim().required('La fecha de cierre es requerida'),
  });

  const formik = useFormik({
    initialValues: dataForm,
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        await post(`${activeCourses}/register`, JSON.stringify(values));
        message.success('Formulario validado correctamente.');
      } catch (error) {
        console.error('Error al procesar el formulario:', error);
        message.error(getRequestErrorMessage(error, 'Hubo un error al procesar el formulario.'));
      } finally {
      }
    },
  });

  const loadSelectData = async (initialStateId?: number | null) => {
    setIsLoading(true);
    try {
      const [estadosResponse, formacionesResponse] = await Promise.all([
        get(estados),
        get(formaciones),
      ]);
      const estadosData = (estadosResponse?.data ?? estadosResponse ?? []) as GeoEstados[];
      const formacionesData = formacionesResponse?.data ?? formacionesResponse ?? [];

      setEstadosOptions(
        estadosData.map((estado) => ({
          value: estado.id,
          label: estado.estado ?? '',
        }))
      );

      setFormacionesOptions(
        formacionesData.map((formacion: TrainingCourses) => ({
          value: formacion.shortname,
          label: formacion.shortname,
        }))
      );

      setAllFormaciones(
        formacionesData.map((formacion: TrainingCourses) => ({
          shortname: formacion.shortname,
          nombre: formacion.nombre,
          tipo_formacion: formacion.tipo_formacion,
        }))
      );

      if (initialStateId !== null && initialStateId !== undefined) {
        await getCFSByStateId(initialStateId);
      }
    } catch (error) {
      console.error('Error cargando opciones del formulario:', error);
      message.error('No se pudieron cargar los datos de selección.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCFSByStateId = async (estadoId: number | null) => {
    const response = await get(`${cfs}/state/${estadoId}`);
    const cfsData = response?.data ?? [];
    setCfsOptions(
      cfsData.map((item: { id: number; nombre: string }) => ({
        value: item.id,
        label: item.nombre,
      }))
    );
  };

  const getEmployerEntities = async (estadoId: number | null) => {
    try {
      const response = await get(`${employerEntities}/state/${estadoId}`);
      const entitiesData = response?.data ?? [];
      setEmployerOptions(
        entitiesData.map((item: EmployersData) => ({
          value: item.id,
          label: item.razonSocial,
        }))
      );
    } catch (error) {
      console.error('Error cargando entidades de trabajo:', error);
    }
  };

  const handleValidationPreimpress = async (value: string) => {
    if (isEdit) {
      return;
    }

    if (!value.trim()) {
      return;
    }

    try {
      const response = await get(`${preimpresos}/${value}`);
      const isValid = response?.data?.data?.isValid ?? response?.data?.isValid ?? false;

      if (isValid) {
        const currentTouched =
          typeof formik.touched === 'object' && formik.touched !== null ? formik.touched : {};
        formik.setTouched({ ...currentTouched, preimpreso: true }, false);
        formik.setFieldError('preimpreso', 'El preimpreso no es válido o ya existe');
        return;
      }

      formik.setFieldError('preimpreso', undefined);
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ?? (error as { message?: string })?.message;
      const isAvailablePreimpreso =
        errorMessage?.toLowerCase().includes('recurso no encontrado') ||
        errorMessage?.toLowerCase().includes('preimpreso not found') ||
        false;

      if (isAvailablePreimpreso) {
        formik.setFieldError('preimpreso', undefined);
        return;
      }

      console.log('Error validando el preimpreso:', error);
    }
  };

  const handleSubmit = async () => {
    console.log(formik.errors);
    formik.handleSubmit();
  };

  useEffect(() => {
    if (data?.preimpreso_id) {
      setPreimpress(data.preimpreso_id);
    }
    const initialForm = getInitialForm(data);
    setDataForm(initialForm);
    loadSelectData(initialForm.id_estado);
  }, [data]);

  // Sincronizar el nombre de la formación al editar
  useEffect(() => {
    if (data?.shortname && allformaciones.length > 0) {
      const found = allformaciones.find((form) => form.shortname === data.shortname);
      setFormationName(found?.nombre ?? '');
    }
  }, [data?.shortname, allformaciones]);

  return (
    <>
      {isLoading && <Spinner />}
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 sm:px-6 sm:pt-6 dark:border-gray-800">
        <div className="mb-2 flex flex-col gap-5 sm:flex-row sm:justify-between">
          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Carga de data de la formación ejecutada.
            </h3>
          </div>
        </div>
        <div className="custom-scrollbar max-w-full overflow-x-auto">
          <div className="min-w-full">
            <form>
              <div className="my-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="md:col-span-1">
                  <label className="mb-1 block text-sm font-medium" htmlFor="shortname">
                    Código Maestra
                  </label>
                  <Select
                    placeholder="Ej. PPL.7111.0493"
                    options={formacionesOptions}
                    value={formik.values.shortname ?? undefined}
                    onBlur={() => formik.setFieldTouched('shortname', true)}
                    onChange={(value) => {
                      if (
                        allformaciones
                          .find((form) => form.shortname === value)
                          ?.tipo_formacion?.toString() === '17'
                      ) {
                        console.log(
                          allformaciones.find((form) => form.shortname === value)?.tipo_formacion
                        );
                        setEnableEmployer(false);
                      } else {
                        formik.setFieldValue('entidad_trabajo_id', null);
                        setEnableEmployer(true);
                      }

                      setFormationName(
                        allformaciones.find((form) => form.shortname === value)?.nombre ?? ''
                      );
                      formik.setFieldValue('shortname', value);
                    }}
                    status={
                      formik.touched.shortname && formik.errors.shortname ? 'error' : undefined
                    }
                    className="w-full"
                    showSearch={{
                      filterOption: (input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                    }}
                  />
                  {formik.touched.shortname && formik.errors.shortname && (
                    <div className="mt-1 text-xs text-red-500">{formik.errors.shortname}</div>
                  )}
                </div>
                <div className="md:col-span-3">
                  <label className="mb-1 block text-sm font-medium" htmlFor="id_ambito">
                    Formación
                  </label>
                  <Input
                    placeholder="Ej. Formación en Prevención de Riesgos Laborales"
                    value={formationName}
                    className="w-full"
                    variant="underlined"
                    disabled
                  />
                </div>
              </div>

              <div className="my-4 grid grid-cols-1 gap-4 md:grid-cols-5">
                <div className="md:col-span-1">
                  <label className="mb-1 block text-sm font-medium" htmlFor="preimpreso">
                    Preimpreso
                  </label>
                  <Input
                    placeholder="Ej. UCPMI25-26312"
                    value={formik.values.preimpreso}
                    onBlur={async () => {
                      formik.setFieldTouched('preimpreso', true);
                      await formik.validateField('preimpreso');
                      handleValidationPreimpress(formik.values.preimpreso);
                    }}
                    onChange={(e) =>
                      formik.setFieldValue('preimpreso', e.target.value.toUpperCase())
                    }
                    status={
                      formik.touched.preimpreso && formik.errors.preimpreso ? 'error' : undefined
                    }
                  />
                  {formik.touched.preimpreso && formik.errors.preimpreso && (
                    <div className="mt-1 text-xs text-red-500">{formik.errors.preimpreso}</div>
                  )}
                </div>

                <div className="md:col-span-1">
                  <label className="mb-1 block text-sm font-medium" htmlFor="inicio">
                    Fecha de Inicio
                  </label>
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Seleccionar fecha"
                    onBlur={() => formik.setFieldTouched('fecha_inicio', true)}
                    onChange={(_, dateString) => formik.setFieldValue('fecha_inicio', dateString)}
                    className="w-full"
                    defaultValue={formik.values.fecha_inicio}
                    status={
                      formik.touched.fecha_inicio && formik.errors.fecha_inicio
                        ? 'error'
                        : undefined
                    }
                  />
                  {formik.touched.fecha_inicio && formik.errors.fecha_inicio && (
                    <div className="mt-1 text-xs text-red-500">{formik.errors.fecha_inicio}</div>
                  )}
                </div>

                <div className="md:col-span-1">
                  <label className="mb-1 block text-sm font-medium" htmlFor="cierre">
                    Fecha de Cierre
                  </label>
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Seleccionar fecha"
                    onBlur={() => formik.setFieldTouched('fecha_fin', true)}
                    onChange={(_, dateString) => formik.setFieldValue('fecha_fin', dateString)}
                    className="w-full"
                    status={
                      formik.touched.fecha_fin && formik.errors.fecha_fin ? 'error' : undefined
                    }
                    defaultValue={formik.values.fecha_fin}
                  />
                  {formik.touched.fecha_fin && formik.errors.fecha_fin && (
                    <div className="mt-1 text-xs text-red-500">{formik.errors.fecha_fin}</div>
                  )}
                </div>

                <div className="md:col-span-1">
                  <label className="mb-1 block text-sm font-medium" htmlFor="preimpreso">
                    Hoja
                  </label>
                  <Input
                    placeholder="Ej. 001"
                    value={formik.values.hoja}
                    onBlur={async () => {
                      formik.setFieldTouched('hoja', true);
                      await formik.validateField('hoja');
                      handleValidationPreimpress(formik.values.hoja);
                    }}
                    onChange={(e) =>
                      formik.setFieldValue('hoja', e.target.value.toUpperCase())
                    }
                    status={
                      formik.touched.hoja && formik.errors.hoja ? 'error' : undefined
                    }
                  />
                  {formik.touched.hoja && formik.errors.hoja && (
                    <div className="mt-1 text-xs text-red-500">{formik.errors.hoja}</div>
                  )}
                </div>

                <div className="md:col-span-1">
                  <label className="mb-1 block text-sm font-medium" htmlFor="libro">
                    Libro
                  </label>
                  <Input
                    placeholder="Ej. 2026"
                    value={formik.values.libro}
                    onBlur={async () => {
                      formik.setFieldTouched('libro', true);
                      await formik.validateField('libro');
                      handleValidationPreimpress(formik.values.libro);
                    }}
                    onChange={(e) =>
                      formik.setFieldValue('libro', e.target.value.toUpperCase())
                    }
                    status={
                      formik.touched.libro && formik.errors.libro ? 'error' : undefined
                    }
                  />
                  {formik.touched.libro && formik.errors.libro && (
                    <div className="mt-1 text-xs text-red-500">{formik.errors.libro}</div>
                  )}
                </div>
              </div>

              <div className="my-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="id_estado">
                    Estado
                  </label>
                  <Select
                    placeholder="Seleccionar estado"
                    options={estadosOptions}
                    value={formik.values.id_estado ?? undefined}
                    onBlur={() => formik.setFieldTouched('id_estado', true)}
                    onChange={async (value) => {
                      formik.setFieldValue('id_estado', value);
                      formik.setFieldValue('id_cfs', null);
                      getCFSByStateId(value);
                      getEmployerEntities(value);
                    }}
                    status={
                      formik.touched.id_estado && formik.errors.id_estado ? 'error' : undefined
                    }
                    className="w-full"
                  />
                  {formik.touched.id_estado && formik.errors.id_estado && (
                    <div className="mt-1 text-xs text-red-500">{formik.errors.id_estado}</div>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="id_cfs">
                    CFS
                  </label>
                  <Select
                    placeholder="Seleccionar CFS"
                    options={cfsOptions}
                    value={formik.values.id_cfs ?? undefined}
                    onBlur={() => formik.setFieldTouched('id_cfs', true)}
                    onChange={(value) => formik.setFieldValue('id_cfs', value)}
                    status={formik.touched.id_cfs && formik.errors.id_cfs ? 'error' : undefined}
                    className="w-full"
                  />
                  {formik.touched.id_cfs && formik.errors.id_cfs && (
                    <div className="mt-1 text-xs text-red-500">{formik.errors.id_cfs}</div>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="entidad_trabajo_id">
                    Entidad de Trabajo
                  </label>
                  <Select
                    placeholder="Seleccionar Entidad de Trabajo"
                    options={employerOptions}
                    showSearch={{
                      filterOption: (input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                    }}
                    value={formik.values.entidad_trabajo_id ?? undefined}
                    onBlur={() => formik.setFieldTouched('entidad_trabajo_id', true)}
                    onChange={(value) => formik.setFieldValue('entidad_trabajo_id', value)}
                    status={
                      formik.touched.entidad_trabajo_id && formik.errors.entidad_trabajo_id
                        ? 'error'
                        : undefined
                    }
                    className="w-full"
                    disabled={enableEmployer}
                  />
                  {formik.touched.entidad_trabajo_id && formik.errors.entidad_trabajo_id && (
                    <div className="mt-1 text-xs text-red-500">
                      {formik.errors.entidad_trabajo_id}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-10 flex justify-end gap-2">
                <Button color="volcano" variant="solid" onClick={action}>
                  Cancelar
                </Button>
                {!isEdit && (
                  <Button color="purple" variant="solid" onClick={handleSubmit}>
                    Registrar
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      {isEdit && (
        <div className="mt-2 rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <UploadStudent data={preimpress} preimpress={data.preimpreso} />
        </div>
      )}
    </>
  );
};

export default BulkUpload;
