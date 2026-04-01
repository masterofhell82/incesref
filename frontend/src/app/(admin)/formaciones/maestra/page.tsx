import React from 'react'
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Formaciones / Malla Curricular (Maestra)',
};


const page = () => {
  return (<>
      <PageBreadcrumb pageTitle="Formaciones / Malla Curricular (Maestra)" />
      <div className="space-y-6">
        <ComponentCard>
            Maestra
        </ComponentCard>
      </div>
    </>)
}

export default page
