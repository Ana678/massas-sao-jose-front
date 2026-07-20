export type DiscountType = "PERCENT" | "VALUE";

export const DEFAULT_DISCOUNT_TYPE: DiscountType = "VALUE";

/**
 * A UI trabalha com "preço final por unidade" — o desconto é sempre derivado dele.
 * O que o usuário escolhe no seletor é só a UNIDADE em que esse desconto vai ser
 * gravado: percentual ou reais por unidade.
 */
export function buildDiscount(
	originalPrice: number,
	customPrice?: number,
	discountType: DiscountType = DEFAULT_DISCOUNT_TYPE,
) {
	const original = Number(originalPrice) || 0;
	const custom = customPrice === undefined ? original : Number(customPrice) || 0;

	// A API rejeita desconto negativo ou maior que o preço unitário.
	const off = Math.min(Math.max(original - custom, 0), original);

	if (discountType === "PERCENT") {
		const percent = original > 0 ? (off / original) * 100 : 0;
		return { discount: Number(percent.toFixed(2)), discountType };
	}

	return { discount: Number(off.toFixed(2)), discountType };
}

/**
 * Preço unitário líquido. Pedidos antigos vêm como PERCENT, então o default
 * quando o campo não existe tem que ser PERCENT — não o default de escrita.
 */
export function netUnitPrice(
	originalPrice: number,
	discount?: number,
	discountType: DiscountType = "PERCENT",
) {
	const price = Number(originalPrice) || 0;
	const value = Number(discount) || 0;
	if (value <= 0) return price;

	return discountType === "VALUE"
		? Math.max(price - value, 0)
		: price * (1 - value / 100);
}

/** Rótulo curto do desconto: "-5,71%" ou "-R$ 0,20". */
export function formatDiscount(
	discount: number,
	discountType: DiscountType = "PERCENT",
) {
	const value = Number(discount) || 0;

	if (discountType === "VALUE") {
		return `-${value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
	}

	// Sem arredondar pra inteiro: 5,71% precisa aparecer como 5,71%, não 6%.
	return `-${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}
