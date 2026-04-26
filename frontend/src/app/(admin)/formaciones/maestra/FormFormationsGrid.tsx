import React, { useEffect, useState } from 'react';
import { formaciones, programas, tiposFormaciones } from '@/Services/EndPoints';
import { get, post, put } from '@/Services/HttpRequest';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import type { TrainingCourses } from '@/interface/FormationsInterfaces';
import { NotificationType } from '@/interface/NotificationInterface';

import { Input, Button, Select } from 'antd';
import { Option } from '@/interface/CoreInterfaces';
import FormationContents from './FormationContents/FormationContents';
const { TextArea } = Input;

const FormFormationsGrid = ({
  data,
  action,
  actionCancel,
  notify,
}: {
  data: TrainingCourses | null;
  action: () => void;
  actionCancel: () => void;
  notify: (type: NotificationType, title: string, description: string) => void;
}) => {
  const isEdit = !!data && Object.keys(data).length > 0;

  const getInitialForm = (source: TrainingCourses | null) => ({
    id: source?.id ?? 0,
    nombre: source?.nombre ?? '',
    shortname: source?.shortname ?? '',
    descripcion: source?.descripcion ?? '',
    programaId: source?.id_programa ?? null,
    tipoFormacionId: source?.tipo_formacion ?? null,
  });

  const [programOptions, setProgramOptions] = useState<Option[]>([]);
  const [typeTrainingOptions, setTypeTrainingOptions] = useState<Option[]>([]);

  const schema = Yup.object().shape({
    id: Yup.number().nullable(),
    nombre: Yup.string().trim().required('El nombre es requerido'),
    shortname: Yup.string().trim().required('El código es requerido'),
    descripcion: Yup.string().trim().required('La descripción es requerida'),
    programaId: Yup.number().nullable().required('El programa es requerido'),
    tipoFormacionId: Yup.number().nullable().required('El tipo de formación es requerido'),
  });

  const formik = useFormik({
    initialValues: getInitialForm(data),
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (values.id) {
          await put(`${formaciones}/${values.id}`, JSON.stringify(values));
          notify('success', 'Éxito', 'La formación ha sido actualizada exitosamente');
        } else {
          await post(formaciones, JSON.stringify(values));
          notify('success', 'Éxito', 'La formación ha sido registrada exitosamente');
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
    if(formik.values.shortname && formik.values.shortname.trim() !== '' && !isEdit) {
      const exists = await handleShortnameValidation(formik.values.shortname);
      if (exists) {
        notify('error', 'Error', 'El código ya existe. Por favor, elige otro.');
        return;
      }
    }
    console.log(formik.values);
    await formik.handleSubmit();
  };

  const fetchProgramOptions = async () => {
    try {
      const response = await get(programas);
      const options: Option[] = response.data.map((program: { id: number; nombre: string }) => ({
        value: program.id,
        label: program.nombre,
      }));
      setProgramOptions(options);
    } catch (error) {
      console.error('Error fetching program options:', error);
    }
  };

  const fetchTypeTrainingOptions = async () => {
    try {
      const response = await get(tiposFormaciones);
      const options: Option[] = response.data.map((type: { id: number; nombre: string }) => ({
        value: type.id,
        label: type.nombre,
      }));
      setTypeTrainingOptions(options);
    } catch (error) {
      console.error('Error fetching type training options:', error);
    }
  };

  const handleShortnameValidation = async (value: string) => {
    try {
      const response = await get(`${formaciones}/validate-shortname/${encodeURIComponent(value)}`);
      const exists = Boolean(response?.exists ?? response?.data?.exists);
      if (exists) {
        formik.setFieldError('shortname', 'El código ya existe. Por favor, elige otro.');
      }
      formik.setFieldTouched('shortname', true, false);
      return exists;
    } catch (error) {
      console.error('Error validating shortname:', error);
      formik.setFieldError('shortname', 'No se pudo validar el código. Intente nuevamente.');
      formik.setFieldTouched('shortname', true, false);
      return true;
    }
  };

  useEffect(() => {
    fetchProgramOptions();
    fetchTypeTrainingOptions();
  }, []);

  return (
    <>
      <form className="space-y-6">
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 border-b border-stone-200 pb-3 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              {isEdit ? 'Editar formación' : 'Registrar nueva formación'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Completa la información principal de la malla curricular.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="nombre">
                Nombre
              </label>
              <Input
                placeholder="Ej. TÉCNICAS DE SOLDADURA"
                value={formik.values.nombre}
                onBlur={formik.handleBlur}
                onChange={(e) => formik.setFieldValue('nombre', e.target.value.toUpperCase())}
                status={formik.touched.nombre && formik.errors.nombre ? 'error' : undefined}
              />
              {formik.touched.nombre && formik.errors.nombre && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.nombre}</div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="shortname">
                Código de maestra
              </label>
              <Input
                placeholder="Ej. PPL.0000.0011"
                value={formik.values.shortname}
                onBlur={(e) => handleShortnameValidation(e.target.value)}
                onChange={(e) => {
                  const nextValue = e.target.value.toUpperCase();
                  formik.setFieldValue('shortname', nextValue);
                }}
                status={formik.touched.shortname && formik.errors.shortname ? 'error' : undefined}
              />
              {formik.touched.shortname && formik.errors.shortname && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.shortname}</div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="programaId">
                Programa
              </label>
              <Select
                showSearch
                placeholder="Seleccione un programa"
                options={programOptions}
                value={formik.values.programaId ?? undefined}
                onBlur={() => formik.setFieldTouched('programaId', true)}
                onChange={(value) => formik.setFieldValue('programaId', value)}
                status={
                  formik.touched.programaId && formik.errors.programaId ? 'error' : undefined
                }
                className="w-full"
              />
              {formik.touched.programaId && formik.errors.programaId && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.programaId}</div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="tipo_formacion">
                Tipo de formación
              </label>
              <Select
                showSearch
                placeholder="Seleccione un tipo"
                options={typeTrainingOptions}
                value={formik.values.tipoFormacionId ?? undefined}
                onBlur={() => formik.setFieldTouched('tipoFormacionId', true)}
                onChange={(value) => formik.setFieldValue('tipoFormacionId', value)}
                status={
                  formik.touched.tipoFormacionId && formik.errors.tipoFormacionId
                    ? 'error'
                    : undefined
                }
                className="w-full"
              />
              {formik.touched.tipoFormacionId && formik.errors.tipoFormacionId && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.tipoFormacionId}</div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium" htmlFor="descripcion">
                Descripción
              </label>
              <TextArea
                rows={4}
                placeholder="Describe brevemente el alcance de la formación"
                value={formik.values.descripcion}
                onBlur={formik.handleBlur}
                onChange={(e) => formik.setFieldValue('descripcion', e.target.value.toUpperCase())}
                status={
                  formik.touched.descripcion && formik.errors.descripcion ? 'error' : undefined
                }
              />
              {formik.touched.descripcion && formik.errors.descripcion && (
                <div className="mt-1 text-xs text-red-500">{formik.errors.descripcion}</div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-stone-200 pt-4 dark:border-gray-700">
            <Button size="large" color="volcano" variant="solid" onClick={() => actionCancel()}>
              Cancelar
            </Button>
            <Button size="large" color="purple" variant="solid" onClick={handleSubmit}>
              {isEdit ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </div>
      </form>
      {isEdit && (
        <div className="mt-2 rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <FormationContents shortname={data.shortname} />
        </div>
      )}
    </>
  );
};

export default FormFormationsGrid;
