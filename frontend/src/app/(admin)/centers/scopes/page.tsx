import React from 'react'
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Scopes from './Scopes';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Organizaciones / Ámbitos',
};

const page = () => {
  return (
    <>
    <PageBreadcrumb pageTitle="Organizaciones / Ámbitos" />
      <div className="space-y-6">
        <ComponentCard>
            <Scopes />
        </ComponentCard>
      </div>
    </>
  )
}

export default page
