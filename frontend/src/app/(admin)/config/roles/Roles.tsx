'use client';
import React, { useState, useEffect } from 'react';
import { get } from '@/Services/HttpRequest';
import { roles } from '@/Services/EndPoints';
import { Button, notification } from 'antd';

import type { Roles } from '@/interface/RolesInterfaces';
import { NotificationType } from '@/interface/NotificationInterface';

import Datatable from '@/components/tables/DataTable/Datatable';
import type { TableProps } from 'antd';

import { RiMenuAddLine } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';
import FormRoles from './FormRoles';

const Roles = () => {
  const [api, contextHolder] = notification.useNotification();
  //Data to show in table.
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Roles[]>([]);
  const [dataUpdate, setDataUpdate] = useState<Roles | null>(null);
  const [openFormRoles, setOpenFormRoles] = useState(false);

  const columns: TableProps<Roles>['columns'] = [
    { title: '#', align: 'center', width: '5%', dataIndex: 'id', key: 'id' },
    { title: 'Nombre', width: '30%', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
    {
      title: 'Acciones',
      width: '5%',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (_: unknown, record: Roles) => {
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
      const response = await get(roles);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setDataUpdate(null);
    setOpenFormRoles(true);
  };

  const handleEdit = (values: Roles) => {
    setDataUpdate(values);
    setOpenFormRoles(true);
  };

  const handleCloseForm = () => {
    setDataUpdate(null);
    setOpenFormRoles(false);
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return <>
  {contextHolder}
      <Datatable<Roles>
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
        {openFormRoles && (<FormRoles isOpen={openFormRoles} action={handleCloseForm} data={dataUpdate} notify={openNotificationWithIcon} />)}
  </>;
};

export default Roles;
