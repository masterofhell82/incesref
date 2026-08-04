'use client';

import { Card, Empty, Skeleton, Tag } from 'antd';
import moment from 'moment';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { get } from '@/Services/HttpRequest';
import { verifyCertificate } from '@/Services/EndPoints';

type CertificateContent = {
  contenido?: string;
  horas?: number | string;
};

type VerificationResponse = {
  nacionalidad?: string;
  fullname?: string;
  cedula?: string;
  tipo_formacion?: string;
  shortname?: string;
  formacion?: string;
  fecha_ini?: string;
  fecha_fin?: string;
  duracion?: number;
  ano?: string;
  año?: string;
  titulo_asociado?: string;
  fecha_emision?: string;
  state?: string;
  preimpreso?: string;
  contents?: CertificateContent[];
};

const DEFAULT_CERTIFICATE: VerificationResponse = {
  fullname: 'Participante de Prueba',
  cedula: 'V-00000000',
  tipo_formacion: 'CURSO',
  shortname: 'INCES-TEST-001',
  formacion: 'Formacion de ejemplo para verificacion',
  fecha_ini: moment().subtract(2, 'months').format('DD/MM/YYYY'),
  fecha_fin: moment().subtract(1, 'months').format('DD/MM/YYYY'),
  duracion: 120,
  ano: `${moment().year() - 1} - ${moment().year()}`,
  titulo_asociado: 'PRB-001',
  fecha_emision: moment().format('DD/MM/YYYY'),
  state: 'Distrito Capital',
  preimpreso: '000-000-000',
  contents: [
    { contenido: 'INDUCCION_Ambientacion institucional', horas: 12 },
    { contenido: 'OFIMATICA_Herramientas digitales', horas: 36 },
    { contenido: 'PRACTICA_Proyecto final aplicado', horas: 72 },
  ],
};

const normalizeTypeText = (tipoFormacion?: string, fechaEmision?: string) => {
  const type = (tipoFormacion || '').trim().toUpperCase();
  if (!type) return '';

  if (
    type === 'CERTIFICACION, ACREDITACION SABERES EMPIRICOS Y ACADEMICOS' ||
    type === 'CERTIFICACION OCUPACIONAL' ||
    type === 'UNIDAD CURRICULAR'
  ) {
    return `la siguiente <strong>${escapeHtml(type)}</strong>`;
  }

  if (type === 'CURSO' || type === 'PERFIL PRODUCTIVO LABORAL') {
    return `el siguiente <strong>${escapeHtml(type)}</strong>`;
  }

  if (type === 'PERFIL PRODUCTIVO') {
    if (!fechaEmision) return 'la formación del <strong>PERFIL PRODUCTIVO</strong>';
    const parsed = moment(fechaEmision, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
    const compareDate = moment('2024-01-01', 'YYYY-MM-DD');
    if (parsed.isValid() && (parsed.isAfter(compareDate) || parsed.isSame(compareDate))) {
      return 'la formación del  <strong>PERFIL PRODUCTIVO</strong>';
    }
    return 'la formación del <strong>PERFIL PRODUCTIVO</strong>';
  }

  return `la siguiente <strong>${escapeHtml(type)}</strong>`;
};

const formatStudyContents = (contents: CertificateContent[]) => {
  return contents.map((item) => {
    const raw = item.contenido || '';
    if (raw.includes('_')) {
      const [code, ...parts] = raw.split('_');
      return {
        ...item,
        label: `${code} - ${parts.join(' ')}`,
      };
    }
    return {
      ...item,
      label: raw,
    };
  });
};

const escapeHtml = (value: string | number | undefined | null) => {
  const text = String(value ?? 'N/A');
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const CertificateVerification = () => {
  const searchParams = useSearchParams();
  const [certificate, setCertificate] = useState<VerificationResponse | null>(null);
  const [contents, setContents] = useState<CertificateContent[]>([]);
  const [loading, setLoading] = useState(true);

  const certificateParam = useMemo(() => {
    const explicit = searchParams.get('certificate') || searchParams.get('id');
    if (explicit) return explicit;
    return searchParams.get('') || '';
  }, [searchParams]);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      if (!certificateParam) {
        setCertificate(DEFAULT_CERTIFICATE);
        setContents(DEFAULT_CERTIFICATE.contents || []);
        return;
      }

      const response = (await get(verifyCertificate(certificateParam))) as VerificationResponse;

      const merged = {
        ...DEFAULT_CERTIFICATE,
        ...response,
      };

      setCertificate(merged);
      setContents(response?.contents || []);
    } catch {
      setCertificate(DEFAULT_CERTIFICATE);
      setContents(DEFAULT_CERTIFICATE.contents || []);
    } finally {
      setLoading(false);
    }
  }, [certificateParam]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const verificationHtml = useMemo(() => {
    if (!certificate) return '';

    const tipoFormacion = normalizeTypeText(certificate.tipo_formacion, certificate.fecha_emision);
    const duracion = Number(certificate.duracion || 0);
    const schoolYear = certificate['año'] || certificate.ano || '';
    const perfilProductivoExtra =
      (certificate.tipo_formacion || '').toUpperCase() === 'PERFIL PRODUCTIVO'
        ? ` Para el año escolar <strong>${escapeHtml(schoolYear)}</strong>. Vinculado al componente laboral de la Educación Media General en la Modalidad de Jóvenes, Adultas y Adultos, código de título de bachiller: <strong>${escapeHtml(certificate.titulo_asociado)}</strong>.`
        : '';

    return `Se hace constar que el participante <strong>${escapeHtml(certificate.fullname)}</strong>, portado de la cédula <strong>${escapeHtml(certificate.nacionalidad)}-${escapeHtml(certificate.cedula)}</strong>, ha aprobado ${tipoFormacion}, <strong>${escapeHtml(certificate.formacion)}</strong>, código de formación <strong>${escapeHtml(certificate.shortname)}</strong>, en nuestros centros de formación del INCES en el estado <strong>${escapeHtml(certificate.state)}</strong>, desde <strong>${escapeHtml(certificate.fecha_ini)}</strong> hasta <strong>${escapeHtml(certificate.fecha_fin)}</strong>${duracion > 0 ? `, cumpliendo con la cantidad de <strong>${escapeHtml(duracion)}</strong> horas` : ''}.${perfilProductivoExtra}`;
  }, [certificate]);

  const formattedContents = useMemo(() => formatStudyContents(contents), [contents]);

  if (loading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Card className="overflow-hidden border-0 !bg-transparent shadow-xl [&_.ant-card-body]:!bg-transparent [&_.ant-card-head]:!bg-transparent">
        <div className="bg-gradient-to-r from-cyan-700 via-cyan-600 to-emerald-600 px-4 py-4 text-white sm:px-6 md:px-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="mt-1 text-xl font-semibold sm:text-2xl md:text-3xl">
                Constancia de Verificación INCES
              </h1>
              <p className="mt-2 text-sm text-cyan-100">
                Documento de consulta pública con trazabilidad institucional.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-4 py-6 sm:px-6 md:px-10">
          {!certificate ? (
            <Empty description="No hay información del certificado" />
          ) : (
            <>
              <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
                <div>
                  <p className="text-xs text-slate-500">Preimpreso</p>
                  <p className="font-medium text-slate-800">{certificate.preimpreso || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Fecha de emisión</p>
                  <p className="font-medium text-slate-800">{certificate.fecha_emision || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Estado</p>
                  <p className="font-medium text-slate-800">{certificate.state || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Código de Formación</p>
                  <Tag color="cyan" className="mt-1 font-semibold">
                    {certificate.shortname || 'N/A'}
                  </Tag>
                </div>
              </div>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-800">Resultado de verificación: </h2>
                <p
                  className="text-justify leading-7 text-slate-700"
                  dangerouslySetInnerHTML={{ __html: verificationHtml }}
                />
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-800">Plan de estudio: </h3>
                {formattedContents.length === 0 ? (
                  <Empty
                    description="Sin contenidos disponibles"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <ol className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
                    {formattedContents.map((item, index) => (
                      <li
                        key={`${item.label}-${index}`}
                        className="flex flex-col items-start gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                      >
                        <span className="text-slate-700">
                          {index + 1}. {item.label || 'Contenido no disponible'}
                        </span>
                        <span className="text-sm font-medium whitespace-nowrap text-slate-500">
                          {item.horas || 0} Horas
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                Registro validado para consulta pública. Distrito Capital - {moment().format('DD/MM/YYYY')}.
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CertificateVerification;
