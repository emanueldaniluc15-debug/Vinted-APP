// Referencia de precio de fal.ai para FLUX.1 [dev] (puede cambiar): ~0,03 $ por megapíxel, redondeando al siguiente.
// Las imágenes se generan en formato cuadrado 1024×1024 (≈1 megapíxel).
export const PRICE_PER_MP = 0.03;
export const PRICE_PER_MP_TEXT = 'Precio estimado: 0,03 $ por megapíxel';
export const PRICE_PER_IMAGE_TEXT = 'Coste estimado: 0,03 $ por imagen';
export const PRICE_DISCLAIMER = 'Es solo una estimación basada en la tarifa publicada por fal.ai; el precio real puede cambiar según fal.ai.';

export function estimateCost(images) {
  const usd = Math.max(0, images) * PRICE_PER_MP; // 1024×1024 ≈ 1 MP por imagen
  return `${usd.toFixed(2).replace('.', ',')} $`;
}
