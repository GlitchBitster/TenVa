"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1A1028",
            color: "#F5F0FF",
            border: "1px solid rgba(107, 33, 168, 0.3)",
          },
          duration: 3000,
        }}
      />
    </SessionProvider>
  );
}
