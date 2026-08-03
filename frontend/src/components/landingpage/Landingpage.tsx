'use client';
import moment from 'moment';
import React, { useState } from 'react';
import { Card, Divider } from 'antd';
import Image from 'next/image';
import {
  infoAprendices,
  infoBachillerato,
  infoProductivo,
  infoMilitar,
  infoSaberes,
  infoTrabajo,
} from './InfoFormPrograms';
import ModalFormation from '@/components/Modals/ModalFormation';
import ModalCertificateRequest from '@/components/Modals/ModalCertificateRequest';

const Landingpage = () => {
  /* const [isCongrats, setIsCongrats] = useState<boolean>(false); */
  const [dataModal, setDataModal] = useState({});
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openModalCertificate, setOpenModalCertificate] = useState<boolean>(false);

  const showModal = (data = {}) => {
    setDataModal(data);
    setOpenModal(!openModal);
  };

  const showModalCerticadeRequest = () => {
    setOpenModalCertificate(!openModalCertificate);
  };

  return (
    <>
      <div className="w-full p-20">
        <div className="my-3 flex w-full flex-col justify-items-start gap-2 md:flex-row md:gap-6">
          <Image
            src="/images/logo/MPPEducacion.png"
            width={180}
            height={40}
            alt="Logo MPPEducacion"
            className="hidden md:block"
          />
          <Image
            src="/images/logo/inces_logo.webp"
            width={120}
            height={40}
            alt="Logo INCES"
            className="mt-2 md:mt-0"
          />
        </div>

        <div className="grid w-full grid-cols-2 gap-6 px-4 md:grid-cols-3 md:gap-10">
          <Image
            src="/images/programas/acreditacion-de-saberes.png"
            alt=""
            width={220}
            height={0}
            onClick={() => showModal(infoSaberes)}
            className="mx-auto w-full max-w-xs cursor-pointer"
          />
          <Image
            src="/images/programas/bachillerato-productivo.png"
            alt=""
            width={220}
            height={0}
            onClick={() => showModal(infoBachillerato)}
            className="mx-auto w-full max-w-xs cursor-pointer"
          />
          <Image
            src="/images/programas/formacion-en-entidades-de-trabajo.png"
            alt=""
            width={220}
            height={0}
            onClick={() => showModal(infoTrabajo)}
            className="mx-auto w-full max-w-xs cursor-pointer"
          />
          <Image
            src="/images/programas/formacion-productiva.png"
            alt=""
            width={220}
            height={0}
            onClick={() => showModal(infoProductivo)}
            className="mx-auto w-full max-w-xs cursor-pointer"
          />
          <Image
            src="/images/programas/inces-militar.png"
            alt=""
            width={220}
            height={0}
            onClick={() => showModal(infoMilitar)}
            className="mx-auto w-full max-w-xs cursor-pointer"
          />
          <Image
            src="/images/programas/programa-nacional-de-aprendices.png"
            alt=""
            width={220}
            height={0}
            onClick={() => showModal(infoAprendices)}
            className="mx-auto w-full max-w-xs cursor-pointer"
          />
        </div>

        <div className="mt-8 mb-8 grid w-full grid-cols-2 place-items-center gap-6 md:grid-cols-3 md:gap-10 lg:grid-cols-6">
          <div className="flex flex-col items-center">
            <Image
              src="/images/svg/001-data-management.svg"
              alt=""
              width={60}
              height={0}
              className="mb-2"
            />
            <span className="text-center font-medium text-cyan-700">Formación Técnica</span>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src="/images/svg/003-education.svg"
              alt=""
              width={60}
              height={0}
              className="mb-2"
            />
            <span className="text-center font-medium text-cyan-700">Conocimiento Digital</span>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src="/images/svg/005-project.svg"
              alt=""
              width={60}
              height={0}
              className="mb-2"
            />
            <span className="text-center font-medium text-cyan-700">
              Desarrollo personal y profesional
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Image src="/images/svg/007-repair.svg" alt="" width={60} height={0} className="mb-2" />
            <span className="text-center font-medium text-cyan-700">Herramientas productivas</span>
          </div>
          <div className="flex flex-col items-center">
            <Image src="/images/svg/010-share.svg" alt="" width={60} height={0} className="mb-2" />
            <span className="text-center font-medium text-cyan-700">Uso de las Tic’s</span>
          </div>
          <div className="flex flex-col items-center">
            <Image
              style={{ cursor: 'pointer' }}
              src="/images/svg/011-certificate.svg"
              alt=""
              width={60}
              height={0}
              className="mb-2"
              onClick={() => showModalCerticadeRequest()}
            />
            <span className="text-center font-medium text-cyan-700">Descarga de Certificado</span>
          </div>
        </div>

        <div className="my-8 grid w-full gap-3 sm:grid-cols-3">
          <Card
            className="max-w-[250px] sm:max-w-full"
            title="Conoce nuestra metodología educativa"
          >
            <p className="card-text mt-3 sm:text-justify">
              En el INCES trazamos las líneas rectoras, que vinculan a la educación técnica con el
              ámbito laboral, para ofrecerte mayores oportunidades de estudio, trabajo y
              emprendimiento.
            </p>
            <p className="card-text mt-3 sm:text-justify">
              ¿Cómo lo hacemos? <br /> Organizamos nuestras formaciones en Unidades Curriculares
              reconocidas y homologables en las Universidades Experimentales del país.{' '}
            </p>
            <p className="card-text mt-3 sm:text-justify">
              Para incorporarte al Inces, te ofrecemos diversas modalidades formativas: presencial,
              semipresencial, a distancia (mediadas por las Tecnologías de la Información y la
              Comunicación) o solicitando el reconocimiento y acreditación de los saberes que has
              adquirido en el trabajo o a lo largo de la vida.
            </p>
          </Card>

          <Card title="Perfil Productivo">
            <p className="card-text mt-3 sm:text-justify">
              En el Inces, para configurar un perfil productivo/laboral combinamos un conjunto de
              Unidades Curriculares afines. De esta manera, podrás adquiririr conocimientos y
              experiencias, así como desarrollar habilidades y destrezas que te permitirán resolver
              problemas de tu entorno laboral.
            </p>
            <p className="card-text mt-3 sm:text-justify">
              Desarrollar un perfil productivo/laboral te permitirá: <br />
              - Actualizarte o especializarte. (Área laboral) <br />
              - Desarrollar competencias. (Actividad productiva / laboral)
              <br />- Formarte en una ocupación productiva. (Empresa o centro de trabajo).
            </p>
          </Card>
          <Card title="Unidades curriculares">
            <p className="card-text mt-3 sm:text-justify">
              Como parte de nuestro proceso de transformación decidimos reorganizar las formaciones
              que te ofrecemos en Unidades Curriculares. Este cambio te garantiza:
            </p>
            <p className="card-text mt-3 sm:text-justify">
              La continuidad de estudios en universidades experimentales, al homologar las unidades
              curriculares que apruebes con las materias de tu plan de estudios.
            </p>
            <p className="card-text mt-3 sm:text-justify">
              Desarrollar competencias específicas a ejecutar tanto en el campo laboral como en tu
              vida personal.
            </p>
            <p className="card-text mt-3 sm:text-justify">
              Ofrece herramientas que te permitirán resolver problemas en tu entorno o contexto
              laboral.
            </p>
          </Card>
        </div>
      </div>
      <div className="w-full bg-cyan-700 px-2 py-8">
        <div className="mx-auto max-w-3/4">
          <h4 className="mb-8 text-xl font-medium text-white">Preguntas Frecuentes</h4>
          <div className="grid grid-cols-1 gap-8 text-white md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center">
              <span className="mb-2 text-center text-base italic">
                ¿Puedo hacer dos cursos a la vez?
              </span>
              <p className="text-center text-sm leading-relaxed">
                La plataforma te da la opción de inscribir hasta tres formaciones mensuales.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className="mb-2 text-center text-base italic">
                ¿Puedo participar desde cualquier parte del país?
              </span>
              <p className="text-center text-sm leading-relaxed">
                Sí; sin embargo, en algunas especialidades requieren práctica presencial. En esos
                casos, la plataforma te da la información que requieres.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className="mb-2 text-center text-base italic">¿Me dan certificación?</span>
              <p className="text-center text-sm leading-relaxed">
                Sí. Una vez aprobadas todas las unidades curriculares de tu formación, podrás
                descargar o imprimir tu certificado INCES.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className="mb-2 text-center text-base italic">
                ¿A partir de qué edad puedo participar?
              </span>
              <p className="text-center text-sm leading-relaxed">
                A partir de los 15 años en adelante.
              </p>
            </div>
          </div>
        </div>
      </div>
      <footer className="w-full bg-cyan-700 py-4">
        <Divider className="bg-emerald-200" />
        <div className="mx-auto max-w-7xl">
          <p className="text-md text-center text-white">
            Hecho para el Sitio Web INCES Copyright © {moment().format('YYYY')} Rif: G-20009922-4
          </p>
        </div>
      </footer>
      <ModalFormation
        show={openModal}
        data={dataModal}
        onHide={() => setOpenModal(!openModal)}
        action={() => setOpenModal(!openModal)}
      />
      <ModalCertificateRequest
        show={openModalCertificate}
        action={() => showModalCerticadeRequest()}
      />
    </>
  );
};

export default Landingpage;
