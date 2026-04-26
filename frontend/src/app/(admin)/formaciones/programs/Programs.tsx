'use client';
import React, { useState, useEffect } from 'react';
import { get, patch } from '@/Services/HttpRequest';
import { programas } from '@/Services/EndPoints';
import { Button, notification, Modal } from 'antd';

import type { TrainingPrograms } from '@/interface/FormationsInterfaces';
import { NotificationType } from '@/interface/NotificationInterface';

import Datatable from '@/components/tables/DataTable/Datatable';
import type { TableProps } from 'antd';

import { RiMenuAddLine } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';
import { MdOutlinePublishedWithChanges } from 'react-icons/md';
import { PiWarningCircleLight } from 'react-icons/pi';

import FormPrograms from './FormPrograms';

const Programs = () => {
  const [api, contextHolder] = notification.useNotification();
  const [modal, contextHolderModal] = Modal.useModal();

  const [loading, setLoading] = useState(false);
  //Data to show in table.
  const [data, setData] = useState<TrainingPrograms[]>([]);
  const [dataUpdate, setDataUpdate] = useState<TrainingPrograms | null>(null);
  const [openFormTrainingPrograms, setOpenFormTrainingPrograms] = useState(false);

  const columns: TableProps<TrainingPrograms>['columns'] = [
    { title: '#', align: 'center', width: '5%', dataIndex: 'id', key: 'id' },
    { title: 'Nombre', width: '30%', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
    {
      title: 'Activo',
      dataIndex: 'is_activo',
      key: 'is_activo',
      width: '10%',
      className: 'text-center',
      render: (is_activo: boolean) => {
        return (
          <span className={`font-bold ${is_activo ? 'text-green-500' : 'text-red-500'}`}>
            {is_activo ? 'Activo' : 'Inactivo'}
          </span>
        );
      },
    },
    {
      title: 'Acciones',
      width: '10%',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (_: unknown, record: TrainingPrograms) => {
        return (
          <div className="flex items-center justify-center gap-4">
            <MdOutlinePublishedWithChanges
              className={`cursor-pointer text-2xl ${record.is_activo ? 'text-gray-400' : 'text-green-500'}`}
              onClick={() => showNotification(record, !record.is_activo)}
              title={record.is_activo ? 'Desactivar' : 'Activar'}
            />
            <TbEdit className="text-2xl" onClick={() => handleEdit(record)} title="Editar" />
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
      const response = await get(programas);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setDataUpdate(null);
    setOpenFormTrainingPrograms(true);
  };

  const handleEdit = (values: TrainingPrograms) => {
    setDataUpdate(values);
    setOpenFormTrainingPrograms(true);
  };

  const handleCloseForm = () => {
    setOpenFormTrainingPrograms(false);
    setDataUpdate(null);
    loadData();
  };

  const showNotification = (record: TrainingPrograms, activate: boolean) => {
    modal.confirm({
      title: 'Confirmar Cambio de Estatus',
      icon: <PiWarningCircleLight className="text-warning-600 mx-1 text-3xl" />,
      content: '¿Está seguro de que desea cambiar el estatus?',
      cancelText: 'Cancelar',
      okText: 'Continuar',
      onOk() {
        handleActivateDeactivate(record, activate);
      },
      onCancel() {},
    });
  };

  const handleActivateDeactivate = async (record: TrainingPrograms, activate: boolean) => {
    try {
      await patch(`${programas}/activate/${record.id}`, JSON.stringify({ is_activo: activate }));
      openNotificationWithIcon(
        'success',
        `Usuario ${activate ? 'activado' : 'desactivado'}`,
        `El usuario ${record.nombre} ha sido ${activate ? 'activado' : 'desactivado'} exitosamente.`
      );
      loadData(); // Recargar los datos después de la actualización
    } catch (error) {
      console.error('Error updating status:', error);
      openNotificationWithIcon(
        'error',
        'Error',
        `No se pudo ${activate ? 'activar' : 'desactivar'} el usuario ${record.nombre}.`
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);
  return (
    <>
      {contextHolder}
      {contextHolderModal}
      <Datatable<TrainingPrograms>
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
      {openFormTrainingPrograms && (
        <FormPrograms
          data={dataUpdate}
          isOpen={openFormTrainingPrograms}
          action={handleCloseForm}
          notify={openNotificationWithIcon}
        />
      )}
    </>
  );
};

export default Programs;
