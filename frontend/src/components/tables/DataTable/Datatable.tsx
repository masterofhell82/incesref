import React, { useState, useEffect } from 'react';
import { Table, Input } from 'antd';
import { IoIosSearch } from 'react-icons/io';

import type { TableProps } from 'antd';

interface RowData {
  [key: string]: unknown;
}

type DatatableProps<T extends object> = {
  columns?: TableProps<T>['columns'];
  data?: T[];
  size?: TableProps<T>['size'];
  title?: string;
  isSearch?: boolean;
  apiSearch?: React.ReactNode;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  loading?: boolean;
  [key: string]: unknown;
};

const Datatable = <T extends object = RowData>({
  columns = [],
  data = [],
  size = 'middle',
  title = '',
  isSearch = true,
  apiSearch = <></>,
  startContent = <></>,
  endContent = <></>,
  loading = false,
  ...props
}: DatatableProps<T>) => {
  const [dataSource, setData] = useState<T[]>([...data]);
  const [q, setQ] = useState('');

  const search = (rows: T[]): T[] => {
    if (!rows.length) return [];
    const keys = Object.keys(rows[0]);
    return rows.filter((row) =>
      keys.some(
        (key) =>
          row[key as keyof T] &&
          row[key as keyof T]!.toString().toLowerCase().indexOf(q.toLowerCase()) > -1
      )
    );
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setData(data);
    }
  }, [data]);

  return (
    <>
      <div className="flex w-full flex-row items-center justify-between gap-2">
        <div className="flex flex-row items-center gap-2">
          {title !== '' ? (
            <span className="text-md font-light text-gray-800 dark:text-white/90">{title}</span>
          ) : null}
        </div>
        <div className="flex flex-row items-center gap-2">
          <div>{startContent}</div>
          {isSearch && (
            <div>
              <Input
                type="text"
                placeholder="Buscar"
                value={q}
                size="large"
                onChange={(e) => {
                  setQ(e.target.value);
                }}
                allowClear={true}
                suffix={<IoIosSearch />}
              />
            </div>
          )}
          <div>{apiSearch}</div>
          <div>{endContent}</div>
        </div>
      </div>
      <div className="mt-1">
        <Table
          {...props}
          className="custom-table-font"
          bordered
          columns={columns as TableProps<T>['columns']}
          dataSource={search(dataSource)}
          size={size}
          loading={loading}
          rowKey="id"
        />
      </div>
    </>
  );
};

export default Datatable;
