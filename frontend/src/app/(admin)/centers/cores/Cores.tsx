'use client';
import React, { useState, useEffect } from 'react';
import { get } from '@/Services/HttpRequest';
import { cfs } from '@/Services/EndPoints';

import { Button, Select } from 'antd';
import Datatable from '@/components/tables/DataTable/Datatable';
import type { TableProps } from 'antd';

import type { Cores } from '@/interface/CoreInterfaces';

import { AiOutlineCloudUpload } from 'react-icons/ai';
import { RiMenuAddLine } from 'react-icons/ri';

const Cores = () => {
  const [loading, setLoading] = useState(false);

  //Data to show in table.
  const [data, setData] = useState([]);

  //Filters
  const [dataFilter, setDataFilter] = useState([]);

  const [estados, setEstados] = useState([]);
  const [selectState, setSelectState] = useState('');

  const [ambitos, setAmbitos] = useState([]);
  const [selectScope, setSelectScope] = useState('');

  const columns: TableProps<Cores>['columns'] = [
    { title: '#', align: 'center', width: '5%', dataIndex: 'id', key: 'id' },
    { title: 'Codigo', width: '15%', dataIndex: 'codigo', key: 'codigo' },
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Direccion', dataIndex: 'direccion', key: 'direccion' },
    {
      title: 'Aciones',
      width: '5%',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (/* data: unknown */) => {
        return (
          <>
            <button
              className="btn btn-info btn-sm ms-2"
              /* onClick={() => dataUpdate(data)} */
              style={{ color: '#fff' }}
              title="Editar"
            >
              <i className="fas fa-pencil-alt"></i>
            </button>
          </>
        );
      },
    },
  ];

  const loadData = async () => {
    try {

        /* let scopes = []; */
      setLoading(true);
      const response = await get(cfs);
      console.log(response);
      setData(response.data);
      const states = states.some(i => i.value === core.estado)) ? [...states, { id: core.id_stados, value: core.estado }] : states;

               /*  if (!scopes.some(i => i.value === core.ambito)) {
                    scopes.push({ id: core.id_ambito, value: core.ambito });
                } */

      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <Datatable<Cores>
        columns={columns}
        data={data}
        loading={loading}
        endContent={
          <div className="flex items-center gap-2">
            <Button color="purple" variant="outlined" size="large">
              Cargar Masivo
              <AiOutlineCloudUpload className="ml-2 text-2xl" />
            </Button>
            <Button color="green" variant="outlined" size="large">
              Agregar
              <RiMenuAddLine className="ml-2 text-2xl" />
            </Button>
          </div>
        }
      />
    </>
  );
};

export default Cores;
