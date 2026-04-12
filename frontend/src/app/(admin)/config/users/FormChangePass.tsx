import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { patch } from '@/Services/HttpRequest';
import { users } from '@/Services/EndPoints';

import { NotificationType } from '@/interface/NotificationInterface';

import { Input, Button } from 'antd';
import Modals from '@/components/Modals/Modals';

const FormChangePass = ({
  data,
  isOpen,
  action,
  notify,
}: {
  data: { id: number };
  isOpen: boolean;
  action: () => void;
  notify: (type: NotificationType, title: string, description: string) => void;
}) => {
  const getInitialForm = () => ({
    password: '',
    confirmPassword: '',
  });

  const Schema = Yup.object().shape({
    password: Yup.string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .required('La contraseña es requerida'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Las contraseñas deben coincidir')
      .required('La confirmación de contraseña es requerida'),
  });

  const formik = useFormik({
    initialValues: getInitialForm(),
    validationSchema: Schema,
    onSubmit: async (values) => {
      try {
        await patch(`${users}/change-pass/${data.id}`, JSON.stringify(values));
        notify('success', 'Éxito', 'La contraseña ha sido cambiada exitosamente');
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

  return (
    <>
      <Modals
        title="Cambiar Contraseña"
        isModalOpen={isOpen}
        handleCancel={action}
        width={400}
        footer={null}
      >
        <form onSubmit={formik.handleSubmit} className="space-y-4 px-3">
          <div className="mt-4 flex flex-row gap-4">
            <div className="w-full">
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
          </div>
          <div className="mt-4 flex flex-row gap-4">
            <div className="w-full">
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
          <div className="mt-10 flex justify-end gap-2">
            <Button size="large" color="volcano" variant="solid" onClick={() => action()}>
              Cancelar
            </Button>
            <Button size="large" color="purple" variant="solid" onClick={handleSubmit}>
              Guardar
            </Button>
          </div>
        </form>
      </Modals>
    </>
  );
};

export default FormChangePass;
