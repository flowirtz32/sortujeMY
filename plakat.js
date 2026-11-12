let posterAssets;

function loadPosterAssets() {
  posterAssets ??= new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "plakat-zasoby.js";
    script.onload = () => resolve(posterAssetData);
    script.onerror = () => resolve({});
    document.head.append(script);
  });
  return posterAssets;
}

function loadPosterImage(url, assets) {
  if (!url) return Promise.resolve(null);
  const source = new URL(assets[url] ?? url, document.baseURI);
  // File URLs have opaque origins. Bundled images use data URLs to keep the PNG exportable.
  if (source.protocol === "file:") return Promise.resolve(null);
  return new Promise((resolve) => {
    const image = new Image();
    const finish = (value) => {
      clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      resolve(value);
    };
    const timeout = setTimeout(() => finish(null), 6000);
    if (source.protocol === "http:" || source.protocol === "https:") image.crossOrigin = "anonymous";
    image.referrerPolicy = "no-referrer";
    image.onload = () => finish(image);
    image.onerror = () => finish(null);
    image.src = source.href;
  });
}

function posterColor(hex, target, weight) {
  const channels = hex.slice(1).match(/../g).map((channel) => parseInt(channel, 16));
  const mixed = channels.map((channel, index) => Math.round(channel * (1 - weight) + target[index] * weight));
  return `rgb(${mixed.join(", ")})`;
}

function posterPanel(ctx, x, y, width, height, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

function posterText(ctx, text, x, y, width, size, color, { display = true, align = "left", italic = false } = {}) {
  const font = display ? '"Barlow Condensed", "Arial Narrow", Impact, sans-serif' : "Inter, Arial, sans-serif";
  const style = italic ? "italic " : "";
  const weight = display ? 800 : 600;
  ctx.font = `${style}${weight} ${size}px ${font}`;
  const measured = ctx.measureText(text).width;
  if (measured > width) ctx.font = `${style}${weight} ${Math.floor(size * width / measured)}px ${font}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = align;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function posterPortrait(ctx, row, image, x, y, radius, background, ink) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = background;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

  if (image) {
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const span = Math.min(width, height);
    let size = span;
    let centerX = width / 2;
    let centerY = span * 0.43;
    if (row.photoCrop === "left") {
      size = span * 0.42;
      centerX = width * 0.38;
      centerY = height * 0.26;
    } else if (row.photoCrop === "right") {
      size = span * 0.58;
      centerX = width * 0.70;
      centerY = height * 0.26;
    }
    const left = Math.min(width - size, Math.max(0, centerX - size / 2));
    const top = Math.min(height - size, Math.max(0, centerY - size / 2));
    ctx.drawImage(image, left, top, size, size, x - radius, y - radius, radius * 2, radius * 2);
  } else {
    const initials = row.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toLocaleUpperCase("pl");
    posterText(ctx, initials, x, y + 1, radius * 1.65, radius * 0.92, ink, { align: "center" });
  }
  ctx.restore();
}

async function createRankingPoster(team, rows, seasonLabel, leagueLabel) {
  const white = [255, 255, 255];
  const paper = posterColor(team.color, [250, 251, 248], 0.96);
  const panelColor = posterColor(team.color, [9, 20, 34], team.ink ? 0.65 : 0.25);
  const accent = team.ink ? team.color : team.accent;
  const divider = posterColor(team.color, white, 0.85);
  const avatarColor = posterColor(team.color, white, 0.75);
  const textInk = "#142820";
  const mutedInk = "#44564f";

  const assets = await loadPosterAssets();
  const [logo, portraits] = await Promise.all([
    loadPosterImage(team.logo, assets),
    Promise.all(rows.map(({ photo }) => loadPosterImage(photo, assets))),
    Promise.race([
      Promise.allSettled([
        document.fonts.load('800 60px "Barlow Condensed"', "ŁÓDŹ ŚWIĘTY"),
        document.fonts.load('600 24px Inter', "Środkowy obrońca"),
      ]),
      new Promise((resolve) => setTimeout(resolve, 1800)),
    ]),
  ]);

  const canvas = document.createElement("canvas");
  const width = 1080;
  const margin = 54;
  const contentWidth = width - margin * 2;
  const podiumTop = 250;
  const podiumHeight = 244;
  const gap = 16;
  const rowHeight = 76;
  const featured = Math.min(3, rows.length);
  const remainingRows = rows.length - featured;
  const perColumn = Math.ceil(remainingRows / 2);
  const tableTop = podiumTop + podiumHeight + 26;
  const contentBottom = remainingRows ? tableTop + perColumn * rowHeight : podiumTop + podiumHeight;
  canvas.width = width;
  canvas.height = contentBottom + 102;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Brak obsługi generowania grafiki.");

  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, canvas.height);
  ctx.fillStyle = panelColor;
  ctx.fillRect(0, 0, width, 9);

  // A crop of the halfway line and centre circle frames the crest.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(840, 9);
  ctx.lineTo(width, 9);
  ctx.lineTo(width, 224);
  ctx.lineTo(766, 224);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = panelColor;
  ctx.fillRect(756, 9, width - 756, 215);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.30)";
  ctx.lineWidth = 2;
  ctx.strokeRect(813, 37, 338, 160);
  ctx.beginPath();
  ctx.moveTo(977, 37);
  ctx.lineTo(977, 197);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(977, 117, 65, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = accent;
  ctx.fillRect(margin, 191, 61, 6);

  const crestX = 960;
  const crestY = 117;
  posterPanel(ctx, crestX - 63, crestY - 74, 126, 148, 22, panelColor);
  if (logo) {
    const scale = Math.min(96 / logo.naturalWidth, 126 / logo.naturalHeight);
    const logoWidth = logo.naturalWidth * scale;
    const logoHeight = logo.naturalHeight * scale;
    ctx.drawImage(logo, crestX - logoWidth / 2, crestY - logoHeight / 2, logoWidth, logoHeight);
  } else {
    posterText(ctx, team.mark, crestX, crestY, 100, 40, "#fff", { align: "center" });
  }
  posterText(ctx, "MÓJ RANKING", margin, 54, 690, 27, panelColor, { display: false });
  posterText(ctx, team.name.toLocaleUpperCase("pl"), margin, 112, 700, 79, textInk);
  const selection = rows.length === team.players.length ? "Cała kadra" : "Wybrani zawodnicy";
  posterText(ctx, `Sezon ${seasonLabel} · ${selection}`, margin, 165, 690, 23, mutedInk, { display: false });

  const podiumWidth = (contentWidth - gap * (featured - 1)) / featured;
  for (let index = 0; index < featured; index++) {
    const row = rows[index];
    const x = margin + index * (podiumWidth + gap);
    const center = x + podiumWidth / 2;
    const first = row.label === "1." || row.label === "1=";
    posterPanel(ctx, x, podiumTop, podiumWidth, podiumHeight, 21, first ? panelColor : "#fff");
    posterPanel(ctx, x + 19, podiumTop + 18, 60, 41, 9, first ? accent : paper);
    posterText(ctx, row.label.replace(/\.$/, ""), x + 49, podiumTop + 39, 48, 26, panelColor, { align: "center" });
    posterPortrait(ctx, row, portraits[index], center, podiumTop + 94, 52, first ? accent : avatarColor, textInk);
    posterText(ctx, row.name, center, podiumTop + 177, podiumWidth - 35, 34, first ? "#fff" : textInk, { align: "center" });
    const position = row.number == null ? row.role : `${row.role} · #${row.number}`;
    posterText(ctx, position, center, podiumTop + 210, podiumWidth - 32, 17, first ? "#fff" : mutedInk, { display: false, align: "center" });
  }

  const columnWidth = remainingRows > 1 ? (contentWidth - gap) / 2 : contentWidth;
  for (let start = 0; start < remainingRows; start += perColumn) {
    const x = margin + (start / perColumn) * (columnWidth + gap);
    const length = Math.min(perColumn, remainingRows - start);
    posterPanel(ctx, x, tableTop, columnWidth, length * rowHeight, 18, "#fff");
  }
  for (let i = 0; i < remainingRows; i++) {
    const index = i + featured;
    const row = rows[index];
    const column = Math.floor(i / perColumn);
    const x = margin + column * (columnWidth + gap);
    const rowY = tableTop + (i % perColumn) * rowHeight;
    const center = rowY + rowHeight / 2;
    if (i % perColumn !== 0) {
      ctx.fillStyle = divider;
      ctx.fillRect(x + 15, rowY, columnWidth - 30, 1);
    }
    posterText(ctx, row.label.replace(/\.$/, ""), x + 40, center, 52, 30, panelColor, { align: "center" });
    posterPortrait(ctx, row, portraits[index], x + 95, center, 24, avatarColor, textInk);
    posterText(ctx, row.name, x + 132, center - 10, columnWidth - 149, 29, textInk);
    posterText(ctx, row.role, x + 132, center + 16, columnWidth - 149, 16, mutedInk, { display: false });
  }

  ctx.fillStyle = divider;
  ctx.fillRect(margin, contentBottom + 27, contentWidth, 2);
  const footerY = canvas.height - 39;
  posterText(ctx, "sortujeMY", margin, footerY, 420, 29, panelColor);
  posterText(ctx, leagueLabel, width - margin, footerY, 420, 21, mutedInk, { display: false, align: "right" });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Nie udało się zapisać PNG."));
    }, "image/png");
  });
}
