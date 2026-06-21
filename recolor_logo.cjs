// One-off script: recolor the flat-orange Brainy logo to the brand gold,
// keeping the transparent, anti-aliased edges intact (alpha is untouched).
const fs = require("fs");
const { PNG } = require("pngjs");

// Brand primary gold — #F6AC0D
const TARGET = { r: 0xf6, g: 0xac, b: 0x0d };

const src = process.argv[2] || "logo_brainy_orange_original.png";
const outputs = ["logo_brainy.png", "public/logo_brainy.png"];

const png = PNG.sync.read(fs.readFileSync(src));
for (let i = 0; i < png.data.length; i += 4) {
  const alpha = png.data[i + 3];
  if (alpha === 0) continue; // fully transparent pixel — leave as-is
  png.data[i] = TARGET.r;
  png.data[i + 1] = TARGET.g;
  png.data[i + 2] = TARGET.b;
  // alpha (png.data[i + 3]) preserved -> smooth edges stay smooth
}

const buf = PNG.sync.write(png);
for (const out of outputs) {
  fs.writeFileSync(out, buf);
  console.log("wrote", out);
}
