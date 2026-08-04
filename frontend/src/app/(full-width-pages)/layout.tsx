import Image from 'next/image';
import { Divider } from 'antd';
import moment from 'moment';
export default function FullWidthPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="inces-bg"></div>
      <div className="w-full flex-1 px-4 sm:px-8 md:px-20">
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
        <div className="my-10">{children}</div>
      </div>

      <footer className="w-full bg-cyan-700 py-4">
        <Divider className="bg-emerald-200" />
        <div className="mx-auto max-w-7xl">
          <p className="text-md text-center text-white">
            Hecho para el Sitio Web INCES Copyright © {moment().format('YYYY')} Rif: G-20009922-4
          </p>
        </div>
      </footer>
    </div>
  );
}
