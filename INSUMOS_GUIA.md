# Sistema de Gestión de Insumos - Guía de Uso

## Descripción General

El sistema de gestión de insumos te permite:
1. **Crear insumos** - Agregar ingredientes/suministros necesarios para elaborar productos
2. **Vincular insumos a productos** - Especificar qué insumos necesita cada producto y en qué cantidad
3. **Descuento automático** - Al registrar una venta, los insumos se descontan automáticamente

## Ejemplo de Uso: Baguettes de Pizza

### Paso 1: Crear los Insumos

Ve a la pestaña **"Insumos"** y crea los siguientes insumos:

| Nombre | Unidad | Stock Inicial | Stock Mínimo | Costo por Unidad |
|--------|--------|---------------|--------------|------------------|
| Salsa de Pizza | kg | 10 | 2 | $5.00 |
| Queso Mozzarella | kg | 15 | 3 | $8.50 |
| Albahaca | g | 500 | 100 | $0.20 |
| Pepperoni | kg | 5 | 1 | $12.00 |
| Baguette | piezas | 20 | 5 | $2.00 |

### Paso 2: Vincular Insumos al Producto

1. Ve a la pestaña **"Vincular Insumos"**
2. Selecciona el producto **"Baguette de Pizza"**
3. Agrega cada insumo con su cantidad necesaria por unidad:

| Insumo | Cantidad Necesaria | Unidad |
|--------|-------------------|--------|
| Salsa de Pizza | 0.1 | kg |
| Queso Mozzarella | 0.15 | kg |
| Albahaca | 5 | g |
| Pepperoni | 0.05 | kg |
| Baguette | 1 | pieza |

### Paso 3: Registrar una Venta

1. Ve a la pestaña **"Ventas"**
2. Haz clic en **"+ Nueva Venta"**
3. Selecciona **"Baguette de Pizza"** y cantidad **5 unidades**
4. Registra la venta

### Paso 4: Resultado Automático

Cuando registres la venta de 5 baguettes, el sistema **automáticamente descuenta**:

- Salsa de Pizza: 0.5 kg (0.1 × 5)
- Queso Mozzarella: 0.75 kg (0.15 × 5)
- Albahaca: 25 g (5 × 5)
- Pepperoni: 0.25 kg (0.05 × 5)
- Baguette: 5 piezas (1 × 5)

Los stocks se actualizan automáticamente y aparecen en la pestaña **"Insumos"**.

## Monitoreo de Stock

En la pestaña **"Insumos"** puedes ver:
- **Estado del stock**: Bajo, Medio o Alto
- **Stock actual** vs **Stock mínimo**
- **Costo por unidad** de cada insumo

Cuando un insumo alcanza el stock mínimo, aparece en rojo para que lo reaproviciones.

## Flujo Automático de Descuento

```
Registra Venta
    ↓
Sistema obtiene insumos del producto
    ↓
Calcula cantidad a descontar = cantidad insumo × unidades vendidas
    ↓
Valida que hay stock suficiente
    ↓
Descuenta automáticamente del inventario
    ↓
Registra movimiento de insumos
    ↓
Actualiza totales de caja
```

## Consejos Prácticos

1. **Establece stock mínimo realista** - Calcula cuántas unidades necesitas para un día normal
2. **Actualiza precios regularmente** - El costo de insumos afecta tu margen de ganancia
3. **Monitorea el consumo** - Los movimientos de insumos te muestran qué productos consumen más recursos
4. **Realiza auditorías** - Compara stock teórico con stock real periódicamente
