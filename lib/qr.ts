import QRCode from "qrcode";

// QR-код ссылки как SVG-путь: по квадрату 1×1 на каждый тёмный модуль.
// Рисовать — в <svg viewBox="0 0 size size">, печатается чётко в любом размере.
export function qrPath(url: string) {
  const { modules } = QRCode.create(url, { errorCorrectionLevel: "M" });
  const { size } = modules;
  let path = "";
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (modules.get(row, col) === 1) path += `M${col} ${row}h1v1h-1z`;
    }
  }
  return { size, path };
}
