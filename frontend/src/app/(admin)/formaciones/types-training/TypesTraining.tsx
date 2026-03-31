'use client';
import React, { useState, useEffect } from 'react';
import { get } from '@/Services/HttpRequest';
import { tiposFormaciones } from '@/Services/EndPoints';
import { Button, notification } from 'antd';

import type { TypesTraining } from '@/interface/TypesTrainingInterfaces';
import { NotificationType } from '@/interface/NotificationInterface';

import Datatable from '@/components/tables/DataTable/Datatable';
import type { TableProps } from 'antd';

import { RiMenuAddLine } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';
import FormTypesTraining from './FormTypesTraining';

const TypesTraining = () => {
  const [api, contextHolder] = notification.useNotification();

  const [loading, setLoading] = useState(false);
  //Data to show in table.
  const [data, setData] = useState<TypesTraining[]>([]);
  const [dataUpdate, setDataUpdate] = useState<TypesTraining | null>(null);
  const [openFormTypesTraining, setOpenFormTypesTraining] = useState(false);

  const columns: TableProps<TypesTraining>['columns'] = [
    { title: '#', align: 'center', width: '5%', dataIndex: 'id', key: 'id' },
    { title: 'Nombre', width: '30%', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
    {
      title: 'Aciones',
      width: '5%',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (_: unknown, record: TypesTraining) => {
        return (
          <>
            <button
              className="btn btn-info btn-sm ms-2"
              onClick={() => handleEdit(record)}
              title="Editar"
            >
              <TbEdit className="text-2xl" />
            </button>
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
      const response = await get(tiposFormaciones);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setDataUpdate(null);
    setOpenFormTypesTraining(true);
  };

  const handleEdit = (values: TypesTraining) => {
    setDataUpdate(values);
    setOpenFormTypesTraining(true);
  };

  const handleCloseForm = () => {
    setOpenFormTypesTraining(false);
    setDataUpdate(null);
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      {contextHolder}
      <Datatable<TypesTraining>
        columns={columns}
        data={data}
        loading={loading}
        endContent={
          <div className="flex items-center gap-2">
            <Button color="green" variant="outlined" size="large" onClick={handleAdd}>
              Agregar
              <RiMenuAddLine className="ml-2 text-2xl" />
            </Button>
          </div>
        }
      />
      {openFormTypesTraining && (
        <FormTypesTraining
          data={dataUpdate}
          isOpen={openFormTypesTraining}
          action={handleCloseForm}
          notify={openNotificationWithIcon}
        />
      )}
    </>
  );
};

export default TypesTraining;
