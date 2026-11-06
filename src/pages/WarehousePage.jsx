import { ArrowDownLeft, ArrowUpRight, Package, ScanLine } from 'lucide-react';

export default function WarehousePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Módulo de Operaciones de Almacén</h1>
        <p className="text-xs text-slate-500">Gestión rápida de registros, entradas y salidas de mercancía</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="p-4 bg-emerald-50 text-[#10B981] rounded-full mb-3">
            <ArrowDownLeft className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-[#0F172A]">Registrar Entrada</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Ingreso de nuevos productos o reabastecimiento</p>
          <button className="w-full py-2 bg-[#10B981] text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition">
            + Nueva Entrada
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="p-4 bg-red-50 text-[#EF4444] rounded-full mb-3">
            <ArrowUpRight className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-[#0F172A]">Registrar Salida</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Despacho o retiro de mercancía del inventario</p>
          <button className="w-full py-2 bg-[#EF4444] text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition">
            - Nueva Salida
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="p-4 bg-cyan-50 text-[#0284C7] rounded-full mb-3">
            <ScanLine className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-[#0F172A]">Escanear Código</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Consulta rápida de existencias e información</p>
          <button className="w-full py-2 bg-[#0284C7] text-white rounded-lg text-xs font-semibold hover:bg-cyan-600 transition">
            Escáner QR / SKU
          </button>
        </div>
      </div>
    </div>
  );
}