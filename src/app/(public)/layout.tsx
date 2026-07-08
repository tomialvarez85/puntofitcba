import type { ReactNode } from "react";
import CartDrawer from "@/components/public/CartDrawer";
import SiteFooter from "@/components/public/SiteFooter";
import SiteHeader from "@/components/public/SiteHeader";
import WhatsAppFloatingButton from "@/components/public/WhatsAppFloatingButton";
import { CartProvider } from "@/context/CartContext";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col text-zinc-900">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CartDrawer />
        <WhatsAppFloatingButton />
      </div>
    </CartProvider>
  );
}
