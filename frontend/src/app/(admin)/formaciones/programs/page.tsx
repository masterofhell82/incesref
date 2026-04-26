import React from 'react'
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Programs from './Programs';

export const metadata: Metadata = {
  title: 'Formaciones / Programas',
};


const page = () => {
  return (<>
      <PageBreadcrumb pageTitle="Formaciones / Programas" />
      <div className="space-y-6">
        <ComponentCard>
            <Programs />
        </ComponentCard>
      </div>
    </>)
}

export default page
