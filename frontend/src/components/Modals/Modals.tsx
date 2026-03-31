import React from 'react';

import { Modal } from 'antd';
import type { ModalProps } from 'antd';

const stylesFn: ModalProps['styles'] = (info) => {
  if (info.props.footer) {
    return {
      container: {
        borderRadius: 14,
        border: '1px solid #ccc',
        padding: 0,
        overflow: 'hidden',
      },
      header: {
        padding: 16,
      },
      body: {
        padding: 16,
      },
      footer: {
        padding: '16px 10px',
        backgroundColor: '#fafafa',
      },
    } satisfies ModalProps['styles'];
  }
  return {};
};

const Modals = ({
  title,
  width,
  isModalOpen,
  handleOk,
  handleCancel,
  endContent,
  footer,
  children,
}: {
  title: string;
  width?: number;
  isModalOpen: boolean;
  handleOk?: () => void;
  handleCancel?: () => void;
  endContent?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <Modal
      title={title}
      closable={{ 'aria-label': 'Custom Close Button' }}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      styles={stylesFn}
      width={width}
      footer={footer}
    >
      <hr style={{ margin: '0 0 16px 0' }} />
      {children}
      {footer === undefined && <div style={{ textAlign: 'right' }}>{endContent}</div>}
    </Modal>
  );
};

export default Modals;
