'use client';
import React, { useState } from 'react';
import moment from 'moment';
import { getPersonById, getCertificateById, viewCertificate } from '@/Services/EndPoints';
import { get } from '@/Services/HttpRequest';
import { Input, Button, notification } from 'antd';

import Datatable from '@/components/tables/DataTable/Datatable';
import type { TableProps } from 'antd';

import { Certificate } from '@/interface/CertificatesInterfaces';
import type { UsersInterfaces } from '@/interface/UsersInterfaces';
import { NotificationType } from '@/interface/NotificationInterface';

import { TbArrowBackUpDouble, TbPencil, TbCertificate } from 'react-icons/tb';
import FormStudent from './FormStudent';

const Students = () => {
  const [api, contextHolder] = notification.useNotification();
  const [openFormStudent, setOpenFormStudent] = useState(false);
  const [dataSource, setDataSource] = useState<UsersInterfaces | null>(null);
  const [listOfCertificate, setListOfCertificate] = useState<Certificate[]>([]);

  const columns: TableProps<Certificate>['columns'] = [
    { title: '#', align: 'center', width: '5%', dataIndex: 'id', key: 'id' },
    { title: 'Codigo', width: '15%', dataIndex: 'shortname', key: 'shortname' },
    { title: 'Formacion', dataIndex: 'course', key: 'course' },
    { title: 'Preimpreso', width: '15%', dataIndex: 'preimpreso', key: 'preimpreso' },
    { title: 'Estado', width: '10%', dataIndex: 'estado', key: 'estado' },
    {
      title: 'Aciones',
      width: '5%',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (_: unknown, record: Certificate) => {
        return (
          <div className="flex cursor-pointer items-center justify-center gap-2">
            <TbCertificate
              className="text-2xl"
              onClick={() => handleViewCertificate(record.certificateWebId)}
            />
          </div>
        );
      },
    },
  ];

  const openNotificationWithIcon = (type: NotificationType, title: string, description: string) => {
    api[type]({
      title,
      description,
      showProgress: true,
    });
  };

  const handleFindPerson = async (id_person: string) => {
    try {
      const getPerson = getPersonById(id_person);
      const getCertificate = getCertificateById(id_person);
      const res = await get(getPerson);

      if (Object.keys(res).length > 0) {
        setDataSource(res.data);
        const certificates = await get(getCertificate);
        if (Object.keys(certificates).length > 0) {
          setListOfCertificate(certificates.data);
        }
      } else {
        setDataSource(null);
      }
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object' &&
        (error as { response?: { data?: { code?: string } } }).response?.data?.code === 'PNF001'
      ) {
        setDataSource(null);
      }

      setListOfCertificate([]);
    }
  };

  const handleAdd = () => {
    setDataSource(null);
    setOpenFormStudent(true);
  };

  const handleEdit = (values: UsersInterfaces) => {
    setDataSource(values);
    setOpenFormStudent(true);
  };

  const handleActionModal = async () => {
    setOpenFormStudent(false);
    handleFindPerson(dataSource?.cedula || '');
  };

  const handleBack = () => {
    setDataSource(null);
    setListOfCertificate([]);
  };

  const handleViewCertificate = async (certificateWebId: string) => {
    try {
      const url = viewCertificate(certificateWebId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening certificate:', error);
    }
  };

  return (
    <>
      {contextHolder}
      {dataSource ? (
        <>
          <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                  {dataSource.nombres} {dataSource.apellidos}
                </h4>
                <div className="mt-1 flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:items-center sm:gap-3 dark:text-gray-400">
                  <span>{`${dataSource.nac}-${dataSource.cedula || ''}`}</span>
                  <span className="hidden h-3.5 w-px bg-gray-300 sm:inline-block dark:bg-gray-700" />
                  <span>{dataSource.correo || ''}</span>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 lg:w-auto">
                <Button
                  onClick={handleBack}
                  size="large"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:min-w-[130px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  <TbArrowBackUpDouble className="text-lg" />
                  Regresar
                </Button>

                <Button
                  onClick={() => handleEdit(dataSource)}
                  size="large"
                  className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 lg:min-w-[130px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                >
                  <TbPencil className="text-lg" />
                  Editar
                </Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Fecha de Nacimiento
                </p>
                <p className="text-center text-sm font-medium text-gray-800 dark:text-white/90">
                  {moment(dataSource.fechaNace).format('DD/MM/YYYY') || ''}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Sexo</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {dataSource.sexo === 'M' ? 'Masculino' : 'Femenino'}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Teléfono
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {dataSource.telefono || ''}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  N° de Formciones
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 text-center">
                  {listOfCertificate.length || 0}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Fecha de Registro
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 text-center">
                  {moment(dataSource.createdAt).format('DD/MM/YYYY') || ''}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
            <Datatable<Certificate> columns={columns} data={listOfCertificate} isSearch={false} />
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full lg:max-w-[20%]">
              <label
                htmlFor="search-cedula"
                className="mb-2 block font-medium text-gray-700 dark:text-gray-300"
              >
                Cédula:
              </label>
              <Input.Search
                id="search-cedula"
                size="large"
                placeholder="Ej. 12345678"
                onSearch={handleFindPerson}
              />
            </div>

            <div className="flex justify-end">
              <Button size="large" className="min-w-32" onClick={handleAdd}>
                Agregar
              </Button>
            </div>
          </div>
        </div>
      )}
      {openFormStudent && (
        <FormStudent
          isOpen={openFormStudent}
          action={() => handleActionModal()}
          data={dataSource}
          notify={openNotificationWithIcon}
        />
      )}
    </>
  );
};

export default Students;
