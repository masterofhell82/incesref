import React from 'react'
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Templates from './Templates';


export const metadata: Metadata = {
  title: 'Plantillas de certificados',
}

const page = () => {
  return (<>
      <PageBreadcrumb sections="Configuraciones" pageTitle="Plantillas de certificados" />
      <div className="space-y-6">
        <ComponentCard>
            <Templates />
        </ComponentCard>
      </div>
    </>)
}

export default page
