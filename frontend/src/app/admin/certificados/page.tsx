'use client';
import React, { useState } from 'react';
import Datatable from '@/components/tables/DataTable/Datatable';
import { get } from '@/Services/HttpRequest';
import { getCertificatesByPreimpress } from '@/Services/EndPoints';
import type { TableProps } from 'antd';
import { Input } from 'antd';

const Certificados = () => {
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(false);

  interface Certificate {
    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    modalidad: string;
    idCertificate: string;
    pre_comentario: string;
    svg_cara_a: string;
    svg_cara_b: string;
    is_vigente: boolean;
  }

  const columns: TableProps<Certificate>['columns'] = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      render: (_text, record, index) => <span>{index + 1}</span>,
    },
    {
      title: 'Cedula',
      dataIndex: 'cedula',
      key: 'cedula',
    },
    {
      width: '30%',
      title: 'Participantes',
      dataIndex: 'nombres',
      key: 'nombres',
      render: (_text, record) => (
        <span>
          {record?.nombres} {record?.apellidos}
        </span>
      ),
    },
    {
      width: '35%',
      title: 'Certificado',
      dataIndex: 'idCertificate',
      key: 'idCertificate',
      render: (_text, record) => <span>{record?.idCertificate}</span>,
    },
    {
      title: 'Acciones',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
    },
  ];

  const handleCertificates = async (preimpress: string) => {
    try {
        setLoading(true);
        const response = await get(getCertificatesByPreimpress(preimpress));
        setDataSources(response.data);
        setLoading(false);
    } catch (error) {
        console.error(error);
        setDataSources([]);
    } finally {
        setLoading(false);
    }

  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:justify-between">
          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Certificados por Formación
            </h3>
            <p className="text-theme-sm mt-1 text-gray-500 dark:text-gray-400">
              Presentación de certificados por formación, descarga masiva
            </p>
          </div>
        </div>
        <div className="custom-scrollbar max-w-full overflow-x-auto">
          <div className="min-w-[1000px] xl:min-w-full">
            <Datatable
              title={`Lista de Participantes con Certificados`}
              columns={columns}
              data={dataSources}
              loading={loading}
              isSearch={false}
              startContent={
                <>
                  <Input.Search
                    placeholder="Preimpreso"
                    size="large"
                    onSearch={handleCertificates}
                  />
                </>
              }
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Certificados;
