import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

// Structure commune à toutes les pages connectées
export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}