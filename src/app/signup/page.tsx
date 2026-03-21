import { SignupClient } from "./components/SignupClient";
import { Metadata } from "next";

import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Join the Team | Pulse by Tela",
  description: "Create your author account to start publishing on Tela.",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] selection:bg-[#41cc00]/30 selection:text-[#093C15] relative overflow-hidden">
      <Suspense>
        <SignupClient />
      </Suspense>
    </div>
  );
}
