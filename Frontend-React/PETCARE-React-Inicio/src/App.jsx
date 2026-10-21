import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Mascotas from "./pages/Mascotas";
import Especies from "./pages/Especies";
import Pagos from "./pages/Pagos";

function PantallaOriginal({ pagina, titulo }) {
  return <iframe key={pagina} title={titulo} src={`/legacy/${pagina}`} className="pantalla-original" />;
}
function ModulosReact() {
  return <div className="react-demo"><header><strong>PETCARE+ · React</strong><nav><NavLink to="/react">Dashboard</NavLink><NavLink to="/react/mascotas">Mascotas</NavLink><NavLink to="/react/especies">Especies</NavLink><NavLink to="/react/pagos">Pagos</NavLink><NavLink to="/panel">Panel original</NavLink></nav></header><Routes><Route index element={<Dashboard/>}/><Route path="mascotas" element={<Mascotas/>}/><Route path="especies" element={<Especies/>}/><Route path="pagos" element={<Pagos/>}/></Routes></div>;
}
export default function App() {
 return <BrowserRouter><Routes>
  <Route path="/" element={<PantallaOriginal pagina="index.html" titulo="Inicio PETCARE+"/>}/>
  <Route path="/login" element={<PantallaOriginal pagina="login.html" titulo="Acceso PETCARE+"/>}/>
  <Route path="/panel" element={<PantallaOriginal pagina="admin.html" titulo="Administración PETCARE+"/>}/>
  <Route path="/react/*" element={<ModulosReact/>}/>
  <Route path="*" element={<Navigate to="/" replace/>}/>
 </Routes></BrowserRouter>;
}
