import React, { useState } from 'react';
import Image from 'next/image';
import { Modal, Button, Input } from 'antd';
import { getPersonById, getCertificateById, viewCertificate } from '@/Services/EndPoints';
import { get } from '@/Services/HttpRequest';
import { FaRegFilePdf } from 'react-icons/fa';

const ModalCertificateRequest = ({ show = false, action = () => {} }) => {
  const [dataSource, setDataSource] = useState<{
    nombres?: string;
    apellidos?: string;
    correo?: string;
  }>({});
  type Certificate = {
    certificateWebId: string;
    course: string;
  };

  const [listOfCertificate, setListOfCertificate] = useState<Certificate[]>([]);
  const [alert, setAlert] = useState(false);

  const handleChange = async (id_person: string) => {
    try {
      const getPerson = getPersonById(id_person);
      const getCertificate = getCertificateById(id_person);
      const res = await get(getPerson);

      if (Object.keys(res).length > 0) {
        setAlert(false);
        setDataSource(res.data);
        const certificates = await get(getCertificate);
        if (Object.keys(certificates).length > 0) {
          setListOfCertificate(certificates.data);
        }
      } else {
        setAlert(true);
        setDataSource({});
      }
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object' &&
        (error as { response?: { data?: { code?: string } } }).response?.data?.code === 'PNF001'
      ) {
        setAlert(true);
        setDataSource({});
      }

      setListOfCertificate([]);
    }
  };

  return (
    <>
      <Modal
        title={
          <div className="my-4 flex items-center gap-5">
            <Image
              src="/images/logo/inces_logo.webp"
              alt=""
              width={80}
              height={40}
              className="object-contain"
              style={{ marginBottom: 0 }}
            />
            <span
              className="mt-3 flex items-center text-lg font-bold uppercase"
              style={{ lineHeight: '1.2' }}
            >
              Certificados del Participante
            </span>
          </div>
        }
        open={show}
        width={600}
        closeIcon={false}
        style={{ top: 180 }}
        footer={
          <Button size="large" className="btn-primary me-3" onClick={action}>
            Aceptar
          </Button>
        }
      >
        <div className="mt-2 flex flex-col gap-4 p-5">
          <div className="flex items-center gap-4">
            <label htmlFor="" className="w-32 font-medium text-gray-700">
              Cédula:
            </label>
            <Input.Search size="large" onSearch={handleChange} />
          </div>
          {alert && <span className="ml-4 px-3 py-1 text-red-500">No se encontró el usuario</span>}
          <div className="flex items-center gap-4">
            <span className="w-32 font-medium text-gray-700">Nombre y Apellidos:</span>
            <span className="flex-1 text-gray-500 italic">{`${dataSource.nombres || ''} ${dataSource.apellidos || ''}`}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-32 font-medium text-gray-700">Correo:</span>
            <span className="flex-1 text-gray-500 italic">{dataSource.correo || ''}</span>
          </div>
          <div className="flex items-start gap-4">
            <span className="mt-1 w-32 font-medium text-gray-700">Certificados:</span>
            <div className="flex flex-1 flex-col gap-2">
              {listOfCertificate.length > 0 ? (
                listOfCertificate.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FaRegFilePdf className="text-red-500" />
                    <a
                      href={viewCertificate(item.certificateWebId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-cyan-700 hover:underline"
                    >
                      {item.course}
                    </a>
                  </div>
                ))
              ) : (
                <span className="mt-2 text-red-500">Participante no posee Certificado</span>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ModalCertificateRequest;
