import React, { useState } from 'react';
import { post } from '@/Services/HttpRequest';
import { createCertificatesMasives } from '@/Services/EndPoints';
import Modals from '@/components/Modals/Modals';
import type { NotificationType } from '@/interface/NotificationInterface';
import type { UploadFile, UploadProps } from 'antd';
import { message, Upload, Button } from 'antd';
const { Dragger } = Upload;

import { FiInbox } from 'react-icons/fi';

const FormMasiveCerticates = ({
  preimpreso,
  isOpen,
  action,
  notify,
}: {
  preimpreso: string;
  isOpen: boolean;
  action: () => void;
  notify: (type: NotificationType, title: string, description: string) => void;
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  /* Header columns for CSV validation */
  const headerCsvColumn = [
    'PREIMPRESO',
    'MAESTRA',
    'CONSECUTIVO',
    'NACIONALIDAD',
    'CEDULA',
    'NOMBRES',
    'APELLIDOS',
    'TELEFONO',
    'CORREO',
    'NACIMIENTO',
    'GENERO',
    'CODIGO ASOCIADO',
  ] as const;

  const parseCsvLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  };

  const normalizeHeaderValue = (value: string): string =>
    value
      .replace(/^\uFEFF/, '')
      .trim()
      .toUpperCase();

  const isValidDateValue = (value: string): boolean => {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    }

    if (/^\d{2}[/-]\d{2}[/-]\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split(/[/-]/).map(Number);
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    }

    return false;
  };

  const isOnlyText = (value: string): boolean => /^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ\s]+$/.test(value.trim());

  const isValidDocumentId = (value: string): boolean =>
    /^(?=.{6,20}$)[A-Za-z0-9]+$/.test(value.trim());

  const getRowValidationError = (row: string[], rowNumber: number): string | null => {
    const [
      rowPreimpreso,
      maestra,
      consecutivo,
      nacionalidad,
      cedula,
      nombres,
      apellidos,
      telefono,
      correo,
      nacimiento,
      genero,
      codigoAsociado,
    ] = row.map((value) => value.trim());

    if (rowPreimpreso !== String(preimpreso).trim()) {
      return `La fila ${rowNumber} tiene un PREIMPRESO distinto al esperado (${preimpreso}).`;
    }

    if (!maestra) {
      return `La fila ${rowNumber} tiene MAESTRA vacía.`;
    }

    if (!consecutivo) {
      return `La fila ${rowNumber} tiene CONSECUTIVO vacío.`;
    }

    if (!/^[A-Za-z]$/.test(nacionalidad)) {
      return `La fila ${rowNumber} tiene NACIONALIDAD inválida (debe ser una sola letra).`;
    }

    if (!cedula || !isValidDocumentId(cedula)) {
      return `La fila ${rowNumber} tiene CEDULA inválida. Debe ser un documento sin espacios, comas, puntos, guiones ni nombres.`;
    }

    if (!nombres || !isOnlyText(nombres)) {
      return `La fila ${rowNumber} tiene NOMBRES inválido. Solo se permiten letras y espacios, sin números ni comas.`;
    }

    if (!apellidos || !isOnlyText(apellidos)) {
      return `La fila ${rowNumber} tiene APELLIDOS inválido. Solo se permiten letras y espacios, sin números ni comas.`;
    }

    if (!telefono) {
      return `La fila ${rowNumber} tiene TELEFONO vacío.`;
    }

    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return `La fila ${rowNumber} tiene CORREO inválido.`;
    }

    if (!isValidDateValue(nacimiento)) {
      return `La fila ${rowNumber} tiene NACIMIENTO inválido (formatos válidos: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY).`;
    }

    if (!/^[A-Za-z]$/.test(genero)) {
      return `La fila ${rowNumber} tiene GENERO inválido (debe ser una sola letra).`;
    }

    if (codigoAsociado && typeof codigoAsociado !== 'string') {
      return `La fila ${rowNumber} tiene CODIGO ASOCIADO inválido.`;
    }

    return null;
  };

  const props: UploadProps = {
    name: 'file',
    accept: '.csv',
    multiple: false,
    maxCount: 1,
    beforeUpload: async (file) => {
      const isValid = await validateContentFile(file);
      if (!isValid) {
        return Upload.LIST_IGNORE;
      }

      setFileList([file]);
      return false;
    },
    onChange(info) {
      setFileList(info.fileList.slice(-1));
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
    fileList,
  };

  const validateContentFile = async (file: File): Promise<boolean> => {
    const isCsv = file.name.toLowerCase().endsWith('.csv');
    if (!isCsv) {
      message.error('Solo se permiten archivos .csv');
      return false;
    }

    const fileContent = await file.text();

    const lines = fileContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      message.error('El archivo CSV está vacío');
      return false;
    }

    const firstRow = parseCsvLine(lines[0]).map(normalizeHeaderValue);
    const expectedHeader = headerCsvColumn.map(normalizeHeaderValue);

    if (firstRow.length !== expectedHeader.length) {
      message.error(
        'Encabezado inválido. El número de columnas no coincide con el formato esperado.'
      );
      return false;
    }

    const invalidHeader = expectedHeader.some((column, index) => firstRow[index] !== column);
    if (invalidHeader) {
      message.error(`Encabezado inválido. Orden esperado: ${headerCsvColumn.join(', ')}`);
      return false;
    }

    // Validar las filas de datos y su contenido por columna.
    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i]);
      if (row.length !== headerCsvColumn.length) {
        message.error(`La fila ${i + 1} tiene un número incorrecto de columnas.`);
        return false;
      }

      const rowError = getRowValidationError(row, i + 1);
      if (rowError) {
        message.error(rowError);
        return false;
      }
    }

    message.success('Archivo CSV validado correctamente.');
    return true;
  };

  const handleSubmit = async () => {
    try {
      const currentFile = fileList[0]?.originFileObj;
      const formData = new FormData();
      if (currentFile) {
        formData.append('file', currentFile);
        formData.append('preimpreso', preimpreso);
      } else {
        message.error('No se ha seleccionado ningún archivo.');
        return;
      }
      const response = await post(createCertificatesMasives(preimpreso), formData, true);
      notify('success', 'Éxito', response.message);
      action();
    } catch (error) {
      const e = error as unknown as { response: { data: { error: string } } };
      console.error('Error al cargar el archivo CSV:', e.response.data.error);
      notify(
        'error',
        'Error al cargar el archivo CSV:',
        `${e.response.data.error}. Por favor, inténtalo de nuevo.`
      );
    }
  };

  return (
    <>
      <Modals
        isModalOpen={isOpen}
        title={`Cargar Certificados Masivos - Preimpreso: ${preimpreso}`}
        handleCancel={action}
        handleOk={handleSubmit}
        width={600}
        footer={[
          <Button key="cancel" color="default" variant="outlined" onClick={action}>
            Cancelar
          </Button>,
          <Button key="submit" color="primary" variant="outlined" onClick={handleSubmit}>
            Cargar
          </Button>,
        ]}
      >
        <Dragger {...props}>
          <p className="ant-upload-drag-icon flex justify-center text-center">
            <FiInbox className="text-4xl" />
          </p>
          <p className="ant-upload-text">Haz clic o arrastra el archivo a esta área para subirlo</p>
          <p className="ant-upload-hint">
            Soporte para carga individual o masiva. Está estrictamente prohibido subir datos de la
            empresa u otros archivos prohibidos.
          </p>
        </Dragger>
      </Modals>
    </>
  );
};

export default FormMasiveCerticates;
