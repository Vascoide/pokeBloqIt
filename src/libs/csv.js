export function exportToCSV(items = [], filename = "pokedex.csv") {
  if (!items.length) {
    const csvEmpty = "name,caughtAt,note\n";
    downloadBlob(csvEmpty, filename);
    return;
  }
  const headers = Object.keys(items[0]);
  const rows = [
    headers.join(","),
    ...items.map((row) => headers.map((h) => csvEscape(row[h])).join(",")),
  ].join("\n");
  downloadBlob(rows, filename);
}

function csvEscape(value) {
  if (value === undefined || value === null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadBlob(text, filename) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
