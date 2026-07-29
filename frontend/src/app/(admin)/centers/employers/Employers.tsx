'use client';
import React, { useState, useEffect } from 'react';
import { get } from '@/Services/HttpRequest';
import { employerEntities, estados } from '@/Services/EndPoints';

import { Button, Select, Input, notification } from 'antd';

import Datatable from '@/components/tables/DataTable/Datatable';
import type { TableProps } from 'antd';

import type { Option } from '@/interface/CoreInterfaces';
import { NotificationType } from '@/interface/NotificationInterface';
import { EmployersData } from '@/interface/EmployersInterfaces';
import { GeoEstados } from '@/interface/GeographyInterface';

import { RiMenuAddLine } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';
import { PiSignatureDuotone } from 'react-icons/pi';

import { LuMail, LuPhone } from 'react-icons/lu';

const isValidOption = (option: {
  id: number | undefined;
  value: string | undefined;
}): option is Option => option.id !== undefined && option.value !== undefined;

const uniqueOptions = (options: { id: number | undefined; value: string | undefined }[]) =>
  options.filter(isValidOption).filter((option: Option, index: number, self: Option[]) => {
    return index === self.findIndex((item: Option) => item.value === option.value);
  });

const Employers = () => {
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EmployersData[]>([]);
  //const [dataUpdate, setDataUpdate] = useState<EmployersData | null>(null);
  // Pagination & Search & Filters
  const [valueSearch, setValueSearch] = useState('');
  const [valueEstado, setValueEstado] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    defaultPageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    page_size: 10,
    page: 1,
    q: valueSearch,
    state: valueEstado,
  });
  //Filters
  const [opEstados, setOpEstados] = useState<Option[]>([]);

  const columns: TableProps<EmployersData>['columns'] = [
    {
      title: '#',
      align: 'center',
      width: '5%',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => {
        return <span>{text}</span>;
      },
    },
    {
      title: 'rif',
      dataIndex: 'rif',
      key: 'rif',
    },
    { title: 'Razón Social', dataIndex: 'razonSocial', key: 'razonSocial' },
    {
      title: 'Rif Representante',
      dataIndex: 'rifRepresentante',
      key: 'rifRepresentante',
    },
    {
      title: 'Representante',
      dataIndex: 'representante',
      key: 'representante',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
    },
    {
      title: 'Tipo Contribuyente',
      dataIndex: 'tipoContribuyente',
      key: 'tipoContribuyente',
    },
    {
      title: 'Acciones',
      width: '5%',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (text: string, record: EmployersData) => {
        return (
          <div className="flex cursor-pointer items-center justify-center gap-2">
            <TbEdit className="text-2xl" onClick={() => alert(JSON.stringify(record))} />
            <PiSignatureDuotone
              className={`text-2xl ${record.firma ? 'text-green-500' : 'text-gray-400'}`}
              onClick={() => alert(JSON.stringify(record))}
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

  const loadData = async (initFilters = filters) => {
    setLoading(true);
    try {
      const response = await get(
        `${employerEntities}?page=${initFilters.page}&page_size=${initFilters.page_size}&q=${initFilters.q}&state=${initFilters.state}`
      );
      const nextPage = Number(response?.meta?.page ?? initFilters.page) || 1;
      const nextPageSize = Number(response?.meta?.page_size ?? initFilters.page_size) || 10;
      const nextTotal = Number(response?.meta?.total ?? 0) || 0;
      const nextData = Array.isArray(response?.data) ? response.data : [];

      // En modo async, dataSource debe ser solo de la página actual (<= pageSize)
      setData(nextData.slice(0, nextPageSize));

      setPagination((prev) => ({
        ...prev,
        total: nextTotal,
        current: nextPage,
        pageSize: nextPageSize,
        defaultPageSize: nextPageSize,
      }));

      setFilters({
        page: nextPage,
        page_size: nextPageSize,
        q: initFilters.q,
        state: initFilters.state,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEstados = async () => {
    try {
      const response = await get(estados);
      const options: Option[] = response.data.map((estado: GeoEstados) => ({
        id: estado.id,
        value: estado.estado,
      }));
      setOpEstados(uniqueOptions(options));
    } catch (error) {
      console.error('Error fetching estados:', error);
    }
  };

  const handleSearch = (value: string) => {
    // Crear una copia actualizada de los filtros
    const updatedFilters = {
      ...filters,
      page: 1, // Reiniciar la página a 1 al buscar
      q: value,
    };
    setValueSearch(value);
    setFilters({ ...filters, q: value });
    // Filtros actualizados
    loadData(updatedFilters);
  };

  const handleEstadoChange = (value: string) => {
    console.log(value);

    // Crear una copia actualizada de los filtros
    const updatedFilters = {
      ...filters,
      page: 1, // Reiniciar la página a 1 al cambiar el estado
      state: value,
    };
    setValueEstado(value);
    setFilters({ ...filters, state: value });
    // Filtros actualizados
    loadData(updatedFilters);
  };

  const handlePageSize = (page: number, pageSize: number) => {
    // Crear una copia actualizada de los filtros
    const updatedFilters = {
      page_size: pageSize,
      page: page,
      q: filters.q,
      state: filters.state,
    };
    // Filtros actualizados
    loadData(updatedFilters);
  };

  useEffect(() => {
    loadData();
    loadEstados();
  }, []);

  return (
    <>
      {contextHolder}
      <Datatable<EmployersData>
        size="small"
        columns={columns}
        data={data}
        loading={loading}
        pagination={{ ...pagination, onChange: handlePageSize }}
        isSearch={false}
        endContent={
          <div className="flex items-center gap-2">
            <Select
              size="large"
              showSearch={{
                filterOption: (input, option) =>
                  (option?.value ?? '').toLowerCase().includes(input.toLowerCase()),
              }}
              allowClear
              style={{ width: 250 }}
              placeholder="Seleccione estado"
              options={opEstados}
              value={valueEstado ?? undefined}
              onChange={handleEstadoChange}
            />
            <Input.Search
              placeholder="Buscar"
              allowClear
              size="large"
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Button
              color="green"
              variant="outlined"
              size="large"
              onClick={() => alert('Agregar nuevo curso')}
            >
              Agregar
              <RiMenuAddLine className="ml-2 text-2xl" />
            </Button>
          </div>
        }
        expandable={{
          expandedRowRender: (record: EmployersData) => (
            <div className="grid grid-cols-1 gap-2 px-2 py-3 md:grid-cols-3">
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
                    Teléfono Móvil:
                  </span>
                  {record.telefonoMovil || 'Sin teléfono registrado'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LuPhone className="shrink-0 self-center text-base text-green-500" />
                <div className="text-dark flex items-center gap-2 text-sm leading-none dark:text-white">
                  <span className="inline-flex items-center text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Teléfono Fijo:
                  </span>
                  {record.telefonoFijo || 'Sin teléfono registrado'}
                </div>
              </div>
            </div>
          ),
        }}
      />
    </>
  );
};

export default Employers;
