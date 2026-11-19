import { useEffect, useState } from 'react'
import { usePreferencias } from '../../hooks/usePreferencias'
import { COLORES, TIPOGRAFIAS } from '../../lib/preferencias'
import { IDIOMAS, t } from '../../i18n'
import { fmtFecha, fmtNum } from '../../lib/formato'
import Alert from '../../components/ui/Alert'
import BadgeEstado from '../../components/ui/BadgeEstado'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Icon from '../../components/ui/Icon'

// Grupo de opciones tipo "radio" con botones grandes
function Opciones({ etiqueta, icono, valor, opciones, onCambiar, columnas = 'sm:grid-cols-3' }) {
  return (
    <fieldset>
      <legend className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
        <Icon name={icono} className="h-4 w-4 text-brand-tech" />
        {etiqueta}
      </legend>
      <div className={`grid grid-cols-2 gap-2 ${columnas}`}>
        {opciones.map((o) => {
          const activo = valor === o.valor
          return (
            <button
              key={o.valor}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => onCambiar(o.valor)}
              style={o.estilo}
              className={`relative flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                activo ? 'bg-sky-50 font-semibold text-ink ring-2 ring-brand-tech' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-slate-300'
              }`}
            >
              {o.prefijo}
              <span className="min-w-0">
                <span className="block truncate">{o.texto}</span>
                {o.ayuda && <span className="block truncate text-xs font-normal text-slate-500">{o.ayuda}</span>}
              </span>
              {activo && <Icon name="check" className="ml-auto h-4 w-4 shrink-0 text-brand-tech" />}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

const rgb = (tripleta) => `rgb(${tripleta.replace(/ /g, ',')})`

export default function PreferenciasPage() {
  const { pref, cambiar, restablecer } = usePreferencias()
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    if (!aviso) return
    const id = setTimeout(() => setAviso(null), 4000)
    return () => clearTimeout(id)
  }, [aviso])

  async function aplicar(cambios) {
    const enCuenta = await cambiar(cambios)
    setAviso(enCuenta ? { tipo: 'exito', texto: t('pref.guardado') } : { tipo: 'info', texto: t('pref.soloLocal') })
  }

  async function reiniciar() {
    const enCuenta = await restablecer()
    setAviso(enCuenta ? { tipo: 'exito', texto: t('pref.guardado') } : { tipo: 'info', texto: t('pref.soloLocal') })
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        {aviso && <Alert tipo={aviso.tipo}>{aviso.texto}</Alert>}

        <Card titulo={t('pref.apariencia')} subtitulo={t('pref.aparienciaSub')}>
          <div className="space-y-6">
            <Opciones
              etiqueta={t('pref.tema')} icono="luna" valor={pref.tema} onCambiar={(v) => aplicar({ tema: v })}
              opciones={[
                { valor: 'claro', texto: t('pref.claro'), prefijo: <Icon name="sol" className="h-4 w-4 shrink-0" /> },
                { valor: 'oscuro', texto: t('pref.oscuro'), prefijo: <Icon name="luna" className="h-4 w-4 shrink-0" /> },
                { valor: 'sistema', texto: t('pref.sistema'), ayuda: t('pref.sistemaAyuda'), prefijo: <Icon name="dashboard" className="h-4 w-4 shrink-0" /> },
              ]}
            />

            <Opciones
              etiqueta={t('pref.color')} icono="paleta" valor={pref.color} onCambiar={(v) => aplicar({ color: v })}
              columnas="sm:grid-cols-4"
              opciones={Object.entries(COLORES).map(([clave, c]) => ({
                valor: clave,
                texto: t(`pref.colores.${clave}`),
                prefijo: (
                  <span className="flex shrink-0 overflow-hidden rounded-full ring-1 ring-black/10" aria-hidden="true">
                    <span className="h-5 w-2.5" style={{ background: rgb(c.brand) }} />
                    <span className="h-5 w-2.5" style={{ background: rgb(c.tech) }} />
                  </span>
                ),
              }))}
            />

            <Opciones
              etiqueta={t('pref.tipografia')} icono="texto" valor={pref.tipografia} onCambiar={(v) => aplicar({ tipografia: v })}
              opciones={Object.entries(TIPOGRAFIAS).map(([clave, f]) => ({
                valor: clave,
                texto: clave === 'sistema' ? t('pref.sistema') : f.nombre,
                ayuda: 'Aa Bb 123',
                estilo: { fontFamily: `${f.familia}, system-ui, sans-serif` },
              }))}
            />

            <Opciones
              etiqueta={t('pref.tamano')} icono="texto" valor={pref.tamano} onCambiar={(v) => aplicar({ tamano: v })}
              opciones={[
                { valor: 'pequeno', texto: t('pref.pequeno'), prefijo: <span className="w-5 shrink-0 text-center text-xs font-bold">A</span> },
                { valor: 'normal', texto: t('pref.normal'), prefijo: <span className="w-5 shrink-0 text-center text-sm font-bold">A</span> },
                { valor: 'grande', texto: t('pref.grande'), prefijo: <span className="w-5 shrink-0 text-center text-lg font-bold leading-none">A</span> },
              ]}
            />
          </div>
        </Card>

        <Card titulo={t('pref.idioma')} subtitulo={t('pref.idiomaAyuda')}>
          <Opciones
            etiqueta={t('pref.idioma')} icono="idioma" valor={pref.idioma} onCambiar={(v) => aplicar({ idioma: v })}
            columnas="sm:grid-cols-2"
            opciones={Object.entries(IDIOMAS).map(([clave, nombre]) => ({ valor: clave, texto: nombre, ayuda: clave === 'es' ? 'es-MX' : 'en-US' }))}
          />
        </Card>

        <div className="flex justify-end">
          <Button variante="suave" onClick={reiniciar}>{t('pref.restablecer')}</Button>
        </div>
      </div>

      {/* Vista previa en vivo */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <Card titulo={t('pref.vistaPrevia')} subtitulo={t('pref.vistaTexto')}>
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{t('pref.ejemploProducto')}</p>
                  <p className="font-mono text-xs text-slate-500">7501234567890</p>
                </div>
                <BadgeEstado estado="STOCK_BAJO" />
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {t('comun.existencia')}: <span className="font-bold tabular-nums text-ink">{fmtNum(1234.5)}</span>
              </p>
              <p className="text-xs text-slate-500">{fmtFecha(new Date().toISOString())}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button">{t('pref.botonPrimario')}</Button>
              <Button type="button" variante="suave">{t('pref.botonSecundario')}</Button>
            </div>
            <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-tech hover:underline">
              {t('comun.verTodos')} <Icon name="chevron" className="h-3 w-3" />
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
