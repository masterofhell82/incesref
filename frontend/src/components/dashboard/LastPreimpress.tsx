'use client';

import React, { useEffect, useState } from 'react';
import type { TableProps } from 'antd';
import moment from 'moment';
import { lastPreimpress } from '@/Services/EndPoints';
import { get } from '@/Services/HttpRequest';
import Datatable from '@/components/tables/DataTable/Datatable';

type LastPreimpressRow = {
  codigo: string;
  consecutivo: string | null;
  created_at: string | null;
  estado: string;
  id_curso_activo: number;
  preimpreso: string;
};

type LastPreimpressResponse = {
  data: LastPreimpressRow[];
};

const isLastPreimpressResponse = (value: unknown): value is LastPreimpressResponse => {
  if (!value || typeof value !== 'object' || !('data' in value)) {
    return false;
  }

  return (
    Array.isArray(value.data) &&
    value.data.every(
      (row) =>
        row &&
        typeof row.codigo === 'string' &&
        (typeof row.consecutivo === 'string' || row.consecutivo === null) &&
        (typeof row.created_at === 'string' || row.created_at === null) &&
        typeof row.estado === 'string' &&
        typeof row.id_curso_activo === 'number' &&
        typeof row.preimpreso === 'string',
    )
  );
};

const columns: TableProps<LastPreimpressRow>['columns'] = [
  {
    title: 'Estado',
    dataIndex: 'estado',
    key: 'estado',
    sorter: (first, second) => first.estado.localeCompare(second.estado, 'es'),
    width: 180,
  },
  {
    title: 'Preimpreso',
    dataIndex: 'preimpreso',
    key: 'preimpreso',
    width: 200,
  },
  {
    title: 'Último consecutivo',
    dataIndex: 'consecutivo',
    key: 'consecutivo',
    render: (value: string | null) => value ?? 'Sin certificados',
    width: 170,
  },
  {
    title: 'Fecha',
    dataIndex: 'created_at',
    key: 'created_at',
    render: (value: string | null) => {
      if (!value) return 'Sin fecha';
      const date = moment(value).locale('es');
      if (!date.isValid()) return 'Fecha inválida';
      return `${date.format('DD/MM/YYYY')}`;
    },
    sorter: (first, second) =>
      (first.created_at ?? '').localeCompare(second.created_at ?? ''),
    width: 190,
  },
];

const LastPreimpress = () => {
  const [data, setData] = useState<LastPreimpressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadLastPreimpress = async () => {
      setLoading(true);
      setError(false);

      try {
        const response: unknown = await get(lastPreimpress);
        if (!isLastPreimpressResponse(response)) {
          throw new Error('La respuesta del servidor tiene un formato inválido.');
        }

        if (isActive) {
          setData(response.data);
        }
      } catch {
        if (isActive) {
          setError(true);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadLastPreimpress();

    return () => {
      isActive = false;
    };
  }, [retryCount]);

  return (
    <section
      aria-labelledby="last-preimpress-title"
      className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
    >
      <header className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="last-preimpress-title"
            className="text-lg font-semibold text-gray-800 dark:text-white/90"
          >
            Último preimpreso por estado
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Preimpresos registrados más recientemente en cada estado.
          </p>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-4 flex flex-col gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between dark:bg-red-950/30 dark:text-red-200"
        >
          <p>No se pudo cargar la información. Verifica tu conexión e inténtalo de nuevo.</p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="w-fit rounded-md px-3 py-2 font-medium outline-none hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-600 dark:hover:bg-red-900/40"
          >
            Reintentar
          </button>
        </div>
      )}

      <div aria-busy={loading}>
        <Datatable<LastPreimpressRow>
          columns={columns}
          data={data}
          loading={loading}
          rowKey="id_curso_activo"
          size="small"
          expandable={{
            expandedRowRender: (record: LastPreimpressRow) => (
              <dl className="flex flex-wrap items-baseline gap-x-5 gap-y-2 px-2 py-1 text-sm">
                <div className="flex min-w-0 items-baseline gap-1.5">
                  <dt className="shrink-0 text-gray-500 dark:text-gray-400">
                    Código:
                  </dt>
                  <dd className="min-w-0 break-all font-medium text-gray-800 dark:text-white/90">
                    {record.codigo}
                  </dd>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <dt className="text-gray-500 dark:text-gray-400">
                    Curso activo:
                  </dt>
                  <dd className="font-medium tabular-nums text-gray-800 dark:text-white/90">
                    {record.id_curso_activo}
                  </dd>
                </div>
              </dl>
            ),
          }}
          locale={{
            emptyText: error
              ? 'No hay información para mostrar.'
              : 'No hay preimpresos registrados.',
          }}
        />
      </div>
    </section>
  );
};

export default LastPreimpress;
