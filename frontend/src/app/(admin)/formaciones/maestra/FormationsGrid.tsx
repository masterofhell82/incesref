'use client';
import React, { useState, useEffect } from 'react';
import { get } from '@/Services/HttpRequest';
import { formaciones } from '@/Services/EndPoints';
import { Button, notification } from 'antd';

import type { TrainingCourses } from '@/interface/FormationsInterfaces';
import { NotificationType } from '@/interface/NotificationInterface';

import Datatable from '@/components/tables/DataTable/Datatable';
import type { TableProps } from 'antd';

import { RiMenuAddLine } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';
import { LuListTree } from 'react-icons/lu';

import ContentsCourses from './ContentsCourses';
import FormFormationsGrid from './FormFormationsGrid';

const FormationsGrid = () => {
  const [api, contextHolder] = notification.useNotification();

  //Data to show in table.
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrainingCourses[]>([]);
  const [dataUpdate, setDataUpdate] = useState<TrainingCourses | null>(null);
  const [showDataTable, setShowDataTable] = useState(true);
  const [openContent, setOpenContent] = useState(false);
  const [openFormFomationsGrid, setOpenFormFomationsGrid] = useState(false);

  const columns: TableProps<TrainingCourses>['columns'] = [
    { title: '#', align: 'center', width: '5%', dataIndex: 'id', key: 'id' },
    { title: 'Código Maestra', width: '15%', dataIndex: 'shortname', key: 'shortname' },
    { title: 'Formación', width: '30%', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Tipo de Formación', dataIndex: 'tipo', key: 'tipo', width: '20%' },
    { title: 'Programa', dataIndex: 'programa', key: 'programa', width: '15%' },
    {
      title: 'Acciones',
      width: '10%',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (_: unknown, record: TrainingCourses) => {
        return (
          <>
            <div className="flex items-center justify-center gap-4">
              <LuListTree
                className={`cursor-pointer text-2xl ${record.is_contenido ? 'text-green-500' : 'text-gray-400'}`}
                onClick={() => handleContent(record)}
                title="Contenido"
              />
              <TbEdit
                className="cursor-pointer text-2xl"
                onClick={() => handleEdit(record)}
                title="Editar"
              />
            </div>
          </>
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

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await get(formaciones);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setDataUpdate(null);
    setOpenFormFomationsGrid(true);
    setShowDataTable(false);
  };

  const handleEdit = (values: TrainingCourses) => {
    setDataUpdate(values);
    setOpenFormFomationsGrid(true);
    setShowDataTable(false);
  };

  const handleContent = (values: TrainingCourses) => {
    setDataUpdate(values);
    setOpenContent(true);
  };

  const handleClose = () => {
    setDataUpdate(null);
    setOpenFormFomationsGrid(false);
    setShowDataTable(true);
    loadData();
  };

  const handleCancelFormFormations = () => {
    setDataUpdate(null);
    setOpenFormFomationsGrid(false);
    setShowDataTable(true);
  }

  const handleCloseContent = () => {
    setDataUpdate(null);
    setOpenContent(false);
    setShowDataTable(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      {contextHolder}

      {showDataTable && (
        <Datatable<TrainingCourses>
            columns={columns}
            data={data}
            size="small"
            loading={loading}
            endContent={
            <div className="flex items-center gap-2">
                <Button color="green" variant="outlined" size="large" onClick={handleAdd}>
                Agregar
                <RiMenuAddLine className="ml-2 text-2xl" />
                </Button>
            </div>
            }
            expandable={{
            expandedRowRender: (record: TrainingCourses) => (
                <div className="grid grid-cols-1 gap-2 px-2 py-3">
                <div className="flex items-center gap-2">
                    <span className="shrink-0 self-center text-base font-bold text-purple-500">
                    Descripción:
                    </span>
                    <div className="text-dark flex gap-2 text-justify text-sm leading-none dark:text-white">
                    {record.descripcion || 'Sin descripción'}
                    </div>
                </div>
                </div>
            ),
            }}
        />
      )}

      {openFormFomationsGrid && (
        <FormFormationsGrid
          data={dataUpdate}
          action={handleClose}
          actionCancel={handleCancelFormFormations}
          notify={openNotificationWithIcon}
        />
      )}

      {openContent && (
        <ContentsCourses data={dataUpdate} isOpen={openContent} action={handleCloseContent} />
      )}
    </>
  );
};

export default FormationsGrid;
