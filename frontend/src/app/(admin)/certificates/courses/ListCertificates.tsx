'use client';
import React, { useState, useEffect } from 'react';
import { get } from '@/Services/HttpRequest';
import { certificatesByPreimpress, viewCertificate } from '@/Services/EndPoints';

import Datatable from '@/components/tables/DataTable/Datatable';
import { Button, type TableProps } from 'antd';

import { Certificate, CoursesCertificate } from '@/interface/CertificatesInterfaces';

import { TbArrowBackUpDouble, TbCertificate } from 'react-icons/tb';

const ListCertificates = ({ data, action }: { data: CoursesCertificate; action: () => void }) => {
  const [dataSources, setDataSources] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Tamaño de página predeterminado

  const columns: TableProps<Certificate>['columns'] = [
    {
      width: '5%',
      title: '#',
      dataIndex: 'certificateId',
      key: 'certificateId',
      align: 'center',
      render: (_text, _record, index) => (
        <span>{(currentPage - 1) * pageSize + index + 1}</span>
      ),
    },
    {
      width: '10%',
      title: 'Consecutivo',
      dataIndex: 'consecutivo',
      key: 'consecutivo',
      className: 'text-center',
      render: (_text, record) => <span>{record?.consecutivo}</span>,
    },
    {
      width: '15%',
      title: 'Cédula',
      dataIndex: 'cedula',
      key: 'cedula',
      className: 'text-center',
      render: (_text, record) => (
        <span>
          {record?.nacionalidad ? `${record.nacionalidad}-` : ''}
          {record?.cedula}
        </span>
      ),
    },
    {
      title: 'Nombres y Apellidos',
      dataIndex: 'nombres',
      key: 'nombres',
      render: (_text, record) => (
        <span>
          {record?.nombres} {record?.apellidos}
        </span>
      ),
    },
    {
      width: '10%',
      title: 'Certificado',
      dataIndex: 'certificateId',
      key: 'certificateId',
      align: 'center',
      render: (_text, record: Certificate) => (
        <div className="flex cursor-pointer items-center justify-center gap-2">
          <TbCertificate
            className="text-2xl"
            onClick={() => handleViewCertificate(record.certificateId)}
          />
        </div>
      ),
    },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await get(certificatesByPreimpress(data.preimpreso));
      setDataSources(response.data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = (certificateId: string) => {
    try {
      const url = viewCertificate(certificateId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening certificate:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:justify-between">
          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Certificados de la formación: {data.curso} - Preimpreso: {data.preimpreso}
            </h3>
            <p className="text-theme-sm mt-1 text-gray-500 dark:text-gray-400">
              Presentación de certificados asociados a la formación seleccionada.
            </p>
          </div>
          <div>
            <Button
              type="primary"
              onClick={action}
              icon={<TbArrowBackUpDouble className="text-xl" />}
            >
              Volver
            </Button>
          </div>
        </div>
        <div className="custom-scrollbar max-w-full overflow-x-auto">
          <div className="min-w-[1000px] xl:min-w-full">
            <Datatable<Certificate>
              columns={columns}
              data={dataSources}
              loading={loading}
              pagination={{
                onChange: (page: number, size: number) => {
                  setCurrentPage(page);
                  setPageSize(size);
                },
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ListCertificates;
