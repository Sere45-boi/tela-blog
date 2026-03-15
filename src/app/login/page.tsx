import { LoginClient } from "./components/LoginClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Tela Admin",
  description: "Secure login for the Tela administration panel.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoginClient />
    </div>
  );
}
