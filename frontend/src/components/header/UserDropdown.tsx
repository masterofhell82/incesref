'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { DropdownItem } from '../ui/dropdown/DropdownItem';
import { logout } from '@/Services/Authentications';
import { LuChevronDown } from 'react-icons/lu';
import { CgArrowsExchange } from 'react-icons/cg';
import { PiSignOutFill } from 'react-icons/pi';

import { useSelector } from 'react-redux';
import store from '@/context/store';
type RootState = ReturnType<typeof store.getState>;

import { NotificationType } from '@/interface/NotificationInterface';
import { notification } from 'antd';
import FormChangePass from '@/app/(admin)/config/users/FormChangePass';

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [openChangePassModal, setOpenChangePassModal] = useState(false);

  const auth = useSelector((state: RootState) => state.auth);
  const currentUserId = typeof auth?.userId === 'number' ? auth.userId : null;

  const person = (auth?.person ?? {}) as {
    nombres?: string;
    apellidos?: string;
    correo?: string;
  };

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const username = auth?.username ? `@${auth.username}` : '@';
  const fullName = `${person.nombres ?? ''} ${person.apellidos ?? ''}`.trim();
  const email = person.correo ?? '';

  const openNotificationWithIcon = (type: NotificationType, title: string, description: string) => {
    api[type]({
      title,
      description,
      showProgress: true,
    });
  };

  const handleCloseForm = () => {
    setOpenChangePassModal(false);
  };

  /* Modal de cambio de contraseña */
  const handleChangePass = () => {
    setOpenChangePassModal(true);
  };

  return (
    <>
      {contextHolder}
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="dropdown-toggle flex items-center text-gray-700 dark:text-gray-400"
        >
          <span className="text-theme-sm mr-1 block font-medium">{username}</span>
          <LuChevronDown
            className={`${isOpen ? 'rotate-180' : ''} text-lg transition-transform duration-300`}
          />
        </button>

        <Dropdown
          isOpen={isOpen}
          onClose={closeDropdown}
          className="shadow-theme-lg dark:bg-gray-dark absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800"
        >
          <div className="px-4">
            <span className="text-theme-sm block font-medium text-gray-700 dark:text-gray-400">
              {fullName}
            </span>
            <span className="text-theme-xs mt-0.5 block text-gray-500 dark:text-gray-400">
              {email}
            </span>
          </div>

          <ul className="flex flex-col gap-1 border-b border-gray-200 pt-4 pb-3 dark:border-gray-800">
            <li>
              <DropdownItem
                onItemClick={() => {
                  closeDropdown();
                  handleChangePass();
                }}
                tag="a"
                href="#"
                className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                <CgArrowsExchange className="fill-gray-500 text-2xl group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" />
                Cambio de Contraseña
              </DropdownItem>
            </li>
          </ul>
          <Link
            href=""
            onClick={logout}
            className="group text-theme-sm mt-3 flex items-center gap-3 rounded-lg px-5 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            <PiSignOutFill className="fill-gray-500 text-2xl group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" />
            Cerrar sesión
          </Link>
        </Dropdown>
      </div>
      {openChangePassModal && currentUserId !== null && (
        <FormChangePass
          isOpen={openChangePassModal}
          action={handleCloseForm}
          data={{ id: currentUserId }}
          notify={openNotificationWithIcon}
        />
      )}
    </>
  );
}
