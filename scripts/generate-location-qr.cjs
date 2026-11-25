const fs = require("fs");
const QRCode = require("/opt/homebrew/lib/node_modules/npm/node_modules/qrcode-terminal/vendor/QRCode");
const ErrorLevel = require("/opt/homebrew/lib/node_modules/npm/node_modules/qrcode-terminal/vendor/QRCode/QRErrorCorrectLevel");

const locationUrl = "https://www.google.com/maps/search/?api=1&query=Heritage+Haveli+Sheesh+Mahal+Khajurla+Jalandhar";
const qr = new QRCode(-1, ErrorLevel.H);
qr.addData(locationUrl);
qr.make();

const quietZone = 4;
const size = qr.getModuleCount() + quietZone * 2;
let path = "";
qr.modules.forEach((row, y) => {
  row.forEach((dark, x) => {
    if (dark) path += `M${x + quietZone} ${y + quietZone}h1v1h-1z`;
  });
});

const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fffdf7"/><path d="${path}" fill="#4f583b"/></svg>\n`;
fs.writeFileSync("public/location-qr.svg", svg);
