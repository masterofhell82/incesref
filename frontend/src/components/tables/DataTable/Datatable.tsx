import React, { useMemo, useState } from 'react';
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
  const [q, setQ] = useState('');

  const filteredData = useMemo(() => {
    if (!isSearch || q.trim() === '') {
      return data;
    }
    if (!data.length) return [];
    const keys = Object.keys(data[0] as object);
    return data.filter((row) =>
      keys.some((key) => {
        const value = row[key as keyof T];
        return value && value.toString().toLowerCase().includes(q.toLowerCase());
      })
    );
  }, [data, isSearch, q]);

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
          dataSource={filteredData}
          size={size}
          loading={loading}
          rowKey={(props.rowKey as TableProps<T>['rowKey']) ?? 'id'}
        />
      </div>
    </>
  );
};

export default Datatable;
