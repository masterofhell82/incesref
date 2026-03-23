import React from 'react';
import Image from 'next/image';
import { Modal } from 'antd';

interface ModalFormationData {
    title?: string;
    description?: string;
}

interface ModalFormationProps {
    data?: ModalFormationData;
    show?: boolean;
    action?: () => void;
    onHide?: () => void;
}

const ModalFormation: React.FC<ModalFormationProps> = ({data = {}, show = false, action = () => {}, onHide = () => {} }) => {

    return <>
         <Modal
            title={
                <div className="flex items-center gap-5 my-4">
                    <Image src="/images/logo/inces_logo.webp" alt="" width={80} height={40} className="object-contain" style={{marginBottom: 0}} />
                    <span className="text-lg font-bold flex items-center uppercase mt-3" style={{lineHeight: '1.2'}}>
                        {data?.title}
                    </span>
                </div>
            }
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={show}
            onOk={action}
            okText="Aceptar"
            okButtonProps={{ size: 'large', color: 'cyan', className: 'btn-primary' }}
            onCancel={onHide}
            cancelText="Cancelar"
            cancelButtonProps={{ size: 'large', className: 'btn-secondary' }}
            width={600}
            style={{ top: 200 }}
        >
           <p className="p-5 text-justify font-outfit text-gray-700 text-base leading-8 ">
               {data?.description}
           </p>
        </Modal>
    </>;
};

export default ModalFormation;
