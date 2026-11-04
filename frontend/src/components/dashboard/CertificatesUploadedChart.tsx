'use client';

import React, { useEffect, useState } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { monthlyCertificates } from '@/Services/EndPoints';
import { get } from '@/Services/HttpRequest';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

type MonthlyCertificate = {
  mes: string;
  certificados: number;
};

type MonthlyCertificatesResponse = {
  data: MonthlyCertificate[];
};

type LoadState = 'loading' | 'success' | 'error';

const isMonthlyCertificatesResponse = (
  value: unknown,
): value is MonthlyCertificatesResponse => {
  if (!value || typeof value !== 'object' || !('data' in value)) {
    return false;
  }

  const data = value.data;
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        item &&
        typeof item.mes === 'string' &&
        typeof item.certificados === 'number' &&
        Number.isFinite(item.certificados),
    )
  );
};

const numberFormatter = new Intl.NumberFormat('es-VE');

const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) =>
          `Certificados: ${numberFormatter.format(context.parsed.y ?? 0)}`,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      ticks: {
        color: '#6b7280',
        maxRotation: 0,
        minRotation: 0,
        autoSkip: true,
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      border: {
        display: false,
        dash: [4, 4],
      },
      grid: {
        color: 'rgba(107, 114, 128, 0.14)',
      },
      ticks: {
        color: '#6b7280',
        precision: 0,
        callback: (value) => numberFormatter.format(Number(value)),
      },
    },
  },
};

export default function CertificatesUploadedChart() {
  const [monthlyData, setMonthlyData] = useState<MonthlyCertificate[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      setLoadState('loading');

      try {
        const response: unknown = await get(monthlyCertificates);
        if (!isMonthlyCertificatesResponse(response)) {
          throw new Error('La respuesta del servidor tiene un formato inválido.');
        }

        if (isActive) {
          setMonthlyData(response.data);
          setLoadState('success');
        }
      } catch (error) {
        console.error('Error al cargar certificados mensuales:', error);
        if (isActive) {
          setLoadState('error');
        }
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, [retryCount]);

  const totalCertificates = monthlyData.reduce(
    (total, month) => total + month.certificados,
    0,
  );

  const chartData = {
    labels: monthlyData.map((month) => month.mes),
    datasets: [
      {
        data: monthlyData.map((month) => month.certificados),
        backgroundColor: '#465fff',
        hoverBackgroundColor: '#3641f5',
        borderRadius: 5,
        borderSkipped: false,
        maxBarThickness: 42,
      },
    ],
  };

  return (
    <section
      aria-labelledby="certificates-chart-title"
      className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
    >
      <header className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="certificates-chart-title"
            className="text-lg font-semibold text-gray-800 dark:text-white/90"
          >
            Certificados emitidos
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Últimos 12 meses
          </span>
        </div>
        {loadState === 'success' && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Total Certificados Cargados:{' '}
            <span className="font-semibold tabular-nums text-gray-800 dark:text-white/90">
              {numberFormatter.format(totalCertificates)}
            </span>
          </p>
        )}
      </header>

      {loadState === 'loading' && (
        <div
          role="status"
          className="flex h-64 items-end gap-3 px-2 pb-8 motion-reduce:animate-none sm:h-72"
        >
          <span className="sr-only">Cargando certificados mensuales</span>
          {[35, 58, 42, 75, 50, 30, 66, 45, 80, 38, 60, 48].map(
            (height, index) => (
              <div
                key={index}
                aria-hidden="true"
                className="flex-1 animate-pulse rounded-t bg-gray-100 motion-reduce:animate-none dark:bg-gray-800"
                style={{ height: `${height}%` }}
              />
            ),
          )}
        </div>
      )}

      {loadState === 'error' && (
        <div
          role="alert"
          className="flex min-h-64 flex-col items-center justify-center gap-3 text-center sm:min-h-72"
        >
          <p className="text-sm text-gray-600 dark:text-gray-300">
            No se pudieron cargar los certificados. Inténtalo de nuevo.
          </p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-brand-500 outline-none transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-white/5"
          >
            Reintentar
          </button>
        </div>
      )}

      {loadState === 'success' && monthlyData.length === 0 && (
        <p className="flex min-h-64 items-center justify-center text-sm text-gray-500 dark:text-gray-400 sm:min-h-72">
          No hay datos disponibles para este período.
        </p>
      )}

      {loadState === 'success' && monthlyData.length > 0 && (
        <>
          <div className="relative h-64 sm:h-72">
            <Bar
              aria-label={`Gráfico de barras de certificados emitidos por mes. Total del período: ${numberFormatter.format(totalCertificates)}.`}
              role="img"
              data={chartData}
              options={chartOptions}
            />
          </div>
        </>
      )}

    </section>
  );
}
