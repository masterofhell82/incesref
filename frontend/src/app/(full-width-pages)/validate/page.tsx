import React from 'react';
import { Metadata } from 'next';
import CertificateVerification from './CertificateVerification';

export const metadata: Metadata = {
  title: 'Inces - ValidarCertificados',
};

const page = () => {
  return (
    <>
      <CertificateVerification />
    </>
  );
};

export default page;
