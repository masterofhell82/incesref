
import type { Metadata } from 'next';
import React from "react";
import Dashboard from './Dashboard';

export const metadata: Metadata = {
  title: 'Dashboard / INCES',
};

export default function Ecommerce() {
  return (
    <>
      <Dashboard />
    </>
  );
}
