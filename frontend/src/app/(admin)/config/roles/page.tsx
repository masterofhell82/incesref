import React from 'react'
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Roles from './Roles';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Roles de usuario ',
}

const page = () => {
  return (<>
      <PageBreadcrumb sections="Configuraciones" pageTitle="Usuarios / Roles de usuario" />
      <div className="space-y-6">
        <ComponentCard>
            <Roles />
        </ComponentCard>
      </div>
    </>)
}

export default page
