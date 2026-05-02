import React from 'react'
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Courses from './Courses';


export const metadata: Metadata = {
  title: 'Certificados / Cursos',
};


const page = () => {
  return (<>
      <PageBreadcrumb pageTitle="Certificados / Cursos " />
      <div className="space-y-6">
        <ComponentCard>
            <Courses />
        </ComponentCard>
      </div>
    </>)
}

export default page
