import React from 'react'
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: 'Certificados / Carga de Cursos',
};

const CargaMasiva = () => {
  return (<>
    <PageBreadcrumb pageTitle="Certificados / Carga de Cursos " />
      <div className="space-y-6">
        <ComponentCard>
            hola
        </ComponentCard>
      </div>
  </>)
}

export default CargaMasiva
