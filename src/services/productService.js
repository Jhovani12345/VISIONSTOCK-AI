import { supabase } from './supabase';

// Obtener catálogo completo de productos con existencias de inventario
export const getProductosConInventario = async () => {
  const { data, error } = await supabase
    .from('producto')
    .select(`
      *,
      inventario (
        cantidad_actual,
        fecha_actualizacion
      )
    `)
    .order('id_producto', { ascending: false });

  if (error) throw error;
  return data;
};

// Crear producto e inicializar su inventario
export const crearProducto = async (productoData) => {
  // 1. Insertar en producto
  const { data: nuevoProducto, error: errorProd } = await supabase
    .from('producto')
    .insert([
      {
        codigo_barras: productoData.codigo_barras,
        nombre: productoData.nombre,
        descripcion: productoData.descripcion,
        unidad_medida: productoData.unidad_medida || 'PIEZA',
        stock_minimo: parseInt(productoData.stock_minimo, 10) || 0,
        activo: true
      }
    ])
    .select()
    .single();

  if (errorProd) throw errorProd;

  // 2. Inicializar registro en la tabla inventario
  const { error: errorInv } = await supabase
    .from('inventario')
    .insert([
      {
        id_producto: nuevoProducto.id_producto,
        cantidad_actual: parseInt(productoData.cantidad_inicial, 10) || 0
      }
    ]);

  if (errorInv) throw errorInv;

  return nuevoProducto;
};

// Actualizar información básica del producto
export const actualizarProducto = async (id_producto, productoData) => {
  const { data, error } = await supabase
    .from('producto')
    .update({
      codigo_barras: productoData.codigo_barras,
      nombre: productoData.nombre,
      descripcion: productoData.descripcion,
      unidad_medida: productoData.unidad_medida,
      stock_minimo: parseInt(productoData.stock_minimo, 10),
      activo: productoData.activo
    })
    .eq('id_producto', id_producto)
    .select();

  if (error) throw error;
  return data;
};