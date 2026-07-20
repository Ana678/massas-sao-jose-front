import jsPDF from "jspdf";
import { netUnitPrice } from "@/lib/discount";
import { toDateStr } from "@/lib/date";
import autoTable from "jspdf-autotable";
import type { Order, Expense, Client } from "./types";
import { formatCurrency } from "./utils";
import logoUrl from "@/assets/logo.svg";

// Cores da marca (RGB)
const NAVY: [number, number, number] = [19, 34, 69];
const CREAM: [number, number, number] = [242, 237, 228];
const GREEN: [number, number, number] = [61, 92, 58];
const RED: [number, number, number] = [169, 65, 50];
const MUTED: [number, number, number] = [120, 110, 95];

async function addLogo(doc: jsPDF) {
    try {
        const logoImage = new Image();
        logoImage.src = logoUrl;
        await logoImage.decode();

        const scale = 6;
        const width = 24 * scale;
        const height = logoImage.naturalHeight * (width / logoImage.naturalWidth);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) return;

        context.drawImage(logoImage, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/png");
        doc.addImage(dataUrl, "png", 14, 6, 28, 18.64);
    } catch (error) {
        console.warn("Logo render failed, continuing without it.", error);
    }
}

async function header(doc: jsPDF, title: string, subtitle: string) {
    // Faixa superior
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, 210, 32, "F");

    // Logo textual (Massas São José)
    await addLogo(doc);

    doc.setTextColor(255, 255, 255);
    // Título do relatório
    doc.setFontSize(11);
    doc.text(title.toUpperCase(), 196, 14, { align: "right" });
    doc.setFontSize(8);
    doc.text(subtitle, 196, 20, { align: "right" });

    // Reset
    doc.setTextColor(0, 0, 0);
}

function footer(doc: jsPDF) {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        doc.text(
            `Gerado em ${new Date().toLocaleString("pt-BR")} · Página ${i} de ${pageCount}`,
            105,
            290,
            { align: "center" }
        );
    }
}

function formatBRL(v: number) {
    return formatCurrency(v);
}

/** Pedidos do dia */
export async function exportOrdersPDF(orders: Order[], date: Date = new Date()) {
    const doc = new jsPDF();
    const dateStr = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
    await header(doc, "Pedidos do Dia", dateStr);

    // Resumo
    const totalPaid = orders.filter((o) => o.isPaid);
    const total = totalPaid.reduce((s, o) => s + o.total, 0);
    const itens = totalPaid.reduce(
        (s, o) => s + o.products.reduce((a, i) => a + Number(i.quantity), 0),
        0
    );

    doc.setFillColor(...CREAM);
    doc.roundedRect(14, 38, 182, 22, 3, 3, "F");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("PEDIDOS", 22, 45);
    doc.text("ITENS VENDIDOS", 92, 45);
    doc.text("FATURAMENTO", 162, 45);

    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(String(orders.length), 22, 54);
    doc.text(String(itens), 92, 54);
    doc.setTextColor(...GREEN);
    doc.text(formatBRL(total), 162, 54);
    doc.setFont("helvetica", "normal");

    // Tabela
    const rows = orders.map((o) => [
        new Date(o.createdAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        }),
        o.clientName,
        o.products.map((i) => `${i.quantity}x ${i.name}`).join(", "),
        o.paymentMethod.toUpperCase(),
        o.isPaid ? "Concluído" : "Cancelado",
        formatBRL(o.total),
    ]);

    autoTable(doc, {
        startY: 68,
        head: [["Hora", "Cliente", "Itens", "Forma", "Status", "Total"]],
        body: rows,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [250, 247, 242] },
        columnStyles: {
            0: { cellWidth: 18 },
            3: { cellWidth: 18 },
            4: { cellWidth: 22 },
            5: { cellWidth: 26, halign: "left" },
        },
    });

    footer(doc);
    doc.save(`pedidos-${toDateStr(date)}.pdf`);
}

/** Fechamento mensal: receita, despesas, lucro, breakdown */
export async function exportMonthlyClosingPDF(
    orders: Order[],
    expenses: Expense[],
    monthKey: string // YYYY-MM
) {
    const doc = new jsPDF();
    const [y, m] = monthKey.split("-").map(Number);
    const monthName = new Date(y, m - 1, 1).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
    });
    await header(doc, "Fechamento Mensal", monthName);

    const monthOrders = orders.filter(
        (o) => o.createdAt.startsWith(monthKey) && o.isPaid
    );
    const monthExpenses = expenses.filter((e) => e.createdAt.toString().startsWith(monthKey));
    const revenue = monthOrders.reduce((s, o) => s + Number(o.total), 0);
    const costs = monthExpenses.reduce((s, e) => s + Number(e.value), 0);
    const profit = revenue - costs;

    // Cards principais
    doc.setFillColor(...CREAM);
    doc.roundedRect(14, 38, 182, 28, 3, 3, "F");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("RECEITA", 22, 46);
    doc.text("DESPESAS", 82, 46);
    doc.text("LUCRO LÍQUIDO", 142, 46);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...GREEN);
    doc.text(formatBRL(revenue), 22, 56);
    doc.setTextColor(...RED);
    doc.text(formatBRL(costs), 82, 56);
    doc.setTextColor(...(profit >= 0 ? NAVY : RED));
    doc.text(formatBRL(profit), 142, 56);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.setFontSize(8);
    doc.text(`${monthOrders.length} pedidos`, 22, 62);
    doc.text(`${monthExpenses.length} lançamentos`, 82, 62);
    doc.text(
        `Margem: ${revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0"}%`,
        142,
        62
    );

    // Despesas por categoria
    const byCat: Record<string, number> = {};
    monthExpenses.forEach((e) => {
        byCat[e.category] = (byCat[e.category] || 0) + Number(e.value);
    });
    const catRows = Object.entries(byCat).map(([k, v]) => [
        k,
        `${costs > 0 ? ((v / costs) * 100).toFixed(0) : 0}%`,
        formatBRL(v),
    ]);

    doc.setTextColor(...NAVY);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Despesas por Categoria", 14, 78);
    doc.setFont("helvetica", "normal");

    autoTable(doc, {
        startY: 82,
        head: [["Categoria", "%", "Total"]],
        body: catRows.length ? catRows : [["Sem despesas no período", "—", "—"]],
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: NAVY, textColor: 255 },
        columnStyles: {
            1: { cellWidth: 24, halign: "left" },
            2: { cellWidth: 36, halign: "left" },
        },
    });

    // Detalhamento de pedidos
    const ordersStartY = (doc as unknown as { lastAutoTable: { finalY: number } })
        .lastAutoTable.finalY + 8;
    doc.setTextColor(...NAVY);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Pedidos do Mês", 14, ordersStartY);
    doc.setFont("helvetica", "normal");

    const orderRows = monthOrders.map((o) => [
        new Date(o.createdAt).toLocaleDateString("pt-BR"),
        o.clientName,
        // quantity vem como string da API: sem Number() o + vira concatenação ("01515")
        o.products.reduce((s, i) => s + Number(i.quantity), 0),
        o.paymentMethod,
        formatBRL(o.total),
    ]);

    autoTable(doc, {
        startY: ordersStartY + 4,
        head: [["Data", "Cliente", "Itens", "Pagto", "Total"]],
        body: orderRows.length ? orderRows : [["—", "Sem pedidos no período", "", "", ""]],
        styles: { fontSize: 9, cellPadding: 2.5 },
        headStyles: { fillColor: NAVY, textColor: 255 },
        alternateRowStyles: { fillColor: [250, 247, 242] },
        columnStyles: {
            0: { cellWidth: 22 },
            2: { cellWidth: 14, halign: "left" },
            3: { cellWidth: 22 },
            4: { cellWidth: 30, halign: "left" },
        },
    });

    footer(doc);
    doc.save(`fechamento-${monthKey}.pdf`);
}

/** Dashboard Financeiro: período arbitrário com totais, breakdown e mês a mês */
export interface FinancialPeriodData {
    periodLabel: string;
    monthly: { name: string; receita: number; despesa: number; lucro: number }[];
    totals: { revenue: number; costs: number; profit: number; ordersCount: number; expensesCount: number };
    byCategory: { name: string; value: number; pct: number }[];
}

export async function exportFinancialDashboardPDF(data: FinancialPeriodData) {
    const doc = new jsPDF();
    await header(doc, "Dashboard Financeiro", data.periodLabel);

    const { totals } = data;

    // Cards principais
    doc.setFillColor(...CREAM);
    doc.roundedRect(14, 38, 182, 28, 3, 3, "F");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("RECEITA", 22, 46);
    doc.text("DESPESAS", 82, 46);
    doc.text("LUCRO LÍQUIDO", 142, 46);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...GREEN);
    doc.text(formatBRL(totals.revenue), 22, 56);
    doc.setTextColor(...RED);
    doc.text(formatBRL(totals.costs), 82, 56);
    doc.setTextColor(...(totals.profit >= 0 ? NAVY : RED));
    doc.text(formatBRL(totals.profit), 142, 56);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.setFontSize(8);
    doc.text(`${totals.ordersCount} pedidos`, 22, 62);
    doc.text(`${totals.expensesCount} lançamentos`, 82, 62);
    doc.text(
        `Margem: ${totals.revenue > 0 ? ((totals.profit / totals.revenue) * 100).toFixed(1) : "0"}%`,
        142,
        62
    );

    // Mês a mês
    doc.setTextColor(...NAVY);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Evolução Mensal", 14, 78);
    doc.setFont("helvetica", "normal");

    const monthRows = data.monthly.map((m) => [
        m.name,
        formatBRL(m.receita),
        formatBRL(m.despesa),
        formatBRL(m.lucro),
    ]);

    autoTable(doc, {
        startY: 82,
        head: [["Mês", "Receita", "Despesa", "Lucro"]],
        body: monthRows.length ? monthRows : [["—", "—", "—", "—"]],
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [250, 247, 242] },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { halign: "left" },
            2: { halign: "left" },
            3: { halign: "left" },
        },
    });

    // Despesas por categoria
    const catStartY = (doc as unknown as { lastAutoTable: { finalY: number } })
        .lastAutoTable.finalY + 8;
    doc.setTextColor(...NAVY);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Despesas por Categoria", 14, catStartY);
    doc.setFont("helvetica", "normal");

    const catRows = data.byCategory.map((c) => [c.name, `${c.pct.toFixed(0)}%`, formatBRL(Number(c.value))]);

    autoTable(doc, {
        startY: catStartY + 4,
        head: [["Categoria", "%", "Total"]],
        body: catRows.length ? catRows : [["Sem despesas no período", "—", "—"]],
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: NAVY, textColor: 255 },
        columnStyles: {
            1: { cellWidth: 24, halign: "left" },
            2: { cellWidth: 36, halign: "left" },
        },
    });

    footer(doc);
    const safeLabel = data.periodLabel.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    doc.save(`dashboard-financeiro-${safeLabel}.pdf`);
}

export async function exportOrderPDF(order: Order, client?: Client) {
  const doc = new jsPDF();
  const dateStr = new Date(order.createdAt).toLocaleString("pt-BR", {
    timeZone: "America/Fortaleza",
    hour12: false,
    day: "2-digit", month: "long", year: "numeric",
  });

  await header(doc, "Detalhamento do Pedido", dateStr);

  // Cliente
  doc.setFillColor(...CREAM);
  doc.roundedRect(14, 38, 182, 22, 3, 3, "F");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("CLIENTE", 22, 46);
  doc.text("PAGAMENTO", 122, 46);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...NAVY);
  doc.text(order.clientName, 22, 54);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const pagto = `${order.paymentMethod.toUpperCase()} · ${order.isPaid ? "Pago" : "Em aberto"}`;
  doc.text(pagto, 122, 54);
  if (client) {
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`${client.address} — ${client.city}/${client.state}`, 22, 60);
  }

  // Itens
  const rows = order.products.map((i) => {
    const priceUnit = netUnitPrice(Number(i.price || 0), i.discount, i.discountType).toFixed(2);

    // const priceCell = priceUnit < i.price - 0.01
    //   ? `${formatBRL(i.price)} (por ${formatBRL(priceUnit)})`
    //   : formatBRL(i.price);

    const total = Number(priceUnit) * i.quantity;

    return [
      i.name,
      String(i.quantity),
      formatBRL(Number(priceUnit)),
      formatBRL(total),
    ];
  });

  autoTable(doc, {
    startY: 68,
    head: [["Produto", "Qtd", "Preço Unitário", "Subtotal"]],
    body: rows,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 247, 242] },
    columnStyles: {
      1: { cellWidth: 16, halign: "left" },
      2: { cellWidth: 50, halign: "left" },
      3: { cellWidth: 36, halign: "left" },
    },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // Total
//   const subtotalSemDesc = order.products.reduce((s, i) => {
//     const orig = (i as { originalUnitPrice?: number }).originalUnitPrice ?? i.price;
//     return s + orig * i.quantity;
//   }, 0);
  //const desconto = subtotalSemDesc - order.total;

  doc.setFillColor(...CREAM);
  doc.roundedRect(110, finalY + 6, 86, 16, 3, 3, "F");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
//   if (desconto > 0.01) {
//     doc.text("Subtotal", 116, finalY + 13);
//     doc.text(formatBRL(subtotalSemDesc), 192, finalY + 13, { align: "right" });
//     doc.setTextColor(...RED);
//     doc.text("Desconto", 116, finalY + 20);
//     doc.text(`- ${formatBRL(desconto)}`, 192, finalY + 20, { align: "right" });
//     doc.setTextColor(...NAVY);
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(12);
//     doc.text("TOTAL", 116, finalY + 30);
//     doc.text(formatBRL(order.total), 192, finalY + 30, { align: "right" });
//   } else {
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL", 116, finalY + 13);
    doc.text(formatBRL(order.total), 192, finalY + 13, { align: "right" });
  //}

  footer(doc);
  doc.save(`Pedido ${order.clientName} - ${dateStr.substring(0, 10)}.pdf`);
}

/** Monta mensagem WhatsApp do pedido */
export function buildOrderWhatsAppMessage(order: Order, client?: Client): string {
  const dateStr = new Date(order.createdAt).toLocaleString("pt-BR", {
    timeZone: "America/Fortaleza",
    hour12: false,
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  const lines: string[] = [];
  lines.push(`*Massas São José* — Pedido`);
  lines.push(`\uD83D\uDCC5 ${dateStr}`);
  lines.push(`\uD83D\uDC64 ${order.clientName}`);
  if (client?.address) lines.push(`\uD83D\uDCCD ${client.address}, ${client.city}/${client.state}`);

  lines.push("");
  lines.push("*Itens:*");
  let subtotal = 0;
  order.products.forEach((i) => {

    const priceUnit = netUnitPrice(Number(i.price || 0), i.discount, i.discountType).toFixed(2);

    const totalProduct =  Number(priceUnit) * i.quantity;

    lines.push(`• ${i.quantity}× ${i.name} ->  ${formatBRL(Number(priceUnit))} cada, total ${formatBRL(totalProduct)}`);
    /*lines.push(
        ` ->  ${(priceUnit < i.price - 0.01 ? `~${formatBRL(i.price)}~ ${formatBRL(priceUnit)}` : formatBRL(priceUnit))}`
      + ` = ${formatBRL(total)}`
    )*/

    subtotal += totalProduct;
  });
  //const desconto = subtotal - order.total;

  lines.push("");
//   if (desconto > 0.01) {
//     lines.push(`Subtotal: ${formatCurrency(subtotal)}`);
//     lines.push(`Desconto: -${formatCurrency(desconto)}`);
//   }
  lines.push(`*Total: ${formatCurrency(order.total)}*`);
  lines.push(`Pagamento: ${order.paymentMethod.toUpperCase()} (${order.isPaid ? "pago" : "em aberto"})`);
  return lines.join("\n");
}

/** Abre WhatsApp Web/App com mensagem do pedido */
export function shareOrderWhatsApp(order: Order, client?: Client) {
  let msg = buildOrderWhatsAppMessage(order, client);
  msg = msg
    .replace(/\u00A0/g, " ")
    .replace(/\u202F/g, " ")
    .replace(/—/g, "-")
    .replace(/•/g, "-")
    .replace(/×/g, "x");

  const phone = (client?.phone || "").replace(/\D/g, "");

  const encodedMsg = encodeURIComponent(msg);

  const baseUrl = "https://api.whatsapp.com/send";
  const url = phone
    ? `${baseUrl}?phone=55${phone}&text=${encodedMsg}`
    : `${baseUrl}?text=${encodedMsg}`;

  window.open(url, "_blank");
}

/* ===========================================================
 * Resumo de vendas do dia (por produto e por cliente)
 * =========================================================== */
export function exportDailySalesSummaryPDF(orders: Order[], date: Date = new Date()) {
  const doc = new jsPDF();
  const dateStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  header(doc, "Resumo de Vendas do Dia", dateStr);

  const concluidos = orders.filter((o) => o.status === "concluido");
  const total = concluidos.reduce((s, o) => s + o.total, 0);
  const totalItens = concluidos.reduce((s, o) => s + o.products.reduce((a, i) => a + i.quantity, 0), 0);

  // Cards
  doc.setFillColor(...CREAM);
  doc.roundedRect(14, 38, 182, 22, 3, 3, "F");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("PEDIDOS", 22, 45);
  doc.text("ITENS VENDIDOS", 92, 45);
  doc.text("FATURAMENTO", 162, 45);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  doc.text(String(concluidos.length), 22, 54);
  doc.text(String(totalItens), 92, 54);
  doc.setTextColor(...GREEN);
  doc.text(formatBRL(total), 162, 54);
  doc.setFont("helvetica", "normal");

  // Por produto
  const byProduct: Record<string, { name: string; qty: number; revenue: number }> = {};
  concluidos.forEach((o) => o.products.forEach((i) => {
    const key = i.id;
    if (!byProduct[key]) byProduct[key] = { name: i.name || "•", qty: 0, revenue: 0 };
    byProduct[key].qty += i.quantity;
    byProduct[key].revenue += i.quantity * i.price;
  }));
  const prodRows = Object.values(byProduct)
    .sort((a, b) => b.revenue - a.revenue)
    .map((p) => [`${p.name}`, String(p.qty), formatBRL(p.revenue)]);

  doc.setTextColor(...NAVY);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Vendas por Produto", 14, 70);
  doc.setFont("helvetica", "normal");

  autoTable(doc, {
    startY: 74,
    head: [["Produto", "Quantidade", "Subtotal"]],
    body: prodRows.length ? prodRows : [["Sem vendas no dia", "—", "—"]],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: NAVY, textColor: 255 },
    columnStyles: { 1: { halign: "center", cellWidth: 34 }, 2: { halign: "right", cellWidth: 36 } },
  });

  // Por cliente
  const byClient: Record<string, { name: string; orders: number; qty: number; revenue: number }> = {};
  concluidos.forEach((o) => {
    if (!byClient[o.clientId]) byClient[o.clientId] = { name: o.clientName, orders: 0, qty: 0, revenue: 0 };
    byClient[o.clientId].orders += 1;
    byClient[o.clientId].qty += o.products.reduce((a, i) => a + i.quantity, 0);
    byClient[o.clientId].revenue += o.total;
  });
  const clientRows = Object.values(byClient)
    .sort((a, b) => b.revenue - a.revenue)
    .map((c) => [c.name, String(c.orders), String(c.qty), formatBRL(c.revenue)]);

  const clientStartY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  doc.setTextColor(...NAVY);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Vendas por Cliente", 14, clientStartY);
  doc.setFont("helvetica", "normal");

  autoTable(doc, {
    startY: clientStartY + 4,
    head: [["Cliente", "Pedidos", "Itens", "Total"]],
    body: clientRows.length ? clientRows : [["Sem vendas no dia", "—", "—", "—"]],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: NAVY, textColor: 255 },
    columnStyles: {
      1: { halign: "center", cellWidth: 22 },
      2: { halign: "center", cellWidth: 22 },
      3: { halign: "right", cellWidth: 32 },
    },
  });

  footer(doc);
  doc.save(`resumo-vendas-${toDateStr(date)}.pdf`);
}
