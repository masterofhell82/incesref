'use client';
import React, { useState, useEffect } from 'react';
import { get } from '@/Services/HttpRequest';
import { scopes } from '@/Services/EndPoints';
import { Button, notification } from 'antd';

import { Scope } from '@/interface/ScopesInterfaces';
import { NotificationType } from '@/interface/NotificationInterface';

import Datatable from '@/components/tables/DataTable/Datatable';
import type { TableProps } from 'antd';

import { RiMenuAddLine } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';

import FormScope from './FormScope';

const Scopes = () => {
  const [api, contextHolder] = notification.useNotification();
  const [openFormScope, setOpenFormScope] = useState(false);
  const [loading, setLoading] = useState(false);
  //Data to show in table.
  const [data, setData] = useState<Scope[]>([]);
  const [dataUpdate, setDataUpdate] = useState<Scope | null>(null);
  const columns: TableProps<Scope>['columns'] = [
    { title: '#', align: 'center', width: '5%', dataIndex: 'id', key: 'id' },
    { title: 'Nombre', width: '20%', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
    { title: 'Shortname', align: 'center', dataIndex: 'shortname', key: 'shortname' },
    {
      title: 'Aciones',
      width: '5%',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (_: unknown, record: Scope) => {
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
      const response = await get(scopes);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setDataUpdate(null);
    setOpenFormScope(true);
  };

  const handleEdit = (values: Scope) => {
    setDataUpdate(values);
    setOpenFormScope(true);
  };

  const handleCloseForm = () => {
    setOpenFormScope(false);
    setDataUpdate(null);
    loadData();
   }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      {contextHolder}
      <Datatable<Scope>
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
      {openFormScope && (
        <FormScope
          data={dataUpdate}
          isOpen={openFormScope}
          action={handleCloseForm}
          notify={openNotificationWithIcon}
        />
      )}
    </>
  );
};

export default Scopes;
