"use client";
import React, { useState } from 'react'
import moment from 'moment';
import { Card, Divider } from 'antd';
import Image from 'next/image'
import { infoAprendices, infoBachillerato, infoProductivo, infoMilitar, infoSaberes, infoTrabajo } from './InfoFormPrograms';
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
            <div className="inces-bg"></div>

            <div className="w-full p-20">
                <div className="w-full flex flex-col justify-items-start md:flex-row gap-2 md:gap-6 my-3">
                    <Image src="/images/logo/MPPEducacion.png" width={180} height={40} alt="Logo MPPEducacion" className='hidden md:block'/>
                    <Image src="/images/logo/inces_logo.webp" width={120} height={40} alt="Logo INCES" className='mt-2 md:mt-0'/>
                </div>

                <div className="w-full px-4 grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
                    <Image src="/images/programas/acreditacion-de-saberes.png" alt="" width={220} height={0} onClick={() => showModal(infoSaberes)} className="w-full max-w-xs mx-auto cursor-pointer" />
                    <Image src="/images/programas/bachillerato-productivo.png" alt="" width={220} height={0} onClick={() => showModal(infoBachillerato)} className="w-full max-w-xs mx-auto cursor-pointer" />
                    <Image src="/images/programas/formacion-en-entidades-de-trabajo.png" alt="" width={220} height={0} onClick={() => showModal(infoTrabajo)} className="w-full max-w-xs mx-auto cursor-pointer" />
                    <Image src="/images/programas/formacion-productiva.png" alt="" width={220} height={0} onClick={() => showModal(infoProductivo)} className="w-full max-w-xs mx-auto cursor-pointer" />
                    <Image src="/images/programas/inces-militar.png" alt="" width={220} height={0} onClick={() => showModal(infoMilitar)} className="w-full max-w-xs mx-auto cursor-pointer" />
                    <Image src="/images/programas/programa-nacional-de-aprendices.png" alt="" width={220} height={0} onClick={() => showModal(infoAprendices)} className="w-full max-w-xs mx-auto cursor-pointer" />
                </div>

                <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-10 mt-8 mb-8 place-items-center">
                    <div className="flex flex-col items-center">
                        <Image src="/images/svg/001-data-management.svg" alt="" width={60} height={0} className="mb-2" />
                        <span className="text-center text-cyan-700 font-medium">Formación Técnica</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Image src="/images/svg/003-education.svg" alt="" width={60} height={0} className="mb-2" />
                        <span className="text-center text-cyan-700 font-medium">Conocimiento Digital</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Image src="/images/svg/005-project.svg" alt="" width={60} height={0} className="mb-2" />
                        <span className="text-center text-cyan-700 font-medium">Desarrollo personal y profesional</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Image src="/images/svg/007-repair.svg" alt="" width={60} height={0} className="mb-2" />
                        <span className="text-center text-cyan-700 font-medium">Herramientas productivas</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Image src="/images/svg/010-share.svg" alt="" width={60} height={0} className="mb-2" />
                        <span className="text-center text-cyan-700 font-medium">Uso de las Tic’s</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Image style={{ cursor: 'pointer' }} src="/images/svg/011-certificate.svg" alt="" width={60} height={0} className="mb-2" onClick={() => showModalCerticadeRequest()} />
                        <span className="text-center text-cyan-700 font-medium">Descarga de Certificado</span>
                    </div>
                </div>

                <div className="w-full grid sm:grid-cols-3 gap-3 my-8">
                    <Card className='max-w-[250px] sm:max-w-full' title="Conoce nuestra metodología educativa">
                        <p className="card-text sm:text-justify mt-3">En el INCES trazamos las líneas rectoras, que vinculan a la educación técnica con el ámbito laboral, para ofrecerte mayores oportunidades de estudio, trabajo y emprendimiento.</p>
                        <p className="card-text sm:text-justify mt-3">¿Cómo lo hacemos? <br /> Organizamos nuestras formaciones en Unidades Curriculares    reconocidas y homologables en las Universidades Experimentales del país. </p>
                        <p className="card-text sm:text-justify mt-3">Para incorporarte al Inces, te ofrecemos diversas modalidades formativas: presencial, semipresencial, a distancia (mediadas por las Tecnologías de la Información y la Comunicación) o solicitando el reconocimiento y acreditación de los saberes que has adquirido en el trabajo o a lo largo de la vida.</p>
                    </Card>

                     <Card title="Perfil Productivo">
                        <p className="card-text sm:text-justify mt-3">En el Inces, para configurar un perfil productivo/laboral combinamos un conjunto de Unidades Curriculares afines. De esta manera, podrás adquiririr conocimientos y experiencias, así como desarrollar habilidades y destrezas que te permitirán resolver problemas de tu entorno laboral.</p>
                        <p className="card-text sm:text-justify mt-3">
                            Desarrollar un perfil productivo/laboral te permitirá: <br />
                            - Actualizarte o especializarte. (Área laboral) <br />
                            - Desarrollar competencias. (Actividad productiva / laboral)<br />
                            - Formarte en una ocupación productiva. (Empresa o centro de trabajo).
                        </p>
                     </Card>
                    <Card title="Unidades curriculares">
                        <p className="card-text sm:text-justify mt-3">Como parte de nuestro proceso de transformación decidimos reorganizar las formaciones que te ofrecemos en Unidades Curriculares. Este cambio te garantiza:</p>
                        <p className="card-text sm:text-justify mt-3">La continuidad de estudios en universidades experimentales, al homologar las unidades curriculares que apruebes con las materias de tu plan de estudios.</p>
                        <p className="card-text sm:text-justify mt-3">Desarrollar competencias específicas a ejecutar tanto en el campo laboral como en tu vida personal.</p>
                        <p className="card-text sm:text-justify mt-3">Ofrece herramientas que te permitirán resolver problemas en tu entorno o contexto laboral.</p>
                    </Card>
                </div>
            </div>

            <div className="w-full bg-cyan-700 py-8 px-2">
                <div className="max-w-3/4 mx-auto">
                    <h4 className="text-white text-xl font-medium mb-8">Preguntas Frecuentes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-white">
                        <div className="flex flex-col items-center">
                            <span className="italic text-base mb-2 text-center">¿Puedo hacer dos cursos a la vez?</span>
                            <p className="text-center text-sm leading-relaxed">La plataforma te da la opción de inscribir hasta tres formaciones mensuales.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="italic text-base mb-2 text-center">¿Puedo participar desde cualquier parte del país?</span>
                            <p className="text-center text-sm leading-relaxed">Sí; sin embargo, en algunas especialidades requieren práctica presencial. En esos casos, la plataforma te da la información que requieres.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="italic text-base mb-2 text-center">¿Me dan certificación?</span>
                            <p className="text-center text-sm leading-relaxed">Sí. Una vez aprobadas todas las unidades curriculares de tu formación, podrás descargar o imprimir tu certificado INCES.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="italic text-base mb-2 text-center">¿A partir de qué edad puedo participar?</span>
                            <p className="text-center text-sm leading-relaxed">A partir de los 15 años en adelante.</p>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="w-full bg-cyan-700 py-4">
                <Divider className='bg-emerald-200' />
                <div className="max-w-7xl mx-auto">
                    <p className="text-center text-white text-md">Hecho para el Sitio Web INCES Copyright © {moment().format('YYYY')} Rif: G-20009922-4</p>
                </div>
            </footer>


            <ModalFormation show={openModal} data={dataModal} onHide={() => setOpenModal(!openModal)} action={() => setOpenModal(!openModal)} />
            <ModalCertificateRequest show={openModalCertificate} action={() => showModalCerticadeRequest()} />
        </>
    )
}

export default Landingpage
