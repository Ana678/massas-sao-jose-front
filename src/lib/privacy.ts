import { useSyncExternalStore } from "react";

/**
 * Modo "esconder valores" (estilo app de banco): quando ligado, formatCurrency
 * devolve uma máscara no lugar do valor. Fica salvo no aparelho e vale para o
 * sistema todo; só se liga/desliga pelo olhinho da tela inicial.
 */
const STORAGE_KEY = "msj_hide_values";
export const HIDDEN_VALUE = "R$ •••••";

function readStored() {
    try {
        return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
        return false;
    }
}

let hidden = readStored();
const listeners = new Set<() => void>();

export function isHidingValues() {
    return hidden;
}

export function toggleHideValues() {
    hidden = !hidden;
    try {
        localStorage.setItem(STORAGE_KEY, hidden ? "1" : "0");
    } catch {
        // Sem storage (aba anônima etc.): vale só até recarregar.
    }
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/** Re-renderiza o componente quando o modo muda. */
export function useHideValues() {
    return useSyncExternalStore(subscribe, isHidingValues);
}
