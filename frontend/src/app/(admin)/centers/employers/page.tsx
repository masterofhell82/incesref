import React from 'react'
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Employers from './Employers';

export const metadata: Metadata = {
  title: 'Organizaciones / Entidad de Trabajo',
};

const page = () => {
  return ( <>
      <PageBreadcrumb pageTitle="Organizaciones / Entidad de Trabajo" />
      <div className="space-y-6">
        <ComponentCard>
            <Employers />
        </ComponentCard>
      </div>
    </>)
}

export default page
