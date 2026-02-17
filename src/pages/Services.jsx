import { Link, Outlet } from 'react-router-dom'

export default function Services() {
  return (
    <section className="max-w-6xl mx-auto py-12 px-4">
      <div className="bg-gray-800 rounded-xl p-8 shadow-md">
        <h1 className="text-3xl font-bold text-white">Servicios</h1>
        <p className="mt-2 text-gray-300">Servicios ofrecidos por Luprintech.</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="desarrollo-web" className="p-6 bg-linear-to-r from-indigo-600 to-violet-600 rounded-lg text-white">Desarrollo Web</Link>
          <Link to="inteligencia-artificial" className="p-6 bg-linear-to-r from-purple-600 to-pink-600 rounded-lg text-white">Inteligencia Artificial</Link>
          <Link to="soporte-ti" className="p-6 bg-linear-to-r from-blue-600 to-cyan-600 rounded-lg text-white">Soporte TI</Link>
          <Link to="impresion-3d" className="p-6 bg-linear-to-r from-green-600 to-teal-500 rounded-lg text-white">Impresión 3D</Link>
        </div>

        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </section>
  )
}
