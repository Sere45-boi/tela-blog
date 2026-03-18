import { LoginClient } from "./components/LoginClient";
import { Metadata } from "next";

import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login | Tela Admin",
  description: "Secure login for the Tela administration panel.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] selection:bg-[#41cc00]/30 selection:text-[#093C15] relative overflow-hidden">
      <Suspense>
        <LoginClient />
      </Suspense>
    </div>
  );
}
