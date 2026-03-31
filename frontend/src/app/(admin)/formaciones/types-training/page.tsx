import React from 'react'
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import TypesTraining from './TypesTraining';

export const metadata: Metadata = {
  title: 'Formaciones / Tipo de Formación',
};

const page = () => {
  return (<>
      <PageBreadcrumb pageTitle="Formaciones / Tipo de Formación" />
      <div className="space-y-6">
        <ComponentCard>
            <TypesTraining />
        </ComponentCard>
      </div>
    </>)
}

export default page
