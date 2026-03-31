import React, { useState } from 'react';
import { post } from '@/Services/HttpRequest';
import { cfs } from '@/Services/EndPoints';
import Modals from '@/components/Modals/Modals';
import type { NotificationType } from '@/interface/CoreInterfaces';
import type { UploadFile, UploadProps } from 'antd';
import { message, Upload } from 'antd';
const { Dragger } = Upload;

import { FiInbox } from 'react-icons/fi';

const FormMasiveCore = ({
  isOpen,
  action,
  notify,
}: {
  isOpen: boolean;
  action: () => void;
  notify: (type: NotificationType, title: string, description: string) => void;
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  /* Header columns for CSV validation */
  const headerCsvColumn = [
    'id_estado',
    'id_municipios',
    'id_parroquias',
    'codigo',
    'nombre',
    'direccion',
    'id_ambito',
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

    const firstRow = parseCsvLine(lines[0]);

    const missingColumns = headerCsvColumn.filter((col) => !firstRow.includes(col));
    if (missingColumns.length > 0) {
      message.error(`Encabezado inválido. Falta(n): ${missingColumns.join(', ')}`);
      return false;
    }

    // Validar las siguientes líneas para verificar que tengan el mismo número de columnas que el encabezado y cumpla con el tipo de dato es el esperado.
    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i]);
      if (row.length !== headerCsvColumn.length) {
        message.error(`La fila ${i + 1} tiene un número incorrecto de columnas.`);
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
      } else {
        message.error('No se ha seleccionado ningún archivo.');
        return;
      }
      const response = await post(`${cfs}/masive`, formData, true);
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
    <div>
      <Modals
        isModalOpen={isOpen}
        title="Cargar Masivo de Centros de Formación"
        handleCancel={action}
        handleOk={handleSubmit}
        width={600}
      >
        <Dragger {...props}>
          <p className="ant-upload-drag-icon flex justify-center text-center">
            <FiInbox className="text-4xl" />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for a single or bulk upload. Strictly prohibited from uploading company data or
            other banned files.
          </p>
        </Dragger>
      </Modals>
    </div>
  );
};

export default FormMasiveCore;
