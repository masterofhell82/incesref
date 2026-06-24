'use client';
import React, { useState, useEffect } from 'react';
import { get } from '@/Services/HttpRequest';
import { coursesCertificates } from '@/Services/EndPoints';
import moment from 'moment';

import { CoursesCertificate } from '@/interface/CertificatesInterfaces';

import { Input, Button } from 'antd';
import Datatable from '@/components/tables/DataTable/Datatable';
import type { TableProps } from 'antd';

import { CiViewList } from 'react-icons/ci';
import { RiMenuAddLine } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';

import ListCertificates from './ListCertificates';
import BulkUpload from './BulkUpload';

const Courses = () => {
  //Data to show in table.
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CoursesCertificate[]>([]);
  const [showDatatable, setShowDatatable] = useState(true);
  const [showListCertificates, setShowListCertificates] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
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

  const formatDate = (text: string) => moment.utc(text).format('DD/MM/YYYY');

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
    {
      title: 'Preimpreso',
      width: '15%',
      dataIndex: 'preimpreso',
      key: 'preimpreso',
    },
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
      render: (text: string) => formatDate(text),
    },
    {
      title: 'Fin',
      dataIndex: 'fecha_fin',
      key: 'fecha_fin',
      render: (text: string) => formatDate(text),
    },
    {
      title: 'Emisión',
      dataIndex: 'fecha_emision',
      key: 'fecha_emision',
      render: (text: string) => formatDate(text),
    },
    {
      title: 'Acciones',
      width: '5%',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (text: string, record: CoursesCertificate) => {
        return (
          <div className="flex cursor-pointer items-center justify-center gap-2">
            <TbEdit className="text-2xl" onClick={() => handleEditCourse(record)} />
            <CiViewList className="text-2xl" onClick={() => handleListCertificates(record)} />
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
    setShowBulkUpload(false);
    setShowListCertificates(true);
    setShowDatatable(false);
  };

  const handleEditCourse = (record: CoursesCertificate) => {
    setDataUpdate(record);
    setShowListCertificates(false);
    setShowDatatable(false);
    setShowBulkUpload(true);
  };

  const handleAddCourse = () => {
    setShowListCertificates(false);
    setShowDatatable(false);
    setShowBulkUpload(true);
    setDataUpdate(null);
  };

  const handleClose = () => {
    setShowListCertificates(false);
    setShowBulkUpload(false);
    setShowDatatable(true);
    setDataUpdate(null);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      {showDatatable && (
        <Datatable<CoursesCertificate>
          size="small"
          columns={columns}
          data={data}
          loading={loading}
          pagination={{ ...pagination, onChange: handlePageSize }}
          isSearch={false}
          endContent={
            <div className="flex items-center gap-2">
              <Input.Search
                placeholder="Buscar por preimpreso o curso"
                allowClear
                size="large"
                onSearch={handleSearch}
                style={{ width: 300 }}
              />
              <Button color="green" variant="outlined" size="large" onClick={handleAddCourse}>
                Agregar
                <RiMenuAddLine className="ml-2 text-2xl" />
              </Button>
            </div>
          }
        />
      )}

      {showListCertificates && dataUpdate && (
        <ListCertificates data={dataUpdate} action={handleClose} />
      )}

      {showBulkUpload && <BulkUpload data={dataUpdate} action={handleClose} />}
    </>
  );
};

export default Courses;
