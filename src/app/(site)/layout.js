import { CartProvider } from "@/context/CartContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";

export default function SiteLayout({ children }) {
  return (
    <CustomerAuthProvider>
      <FavoritesProvider>
        <CartProvider>
          <Navbar />
          <CartSidebar />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </FavoritesProvider>
    </CustomerAuthProvider>
  );
}
