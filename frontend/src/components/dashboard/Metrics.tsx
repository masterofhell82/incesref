"use client";
import React, { useEffect, useState } from "react";
import { statistics } from "@/Services/EndPoints";
import { get } from "@/Services/HttpRequest";
import { PiCertificate } from 'react-icons/pi';
import { LiaGraduationCapSolid } from "react-icons/lia";


export const Metrics = () => {

    const [numCertificates, setNumCertificates] = useState<number | null>(null);
    const [numFormaciones, setNumFormaciones] = useState<number | null>(null);
    const loadData = async () => {
        try {
            const response = await get(statistics);
            setNumCertificates(response.data.certificados);
            setNumFormaciones(response.data.curso_ejecutados);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border flex items-center justify-around border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <PiCertificate className="text-3xl text-gray-800 dark:text-white/90" />
        </div>

        <div className="flex mt-5">
          <div className="flex flex-col text-center space-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              N° de Certificados
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {numCertificates?.toLocaleString() ?? 0}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border flex items-center justify-around border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <LiaGraduationCapSolid className="text-3xl text-gray-800 dark:text-white/90" />
        </div>

        <div className="flex mt-5">
          <div className="flex flex-col text-center space-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Formaciones Ejecutadas
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {numFormaciones?.toLocaleString() ?? 0}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
