import { Routes } from "react-router-dom";
import { appRoutes } from "./routes";
import "./styles/globals.css";

function Layout({ children }: { children: React.ReactNode }) {
  
  return (
    <div className="layout-container">
      <header className="layout-header">DoYouRemember</header>
      <main className="layout-content">{children}</main>
      <footer className="layout-footer">© 2025</footer>
    </div>
  );
}

export default function App() {
  // No dupliques rutas aquí: solo renderiza appRoutes.
  return (
    <Layout>
      <Routes>{appRoutes}</Routes>
    </Layout>
  );
}
