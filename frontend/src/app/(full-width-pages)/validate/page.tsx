import React, { Suspense } from 'react';
import { Metadata } from 'next';
import CertificateVerification from './CertificateVerification';

export const metadata: Metadata = {
  title: 'Inces - ValidarCertificados',
};

const page = () => {
  return (
    <Suspense fallback={null}>
      <CertificateVerification />
    </Suspense>
  );
};

export default page;
