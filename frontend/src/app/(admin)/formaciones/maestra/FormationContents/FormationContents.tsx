'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { get, remove } from '@/Services/HttpRequest';
import { contenidosFormaciones } from '@/Services/EndPoints';
import { Button, notification } from 'antd';

import { NotificationType } from '@/interface/NotificationInterface';
import type { TrainingCoursesContent } from '@/interface/FormationsInterfaces';

import Datatable from '@/components/tables/DataTable/Datatable';
import type { TableProps } from 'antd';

import { RiMenuAddLine } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';
import { BsTrash3 } from 'react-icons/bs';

import FormFormationContent from './FormFormationContent';

const FormationContents = ({ shortname }: { shortname: string }) => {
  const [api, contextHolder] = notification.useNotification();

  const [loading, setLoading] = useState(false);
  const [dataSources, setDataSources] = useState<TrainingCoursesContent[]>([]);
  const [dataUpdate, setDataUpdate] = useState<TrainingCoursesContent | null>(null);
  const [openFormFormationContent, setOpenFormFormationContent] = useState(false);
  const [shortNameCurso, setShortNameCurso] = useState('');

  const columns: TableProps<TrainingCoursesContent>['columns'] = [
    { title: '#', align: 'center', width: '5%', dataIndex: 'id', key: 'id' },
    { title: 'Código', width: '20%', dataIndex: 'shortname_curso', key: 'shortname_curso' },
    { title: 'Contenido', width: '50%', dataIndex: 'contenido', key: 'contenido' },
    { title: 'Horas', width: '15%', dataIndex: 'horas', key: 'horas', align: 'center' },
    {
      title: 'Acciones',
      width: '10%',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (_: unknown, record: TrainingCoursesContent) => {
        return (
          <>
            <div className="flex items-center justify-center gap-4">
              <TbEdit
                className="cursor-pointer text-2xl"
                onClick={() => handleEdit(record)}
                title="Editar"
              />
              <BsTrash3
                className="cursor-pointer text-2xl"
                onClick={() => handleRemove(record.id)}
                title="Eliminar"
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

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await get(`${contenidosFormaciones}/${shortname}`);
      setDataSources(response.data);
    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [shortname]);

  const handleAdd = (value: string) => {
    setDataUpdate(null);
    setShortNameCurso(value);
    setOpenFormFormationContent(true);
  };

  const handleEdit = (values: TrainingCoursesContent) => {
    setDataUpdate(values);
    setShortNameCurso(values.shortname_curso);
    setOpenFormFormationContent(true);
  };

  const handleClose = () => {
    setDataUpdate(null);
    setOpenFormFormationContent(false);
    loadData();
  };

  const handleRemove = async (id: number) => {
    try {
      await remove(`${contenidosFormaciones}/${id}`);
      openNotificationWithIcon(
        'success',
        'Contenido eliminado',
        'El contenido del curso ha sido eliminado exitosamente.'
      );
      loadData();
    } catch (error) {
      console.error('Error deleting content:', error);
      openNotificationWithIcon(
        'error',
        'Error al eliminar',
        'No se pudo eliminar el contenido del curso.'
      );
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <>
      {contextHolder}
      <Datatable<TrainingCoursesContent>
        columns={columns}
        data={dataSources}
        size="small"
        loading={loading}
        isSearch={false}
        endContent={
          <div className="flex items-center gap-2">
            <Button
              color="green"
              variant="outlined"
              size="large"
              onClick={() => handleAdd(shortname)}
            >
              Agregar
              <RiMenuAddLine className="ml-2 text-2xl" />
            </Button>
          </div>
        }
      />
      {openFormFormationContent && (
        <FormFormationContent
          data={dataUpdate}
          shortname={shortNameCurso}
          isOpen={openFormFormationContent}
          action={handleClose}
          notify={openNotificationWithIcon}
        />
      )}
    </>
  );
};

export default FormationContents;
