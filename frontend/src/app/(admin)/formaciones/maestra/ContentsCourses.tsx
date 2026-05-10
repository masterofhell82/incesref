import React, { useEffect, useState } from 'react';
import { get } from '@/Services/HttpRequest';
import { contenidosFormaciones } from '@/Services/EndPoints';
import Modals from '@/components/Modals/Modals';

import { Table } from 'antd';
import type { TableProps } from 'antd';

import type { TrainingCourses, TrainingCoursesContent } from '@/interface/FormationsInterfaces';

const ContentsCourses = ({
  data,
  isOpen,
  action,
}: {
  data: TrainingCourses | null;
  isOpen: boolean;
  action: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [dataSources, setDataSources] = useState<TrainingCoursesContent[]>([]);

  const columns: TableProps<TrainingCoursesContent>['columns'] = [
    { title: '#', align: 'center', width: '5%', dataIndex: 'id', key: 'id' },
    { title: 'Código', width: '20%', dataIndex: 'shortname_curso', key: 'shortname_curso' },
    { title: 'Contenido', width: '50%', dataIndex: 'contenido', key: 'contenido' },
    { title: 'Horas', width: '15%', dataIndex: 'horas', key: 'horas', align: 'center' },
  ];

  const loadData = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const response = await get(`${contenidosFormaciones}/${data.shortname}`);
      setDataSources(response.data);
    } catch (error) {
      console.log('Error fetching course contents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  return (
    <div>
      <Modals
        isModalOpen={isOpen}
        title={`Curso: ${data?.nombre}`}
        handleCancel={action}
        handleOk={action}
        width={800}
      >
        <Table
          columns={columns}
          dataSource={dataSources}
          loading={loading}
          rowKey="id"
          bordered
          size="small"
          pagination={false}
        />
      </Modals>
    </div>
  );
};

export default ContentsCourses;
