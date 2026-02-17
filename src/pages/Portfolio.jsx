import { Link, Outlet } from 'react-router-dom'

export default function Portfolio() {
  return (
    <section className="max-w-6xl mx-auto py-12 px-4">
      <div className="bg-gray-800 rounded-xl p-8 shadow-md">
        <h1 className="text-3xl font-bold text-white">Portfolio</h1>
        <p className="mt-2 text-gray-300">Explora trabajos y proyectos.</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="desarrollo-web" className="block p-6 bg-linear-to-r from-indigo-600 to-violet-600 rounded-lg text-white hover:opacity-95">
            Desarrollo Web
          </Link>
          <Link to="creaciones-3d" className="block p-6 bg-linear-to-r from-blue-600 to-cyan-600 rounded-lg text-white hover:opacity-95">
            Creaciones 3D
          </Link>
        </div>

        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </section>
  )
}
