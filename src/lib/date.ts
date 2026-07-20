/**
 * `toISOString()` serializa em UTC: às 22h no horário de Brasília ele devolve a
 * data de amanhã. Como toda a aritmética de data do app usa os getters locais
 * (getDay/getDate/getMonth), a serialização também tem que ser local.
 */
export function toDateStr(date: Date = new Date()) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

/** Mesma ideia, no formato YYYY-MM. */
export function toMonthStr(date: Date = new Date()) {
	return toDateStr(date).slice(0, 7);
}
