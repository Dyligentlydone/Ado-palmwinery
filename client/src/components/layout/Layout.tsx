import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from '../WhatsAppButton';
import NavButtons from '../NavButtons';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <NavButtons />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
