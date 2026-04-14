'use client';
import React, { useState, useEffect } from 'react';
import { get, patch } from '@/Services/HttpRequest';
import { users } from '@/Services/EndPoints';
import { Button, notification, Modal } from 'antd';

import type { UsersInterfaces } from '@/interface/UsersInterfaces';
import { NotificationType } from '@/interface/NotificationInterface';

import Datatable from '@/components/tables/DataTable/Datatable';
import type { TableProps } from 'antd';

import { LuUserPlus, LuUserCheck, LuUserMinus, LuUserPen, LuMail, LuPhone } from 'react-icons/lu';
import { TbPasswordUser } from 'react-icons/tb';
import { PiWarningCircleLight } from 'react-icons/pi';

import FormUser from './FormUser';
import FormChangePass from './FormChangePass';

const Users = () => {
  const [api, contextHolder] = notification.useNotification();
  const [modal, contextHolderModal] = Modal.useModal();
  //Data to show in table.
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UsersInterfaces[]>([]);
  const [dataUpdate, setDataUpdate] = useState<UsersInterfaces | null>(null);
  const [openFormUsers, setOpenFormUsers] = useState(false);
  const [openChangePassModal, setOpenChangePassModal] = useState(false);

  const columns: TableProps<UsersInterfaces>['columns'] = [
    { title: '#', align: 'center', width: '5%', dataIndex: 'id', key: 'id' },
    { title: 'Cédula', dataIndex: 'cedula', key: 'cedula' },
    {
      title: 'Nombre Completo',
      width: '30%',
      dataIndex: 'nombres',
      key: 'nombres',
      render: (_: unknown, record: UsersInterfaces) => `${record.nombres} ${record.apellidos}`,
    },
    { title: 'Usuario', dataIndex: 'username', key: 'username' },
    {
      title: 'Región',
      dataIndex: 'estado',
      key: 'estado',
      render: (value: string, record: UsersInterfaces) => {
        if (record.estadoId === 24) return 'Sede Central';
        if (!value) return 'Sin región asignada';
        return value;
      },
    },
    { title: 'Rol', dataIndex: 'rol', key: 'rol' },
    {
      title: 'Estatus',
      dataIndex: 'activado',
      key: 'activado',
      render: (value: boolean) => {
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full w-[80px] px-2 py-1 text-xs font-medium ${
              value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`}
            ></span>
            {value ? 'Activo' : 'Inactivo'}
          </span>
        );
      },
    },
    {
      title: 'Acciones',
      width: '5%',
      dataIndex: 'action',
      key: 'action',
      render: (_: unknown, record: UsersInterfaces) => {
        return (
          <div className="flex w-full items-center justify-center gap-4 px-2">
            {record.activado ? (
              <LuUserMinus
                className="cursor-pointer text-2xl text-red-500"
                title="Desactivar usuario"
                onClick={() => showNotification(record, false)}
              />
            ) : (
              <LuUserCheck
                className="cursor-pointer text-2xl text-green-500"
                title="Activar usuario"
                onClick={() => showNotification(record, true)}
              />
            )}
            <LuUserPen
              className="cursor-pointer text-2xl"
              onClick={() => handleEdit(record)}
              title="Editar"
            />
            <TbPasswordUser
              className="cursor-pointer text-2xl"
              onClick={() => handleChangePass(record)}
              title="Cambiar contraseña"
            />
          </div>
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
      const response = await get(users);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setDataUpdate(null);
    setOpenFormUsers(true);
  };

  const handleEdit = (values: UsersInterfaces) => {
    setDataUpdate(values);
    setOpenFormUsers(true);
  };

  const handleCloseForm = () => {
    setDataUpdate(null);
    setOpenChangePassModal(false);
    setOpenFormUsers(false);
    loadData();
  };

  const showNotification = (record: UsersInterfaces, activate: boolean) => {
    modal.confirm({
      title: 'Confirmar Cambio de Estatus',
      icon: <PiWarningCircleLight className="text-warning-600 mx-1 text-3xl" />,
      content: '¿Está seguro de que desea cambiar el estatus de este usuario?',
      cancelText: 'Cancelar',
      okText: 'Continuar',
      onOk() {
        handleChangeUserActivation(record, activate);
      },
      onCancel() {},
    });
  };

  const handleChangeUserActivation = async (record: UsersInterfaces, activate: boolean) => {
    try {
      await patch(`${users}/activate/${record.id}`, JSON.stringify({ activado: activate }));
      openNotificationWithIcon(
        'success',
        `Usuario ${activate ? 'activado' : 'desactivado'}`,
        `El usuario ${record.nombres} ha sido ${activate ? 'activado' : 'desactivado'} exitosamente.`
      );
      loadData(); // Recargar los datos después de la actualización
    } catch (error) {
      console.error('Error toggling user status:', error);
      openNotificationWithIcon(
        'error',
        'Error',
        `No se pudo ${activate ? 'activar' : 'desactivar'} el usuario ${record.nombres}.`
      );
    }
  };

  /* Modal de cambio de contraseña */
  const handleChangePass = (record: UsersInterfaces) => {
    setOpenChangePassModal(true);
    setDataUpdate(record);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      {contextHolder}
      {contextHolderModal}
      <Datatable<UsersInterfaces>
        columns={columns}
        data={data}
        loading={loading}
        size="small"
        endContent={
          <div className="flex items-center gap-2">
            <Button color="green" variant="outlined" size="large" onClick={handleAdd}>
              Agregar
              <LuUserPlus className="ml-2 text-2xl" />
            </Button>
          </div>
        }
        expandable={{
          expandedRowRender: (record: UsersInterfaces) => (
            <div className="grid grid-cols-1 gap-2 px-2 py-3 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <LuMail className="shrink-0 self-center text-base text-blue-500" />
                <div className="text-dark flex gap-2 text-sm leading-none dark:text-white">
                  <span className="inline-flex items-center text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Correo:
                  </span>
                  {record.correo || 'Sin correo registrado'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <LuPhone className="shrink-0 self-center text-base text-green-500" />
                <div className="text-dark flex items-center gap-2 text-sm leading-none dark:text-white">
                  <span className="inline-flex items-center text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Teléfono:
                  </span>
                  {record.telefono || 'Sin teléfono registrado'}
                </div>
              </div>
            </div>
          ),
        }}
      />
      {openFormUsers && (
        <FormUser
          isOpen={openFormUsers}
          action={handleCloseForm}
          data={dataUpdate}
          notify={openNotificationWithIcon}
        />
      )}

      {openChangePassModal && dataUpdate && (
        <FormChangePass
          isOpen={openChangePassModal}
          action={handleCloseForm}
          data={{ id: dataUpdate.id }}
          notify={openNotificationWithIcon}
        />
      )}
    </>
  );
};

export default Users;
