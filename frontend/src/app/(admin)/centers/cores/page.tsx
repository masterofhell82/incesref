import React from 'react'
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Cores from '@/app/(admin)/centers/cores/Cores';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Organizaciones / Centros de Formación',
};

const page = () => {

  return ( <>
      <PageBreadcrumb pageTitle="Organizaciones / Centros de Formación" />
      <div className="space-y-6">
        <ComponentCard>
            <Cores />
        </ComponentCard>
      </div>
    </>)
}

export default page;
