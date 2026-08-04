import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Metadata } from 'next';
import Students from './Students';

export const metadata: Metadata = {
  title: 'INCES - Estudiantes',
};

const page = () => {
  return (
    <>
      {' '}
      <PageBreadcrumb pageTitle="Estudiantes" />
      <div className="space-y-6">
        <ComponentCard><Students /></ComponentCard>
      </div>
    </>
  );
};

export default page;
