'use client';
import React, { useEffect, useState } from 'react';
import Datatable from '@/components/tables/DataTable/Datatable';
import { get } from '@/Services/HttpRequest';
import { getCurrentCertificates } from '@/Services/EndPoints';
import { Button } from 'antd';
import type { TableProps } from 'antd';

const Page = () => {
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(false);

  interface Certificate {
    id: number;
    modalidad: string;
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
    },
    {
      title: 'Modalidad',
      dataIndex: 'modalidad',
      key: 'modalidad',
    },
    {
      title: 'Pre Comentario',
      dataIndex: 'pre_coment',
      key: 'pre_coment',
    },
    {
      title: 'Cara Frontal',
      dataIndex: 'svg_cara_a',
      key: 'svg_cara_a',
      render: (_text, record) => (
        <div
          style={{ width: 60, height: 60, overflow: 'hidden' }}
          dangerouslySetInnerHTML={{ __html: record.svg_cara_a }}
        />
      ),
    },
    {
      title: 'Cara Lateral',
      dataIndex: 'svg_cara_b',
      key: 'svg_cara_b',
      render: (_text, record) => (
        <div
          style={{ width: 60, height: 60, overflow: 'hidden' }}
          dangerouslySetInnerHTML={{ __html: record.svg_cara_b }}
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_vigente',
      key: 'is_vigente',
      render: (_text, record) => <span>{record.is_vigente ? 'Vigente' : 'No Vigente'}</span>,
    },
    {
      title: 'Acciones',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
    },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await get(getCurrentCertificates);
      const data = response.data || [];
      setDataSources(data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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
              Certificados Vigentes (Formatos)
            </h3>
            <p className="text-theme-sm mt-1 text-gray-500 dark:text-gray-400">
              Creación y modificación de los pre-comentarios y fondos de los certificados
            </p>
          </div>
        </div>
        <div className="custom-scrollbar max-w-full overflow-x-auto">
          <div className="min-w-[1000px] xl:min-w-full">
            <Datatable
              title="Lista de Certificados Vigentes (Formatos)"
              columns={columns}
              data={dataSources}
              loading={loading}
              startContent={
                <>
                  <Button color="pink" size="large" variant="solid">
                    Cargar
                  </Button>
                </>
              }
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
