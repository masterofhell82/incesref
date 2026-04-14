import React from 'react'
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Users from './Users';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Usuarios',
};

const Usuarios = () => {
  return (<>
      <PageBreadcrumb pageTitle="Usuarios" />
      <div className="space-y-6">
        <ComponentCard>
            <Users />
        </ComponentCard>
      </div>
    </>)
}

export default Usuarios
