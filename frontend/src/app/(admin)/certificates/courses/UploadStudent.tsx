'use client';
import React, { useState, useEffect } from 'react';
import { get } from '@/Services/HttpRequest';
import { certificatesByPreimpress } from '@/Services/EndPoints';
import moment from 'moment';

import Datatable from '@/components/tables/DataTable/Datatable';
import { Button, type TableProps } from 'antd';
import { CertifiedStudent } from '@/interface/CertificatesInterfaces';

import {
  PiCalendarBlankDuotone,
  PiDatabaseDuotone,
  PiDownloadSimpleDuotone,
  PiGenderIntersexDuotone,
  PiPhoneDuotone,
} from 'react-icons/pi';
import { RiMenuAddLine } from 'react-icons/ri';

/* data = preimpreso del curso, se necesita para traer los estudiantes que ya tienen certificado generado, esto con el fin de que el admin pueda revisar si hay estudiantes que no tienen certificado generado y así generarles el certificado correspondiente.
 */
const UploadStudent = ({ data, preimpress }: { data: number | null, preimpress: string }) => {
  const [dataSources, setDataSources] = useState<CertifiedStudent[]>([]);
  const [loading, setLoading] = useState(false);

  const handleDownloadCsv = () => {
    const link = document.createElement('a');
    link.href = '/documents/data_to_load.csv';
    link.download = `data_${preimpress}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: TableProps<CertifiedStudent>['columns'] = [
    {
      width: '5%',
      title: 'Consecutivo',
      dataIndex: 'consecutivo',
      key: 'consecutivo',
      align: 'center',
      render: (_text, record) => <span>{record.consecutivo}</span>,
    },
    {
      width: '15%',
      title: 'Cedula',
      dataIndex: 'cedula',
      key: 'cedula',
      render: (_text, record) => (
        <span>
          {record?.nacionalidad ? `${record.nacionalidad}-` : ''}
          {record?.cedula}
        </span>
      ),
    },
    {
      title: 'Nombre, Apellidos',
      dataIndex: 'apellidos',
      key: 'apellidos',
      render: (_text, record) => (
        <span>
          {record?.nombres}, {record?.apellidos}
        </span>
      ),
    },
    {
      title: 'Correo',
      dataIndex: 'correo',
      key: 'correo',
      render: (_text, record) => <span>{record.correo || 'No posee'}</span>,
    },
    {
      title: 'Título Asociado',
      dataIndex: 'tituloAsociado',
      key: 'tituloAsociado',
      render: (_text, record) => <span>{record.tituloAsociado || 'No posee'}</span>,
    },
  ];

  const loadData = async (preimpressId: number) => {
    setLoading(true);
    try {
      const response = await get(certificatesByPreimpress(preimpressId));
      setDataSources(response.data);
    } catch (error) {
      console.log('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data !== null) {
      loadData(data);
    }
  }, [data]);

  return (
    <div>
      <Datatable<CertifiedStudent>
        columns={columns}
        data={dataSources}
        loading={loading}
        size='small'
        rowKey="certificateId"
        endContent={
          <div className="flex items-center gap-2">
            <Button
              color="default"
              variant="outlined"
              size="large"
              onClick={handleDownloadCsv}
            >
              Descargar CSV
              <PiDownloadSimpleDuotone className="ml-2 text-2xl" />
            </Button>
            <Button
              color="blue"
              variant="outlined"
              size="large"
              onClick={() => alert('Funcionalidad de agregar agregar masivo no implementada')}
            >
              Masivo
              <PiDatabaseDuotone className="ml-2 text-2xl" />
            </Button>
            <Button
              color="green"
              variant="outlined"
              size="large"
              onClick={() => alert('Funcionalidad de agregar estudiante no implementada')}
            >
              Agregar
              <RiMenuAddLine className="ml-2 text-2xl" />
            </Button>
          </div>
        }
        expandable={{
          expandedRowRender: (record: CertifiedStudent) => (
            <div className="w-full grid grid-cols-4 gap-2 px-2 py-3">
              <div className="flex items-center gap-2">
                <PiGenderIntersexDuotone className="shrink-0 self-center text-base text-amber-500" />
                <div className="text-dark flex gap-2 text-sm leading-none dark:text-white">
                  <span className="inline-flex items-center text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Genero:
                  </span>
                  {record.genero}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PiCalendarBlankDuotone className="shrink-0 self-center text-base text-blue-500" />
                <div className="text-dark flex gap-2 text-sm leading-none dark:text-white">
                  <span className="inline-flex items-center text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Nacimiento:
                  </span>
                  {record.fechaNace ? moment(record.fechaNace).format('DD/MM/YYYY') : 'No posee'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PiPhoneDuotone className="shrink-0 self-center text-base text-green-500" />
                <div className="text-dark flex gap-2 text-sm leading-none dark:text-white">
                  <span className="inline-flex items-center text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Teléfono:
                  </span>
                  {record.telefono || 'No posee'}
                </div>
              </div>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default UploadStudent;
