import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio de sesión",
  description: "Esta es la página de inicio de sesión de Next.js TailAdmin Dashboard Template",
};

export default function SignIn() {
  return <SignInForm />;
}
