'use client';
import React, { useState, useEffect } from 'react';
import { get } from '@/Services/HttpRequest';
import { coursesCertificates } from '@/Services/EndPoints';
import { Input } from 'antd';
import moment from 'moment';
import { CoursesCertificate } from '@/interface/CertificatesInterfaces';

import Datatable from '@/components/tables/DataTable/Datatable';
import type { TableProps } from 'antd';

import { CiViewList } from 'react-icons/ci';
import ListCertificates from './ListCertificates';

const Courses = () => {
  //Data to show in table.
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CoursesCertificate[]>([]);
  const [showListCertificates, setShowListCertificates] = useState(false);
  const [dataUpdate, setDataUpdate] = useState<CoursesCertificate | null>(null);
  // Pagination & Search & Filters
  const [valueSearch, setValueSearch] = useState('');
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
  });

  const columns: TableProps<CoursesCertificate>['columns'] = [
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
    { title: 'Preimpreso', width: '15%', dataIndex: 'preimpreso', key: 'preimpreso' },
    { title: 'Curso', dataIndex: 'curso', key: 'curso' },
    {
      title: 'Participantes',
      dataIndex: 'participantes',
      key: 'participantes',
      className: 'text-center',
    },
    {
      title: 'Inicio',
      dataIndex: 'fecha_inicio',
      key: 'fecha_inicio',
      render: (text: string) => moment(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Fin',
      dataIndex: 'fecha_fin',
      key: 'fecha_fin',
      render: (text: string) => moment(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Emisión',
      dataIndex: 'fecha_emision',
      key: 'fecha_emision',
      render: (text: string) => moment(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Acciones',
      width: '5%',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (text: string, record: CoursesCertificate) => {
        return (
          <div
            className="flex cursor-pointer items-center justify-center gap-2"
            onClick={() => handleListCertificates(record)}
          >
            <CiViewList className="text-2xl" />
          </div>
        );
      },
    },
  ];

  const loadData = async (initFilters = filters) => {
    setLoading(true);
    try {
      const response = await get(
        `${coursesCertificates}?page=${initFilters.page}&page_size=${initFilters.page_size}&q=${initFilters.q}`
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
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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

  const handlePageSize = (page: number, pageSize: number) => {
    // Crear una copia actualizada de los filtros
    const updatedFilters = {
      page_size: pageSize,
      page: page,
      q: filters.q,
    };
    // Filtros actualizados
    loadData(updatedFilters);
  };

  const handleListCertificates = (record: CoursesCertificate) => {
    setDataUpdate(record);
    setShowListCertificates(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      {!showListCertificates && <Datatable<CoursesCertificate>
        size="small"
        columns={columns}
        data={data}
        loading={loading}
        pagination={{ ...pagination, onChange: handlePageSize }}
        isSearch={false}
        endContent={
          <Input.Search
            placeholder="Buscar por preimpreso o curso"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
        }
      />}
      {showListCertificates && dataUpdate && (
        <ListCertificates data={dataUpdate} action={() => setShowListCertificates(false)} />
      )}
    </>
  );
};

export default Courses;
