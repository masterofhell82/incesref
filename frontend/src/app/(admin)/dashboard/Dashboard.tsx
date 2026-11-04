import React from 'react';
import { Metrics } from '@/components/dashboard/Metrics';
import CertificatesUploadedChart from '@/components/dashboard/CertificatesUploadedChart';
import LastPreimpress from '@/components/dashboard/LastPreimpress';

const Dashboard = () => {
  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-6">
          <Metrics />
          <CertificatesUploadedChart />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <LastPreimpress />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
