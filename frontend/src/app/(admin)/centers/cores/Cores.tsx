'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { get } from '@/Services/HttpRequest';
import { cfs } from '@/Services/EndPoints';

import { Button, Select, notification } from 'antd';

import Datatable from '@/components/tables/DataTable/Datatable';
import type { TableProps } from 'antd';

import type { Cores, Option } from '@/interface/CoreInterfaces';
import { NotificationType } from '@/interface/NotificationInterface';

import { AiOutlineCloudUpload } from 'react-icons/ai';
import { RiMenuAddLine } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';
import FormCores from './FormCores';
import FormMasiveCore from './FormMasiveCore';

const isValidOption = (option: {
  id: number | undefined;
  value: string | undefined;
}): option is Option => option.id !== undefined && option.value !== undefined;

const uniqueOptions = (options: { id: number | undefined; value: string | undefined }[]) =>
  options.filter(isValidOption).filter((option: Option, index: number, self: Option[]) => {
    return index === self.findIndex((item: Option) => item.value === option.value);
  });

const Cores = () => {
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [openFormCores, setOpenFormCores] = useState(false);
  const [openMasiveForm, setOpenMasiveForm] = useState(false);
  const [dataUpdate, setDataUpdate] = useState<Cores | null>(null);

  //Data to show in table.
  const [data, setData] = useState<Cores[]>([]);

  //Filters
  const [dataFilter, setDataFilter] = useState<Cores[]>([]);
  const [estados, setEstados] = useState<Option[]>([]);
  const [selectState, setSelectState] = useState('');
  const [selectScope, setSelectScope] = useState('');
  const [ambitos, setAmbitos] = useState<Option[]>([]);

  const columns: TableProps<Cores>['columns'] = [
    { title: '#', align: 'center', width: '5%', dataIndex: 'id', key: 'id' },
    { title: 'Codigo', width: '10%', dataIndex: 'codigo', key: 'codigo' },
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Direccion', dataIndex: 'direccion', key: 'direccion' },
    {
      title: 'Aciones',
      width: '5%',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (_: unknown, record: Cores) => {
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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await get(cfs);
      const cores = response.data;
      const states = uniqueOptions(
        cores.map((core: Cores) => ({ id: core.id_estado, value: core.estado }))
      );

      const scopesBase = selectState
        ? cores.filter((core: Cores) => core.id_estado === parseInt(selectState))
        : cores;

      const scopes = uniqueOptions(
        scopesBase.map((core: Cores) => ({ id: core.id_ambito, value: core.ambito }))
      );

      let filteredData = cores;
      if (selectState) {
        filteredData = filteredData.filter(
          (core: Cores) => core.id_estado === parseInt(selectState)
        );
      }
      if (selectScope) {
        filteredData = filteredData.filter(
          (core: Cores) => core.id_ambito === parseInt(selectScope)
        );
      }

      setEstados(states);
      setAmbitos(scopes);
      setData(filteredData);
      setDataFilter(cores);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }, [selectState, selectScope]);

  const handleStatesFilter = (value: string | undefined) => {
    setLoading(true);
    if (value !== undefined) {
      setSelectState(value);
      const filteredData = dataFilter.filter((core: Cores) => core.id_estado === parseInt(value));
      const scopes = uniqueOptions(
        filteredData.map((core: Cores) => ({ id: core.id_ambito, value: core.ambito }))
      );
      setAmbitos(scopes);
      setData(filteredData);
    } else {
      const scopes = uniqueOptions(
        dataFilter.map((core: Cores) => ({ id: core.id_ambito, value: core.ambito }))
      );
      setSelectState('');
      setAmbitos(scopes);
      setData(dataFilter);
    }
    setLoading(false);
  };

  const handleScopesFilter = (value: string | undefined) => {
    setLoading(true);
    let filteredData = dataFilter;
    if (value !== undefined && value !== '') {
      setSelectScope(value);
      if (selectState && selectState !== '') {
        // Si hay estado seleccionado, filtra por ambos
        filteredData = dataFilter.filter(
          (core: Cores) =>
            core.id_ambito === parseInt(value) && core.id_estado === parseInt(selectState)
        );
      } else {
        // Solo filtra por ámbito
        filteredData = dataFilter.filter((core: Cores) => core.id_ambito === parseInt(value));
      }
    } else {
      setSelectScope('');
      if (selectState && selectState !== '') {
        // Si solo hay estado seleccionado, filtra por estado
        filteredData = dataFilter.filter((core: Cores) => core.id_estado === parseInt(selectState));
      } else {
        // Sin filtros
        filteredData = dataFilter;
      }
    }
    setData(filteredData);
    setLoading(false);
  };

  const handleEdit = (data: Cores) => {
    setDataUpdate(data);
    setOpenFormCores(true);
  };

  const handleClosed = () => {
    setDataUpdate(null);
    setOpenFormCores(false);
    loadData();
  };

  const openNotificationWithIcon = (type: NotificationType, title: string, description: string) => {
    api[type]({
      title,
      description,
      showProgress: true,
    });
  };

  const handleOpenMasiveForm = () => {
    setOpenMasiveForm(true);
  };

  const handleClosedMasiveForm = () => {
    setOpenMasiveForm(false);
    loadData();
  }

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <>
      {contextHolder}
      <Datatable<Cores>
        columns={columns}
        data={data}
        loading={loading}
        startContent={
          <div className="flex items-center gap-4">
            <Select
              allowClear={true}
              size="large"
              placeholder="Seleccionar Estado"
              style={{ width: 150 }}
              onChange={(value) => handleStatesFilter(value)}
              options={estados.map((state: Option) => ({ label: state.value, value: state.id }))}
            />
            <Select
              allowClear={true}
              size="large"
              placeholder="Seleccionar Ámbito"
              style={{ width: 200 }}
              onChange={(value) => handleScopesFilter(value)}
              options={ambitos.map((scope: Option) => ({ label: scope.value, value: scope.id }))}
            />
          </div>
        }
        endContent={
          <div className="flex items-center gap-2">
            <Button color="purple" variant="outlined" size="large" onClick={handleOpenMasiveForm}>
              Cargar Masivo
              <AiOutlineCloudUpload className="ml-2 text-2xl" />
            </Button>
            <Button
              color="green"
              variant="outlined"
              size="large"
              onClick={() => setOpenFormCores(true)}
            >
              Agregar
              <RiMenuAddLine className="ml-2 text-2xl" />
            </Button>
          </div>
        }
      />

      {openFormCores && (
        <FormCores
          isOpen={openFormCores}
          action={handleClosed}
          data={dataUpdate}
          notify={openNotificationWithIcon}
        />
      )}

      {openMasiveForm && (
        <FormMasiveCore
          isOpen={openMasiveForm}
          action={handleClosedMasiveForm}
          notify={openNotificationWithIcon}
        />
      )}
    </>
  );
};

export default Cores;
