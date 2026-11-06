import { Package, Boxes, AlertTriangle, XCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Título de la sección */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
        <p className="text-xs text-slate-500">Resumen general de tu inventario</p>
      </div>

      {/* 1. Tarjetas de Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Productos</span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1">245</div>
            <span className="text-[10px] text-[#10B981] font-semibold">+3 esta semana</span>
          </div>
          <div className="p-3 bg-cyan-50 text-[#0284C7] rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Stock disponible</span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1">1,850</div>
            <span className="text-[10px] text-slate-400 font-semibold">unidades totales</span>
          </div>
          <div className="p-3 bg-emerald-50 text-[#10B981] rounded-xl">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Stock bajo</span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1">12</div>
            <span className="text-[10px] text-[#F59E0B] font-semibold">12 desde ayer</span>
          </div>
          <div className="p-3 bg-amber-50 text-[#F59E0B] rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Agotados</span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1">4</div>
            <span className="text-[10px] text-[#EF4444] font-semibold">requieren acción</span>
          </div>
          <div className="p-3 bg-red-50 text-[#EF4444] rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Movimientos Recientes y Alertas de Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Movimientos Recientes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-[#0F172A]">Movimientos recientes</h2>
            <button className="text-xs text-[#0284C7] font-semibold hover:underline">Ver todos</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                  <th className="pb-3">Producto</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Cantidad</th>
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 font-medium text-[#0F172A]">Coca-Cola 600 ml</td>
                  <td className="py-3 text-[#10B981] font-semibold flex items-center gap-1">
                    <ArrowDownLeft className="w-3.5 h-3.5" /> Entrada
                  </td>
                  <td className="py-3 font-semibold">+30</td>
                  <td className="py-3 text-slate-500">Hoy</td>
                  <td className="py-3"><span className="bg-emerald-50 text-[#10B981] px-2 py-0.5 rounded-full font-semibold">Completado</span></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 font-medium text-[#0F172A]">Pepsi 600 ml</td>
                  <td className="py-3 text-[#EF4444] font-semibold flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> Salida
                  </td>
                  <td className="py-3 font-semibold text-[#EF4444]">-12</td>
                  <td className="py-3 text-slate-500">Hoy</td>
                  <td className="py-3"><span className="bg-emerald-50 text-[#10B981] px-2 py-0.5 rounded-full font-semibold">Completado</span></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 font-medium text-[#0F172A]">Agua 1 L</td>
                  <td className="py-3 text-[#10B981] font-semibold flex items-center gap-1">
                    <ArrowDownLeft className="w-3.5 h-3.5" /> Entrada
                  </td>
                  <td className="py-3 font-semibold">+20</td>
                  <td className="py-3 text-slate-500">Ayer</td>
                  <td className="py-3"><span className="bg-emerald-50 text-[#10B981] px-2 py-0.5 rounded-full font-semibold">Completado</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Alertas de Stock */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-[#0F172A]">Alertas de stock</h2>
            <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex justify-between font-semibold text-[#0F172A]">
                <span>Pepsi 600 ml</span>
                <span className="text-[#F59E0B]">Stock bajo</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">15 / 20 mín.</div>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex justify-between font-semibold text-[#0F172A]">
                <span>Agua 1 L</span>
                <span className="text-[#EF4444]">Agotado</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">0 / 15 mín.</div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex justify-between font-semibold text-[#0F172A]">
                <span>Jugo naranja 1 L</span>
                <span className="text-[#F59E0B]">Stock bajo</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">8 / 25 mín.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}