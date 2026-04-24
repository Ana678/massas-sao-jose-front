import { z } from "zod";
import type { Client } from "@/lib/types";

const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
const cepRegex = /^\d{5}-\d{3}$/;
const cnpj = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

const city = z.string().trim().min(2, "Cidade obrigatória").max(80);
const state = z.string().trim().length(2, "UF deve ter 2 letras");
const phone = z
    .string()
    .trim()
    .min(1, "Telefone obrigatório")
    .regex(phoneRegex, "Use (00) 00000-0000");
const cep = z
    .string()
    .trim()
    .regex(cepRegex, "CEP inválido (00000-000)")
    .optional()
    .or(z.literal(""));
const address = z.string().trim().max(150).min(2, "Endereço obrigatório");

export const simpleClientSchema = z.object({
    name: z.string().trim().min(2, "Nome obrigatório").max(100),
    phone,
    city,
    address,
    cep,
    state,
    cnpj: z.literal("").optional(),
    socialReason: z.literal("").optional(),
    stateInscription: z.literal("").optional(),
    needsInvoice: z.boolean().optional(),
});

export const businessClientSchema = z.object({
    name: z.string().trim().min(2, "Nome obrigatório").max(100),
    socialReason: z.string().trim().min(2, "Razão social obrigatória").max(120),
    cnpj: z
        .string()
        .trim()
        .min(1, "CNPJ obrigatório")
        .regex(cnpj, "CNPJ inválido (00.000.000/0000-00)"),
    stateInscription: z.string().trim().max(30).optional().or(z.literal("")),
    phone,
    city,
    address,
    cep,
    state,
    needsInvoice: z.boolean().optional(),
});

export type ClientFormType = "simple" | "business";

export function getClientSchema(type: ClientFormType) {
    return type === "business" ? businessClientSchema : simpleClientSchema;
}

export function isBusinessClient(c: Client): boolean {
    return !!(c.socialReason || (c.cnpj && c.cnpj.includes("/")));
}
