"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import { createClient } from "@/lib/lib/client";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [checkingAdmin, setCheckingAdmin] =
    useState(true);

  const [isAdmin, setIsAdmin] =
    useState(false);

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const supabase = createClient();

        const {
          data: userData,
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !userData.user) {
          setIsAdmin(false);
          router.replace("/auth");
          return;
        }

        const user = userData.user;

      const {
  data: adminUser,
  error: adminError,
} = await supabase
  .from("admin_users")
  .select("user_id")
  .eq("user_id", user.id)
  .maybeSingle();

if (adminError) {
  console.error(adminError);
  router.replace("/account");
  return;
}

if (!adminUser) {
  router.replace("/account");
  return;
}

setIsAdmin(true);

        setIsAdmin(true);
      } catch (error) {
        console.error(
          "ADMIN ACCESS CHECK ERROR:",
          error
        );

        setIsAdmin(false);
        router.replace("/account");
      } finally {
        setCheckingAdmin(false);
      }
    }

    checkAdminAccess();
  }, [router, pathname]);
    if (checkingAdmin) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fffaf8",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "#4b0d20",
          }}
        >
          <div
            style={{
              width: "65px",
              height: "65px",
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #741638",
              borderRadius: "50%",
              fontFamily: "Georgia, serif",
              fontSize: "30px",
            }}
          >
            P
          </div>

          <p
            style={{
              fontSize: "10px",
              letterSpacing: "4px",
            }}
          >
            PARADISE COLLECTION
          </p>

          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontWeight: "400",
            }}
          >
            Verifying Admin Access...
          </h2>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}