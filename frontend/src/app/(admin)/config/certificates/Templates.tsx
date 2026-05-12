'use client';
import React, { useEffect, useState } from 'react';
import Datatable from '@/components/tables/DataTable/Datatable';
import { get } from '@/Services/HttpRequest';
import { certificateTemplates } from '@/Services/EndPoints';
import { Image } from 'antd';
import type { TableProps } from 'antd';
import moment from 'moment';

const Templates = () => {
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(false);

  interface Certificate {
    id: number;
    modalidad: string;
    pre_comentario: string;
    svg_cara_a: string;
    svg_cara_b: string;
    is_vigente: boolean;
    created_at: string;
    updated_at: string;
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
      title: 'Frontal',
      dataIndex: 'svg_cara_a',
      key: 'svg_cara_a',
      className: 'text-center',
      render: (_text, record) => (
        <Image
          width={60}
          height={60}
          alt="cara frontal"
          src={`data:image/svg+xml;utf8,${encodeURIComponent(record.svg_cara_a)}`}
          preview={{
            mask: { blur: true },
          }}
        />
      ),
    },
    {
      title: 'Lateral',
      dataIndex: 'svg_cara_b',
      key: 'svg_cara_b',
      className: 'text-center',
      render: (_text, record) => (
        <Image
          width={60}
          height={60}
          alt="cara lateral"
          src={`data:image/svg+xml;utf8,${encodeURIComponent(record.svg_cara_b)}`}
          preview={{
            mask: { blur: true },
          }}
        />
      ),
    },
    {

        width: '10%',
      title: 'Fecha Emisión',
      dataIndex: 'is_vigente',
      key: 'is_vigente',
      className: 'text-end',
      render: (_text, record) => {
        return moment(record.created_at).format('DD/MM/YYYY')
      },
    },
    {
        width: '15%',
      title: 'Última Expedición',
      dataIndex: 'updated_at',
      key: 'updated_at',
      className: 'text-end',
      render: (_text, record) => {
        const fechaEmision = moment(record.created_at).format('YYYY-MM-DD');
        const fechaUltimaExpedicion = moment(record.updated_at).format('YYYY-MM-DD');

        return fechaEmision === fechaUltimaExpedicion
          ? 'Vigente'
          : moment(record.updated_at).format('DD/MM/YYYY');
      },
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
      const response = await get(certificateTemplates);
      const data = response.data || [];

      console.log(data);

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
      <Datatable<Certificate> columns={columns} size="small" data={dataSources} loading={loading} />
    </>
  );
};

export default Templates;
