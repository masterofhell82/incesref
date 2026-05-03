import React from 'react'

const BulkUpload = () => {
  return (
    <><div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:justify-between">
          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Carga masiva de formaciones.
            </h3>
            <p className="text-theme-sm mt-1 text-gray-500 dark:text-gray-400">
              Carga masiva de formaciones para emisión de certificados
            </p>
          </div>
        </div>
        <div className="custom-scrollbar max-w-full overflow-x-auto">
          <div className="min-w-[1000px] xl:min-w-full">
           Carga masiva de certificados
          </div>
        </div>
      </div></>
  )
}

export default BulkUpload
