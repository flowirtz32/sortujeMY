function maximumComparisons(playerCount, firstInsertion = 2) {
  let maximum = 0;
  for (let size = firstInsertion; size <= playerCount; size++) {
    maximum += Math.ceil(Math.log2(size));
  }
  return maximum;
}

// Replay votes as binary insertions. Players who tie occupy one ranking group.
function sortPlayers(order, votes) {
  const ranking = [[order[0]]];
  let voteIndex = 0;

  for (let placed = 1; placed < order.length; placed++) {
    const player = order[placed];
    let lower = 0;
    let upper = ranking.length;
    let tied = false;

    while (lower < upper) {
      const middle = Math.floor((lower + upper) / 2);
      const opponent = ranking[middle][0];
      const candidateOnLeft = voteIndex % 2 === 0;
      const pair = candidateOnLeft ? [player, opponent] : [opponent, player];

      if (voteIndex === votes.length) {
        // The current search has one possible insertion point on each side of the remaining groups.
        const remaining = Math.ceil(Math.log2(upper - lower + 1))
          + maximumComparisons(order.length, placed + 2);
        return { ranking, pair, comparisons: voteIndex, remaining };
      }

      const vote = votes[voteIndex++];
      if (vote === "tie") {
        ranking[middle].push(player);
        tied = true;
        break;
      }
      if ((vote === "left") === candidateOnLeft) upper = middle;
      else lower = middle + 1;
    }

    if (!tied) ranking.splice(lower, 0, [player]);
  }

  return { ranking, pair: null, comparisons: voteIndex, remaining: 0 };
}

const byId = (id) => document.getElementById(id);
const currentYear = season.slice(0, 4);
const currentClubs = clubDefinitions.map((team) => {
  const squad = importedSquads[team.id];
  return { ...team, year: currentYear, players: playersWithPhotos(squad ?? team.players ?? []), imported: Boolean(squad) };
});
const allTeams = [...clubDefinitions, ...archiveClubDefinitions, ...firstLeagueClubDefinitions];
const teamsById = new Map(allTeams.map((team) => [team.id, team]));
const clubsByYear = new Map([[currentYear, currentClubs]]);
const archivesByLeague = { ekstraklasa: archiveSquads, "1-liga": firstLeagueArchive };
for (const year of Object.keys(archiveSquads).reverse()) {
  const teams = Object.entries(archivesByLeague).flatMap(([league, archive]) =>
    Object.entries(archive[year] ?? {}).map(([id, squad]) => ({
      ...teamsById.get(id), ...squad, year, league, players: playersWithPhotos(squad.players), imported: true,
    })));
  clubsByYear.set(year, teams);
}
const clubGrid = byId("club-grid");
const leagueButtons = document.querySelectorAll("[data-league]");
const seasonPicker = byId("season-picker");
const seasonLinks = document.querySelectorAll("[data-season-anchor]");
const leftButton = byId("left");
const rightButton = byId("right");
const gameTitle = byId("game-title");
const notice = byId("notice");
const sessions = new Map();
const storagePrefix = "kto-na-topie-2026-27-v1-";
const positionGroups = [
  { code: "B", label: "Bramkarze" },
  { code: "O", label: "Obrońcy" },
  { code: "P", label: "Pomocnicy" },
  { code: "N", label: "Napastnicy" },
];
const allPositions = new Set(positionGroups.map(({ code }) => code));
let league = "ekstraklasa";
let selectedYear = currentYear;
let club;
let session;
let state;
let selectedPositions;

function element(tag, className, value) {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = value;
  return node;
}

function crest(team, label = team.mark) {
  const badge = element("span", "crest", label);
  badge.style.setProperty("--club-color", team.color);
  badge.style.setProperty("--club-accent", team.accent);
  if (team.ink) badge.style.setProperty("--club-ink", team.ink);
  badge.setAttribute("aria-hidden", "true");
  return badge;
}

function applyClubTheme(view, team) {
  const rgb = team.color.slice(1).match(/../g).map((hex) => parseInt(hex, 16) / 255);
  const [red, green, blue] = rgb.map((value) => value <= .04045
    ? value / 12.92
    : ((value + .055) / 1.055) ** 2.4);
  const luminance = .2126 * red + .7152 * green + .0722 * blue;
  view.style.setProperty("--club-color", team.color);
  view.style.setProperty("--club-accent", team.accent);
  view.style.setProperty("--club-ink", luminance > .179 ? "#000" : "#fff");
}

function clubCrest(team) {
  const tile = element("span", "club-logo", "");
  const fallback = crest(team);
  tile.append(fallback);
  if (!team.logo) return tile;
  const image = element("img", "", "");
  image.alt = "";
  image.addEventListener("load", () => {
    tile.replaceChildren(image);
  }, { once: true });
  image.src = team.logo;
  return tile;
}

function positionLabel(role) {
  return Object.hasOwn(positions, role) ? positions[role] : role;
}

function positionGroup(role) {
  const label = positionLabel(role).toLocaleLowerCase("pl");
  if (label.includes("bramkarz")) return positionGroups[0];
  if (label.includes("obrońca") || label.includes("wahadł")) return positionGroups[1];
  if (label.includes("napastnik") || label.includes("skrzydł")) return positionGroups[3];
  return positionGroups[2];
}

function playersWithPhotos(players) {
  return players.filter(([, , details]) => details?.photo);
}

function playerPool(team, included) {
  return team.players.flatMap(([, role], index) => included.has(positionGroup(role).code) ? [index] : []);
}

function positionSuffix(included) {
  return included.size === allPositions.size ? "" : positionGroups
    .filter(({ code }) => included.has(code))
    .map(({ code }) => code)
    .join(",");
}

function seasonLabel(year) {
  return `${year}/${Number(year) + 1}`;
}

function seasonRoute(view, year) {
  return year === currentYear ? `#${view}` : `#sezon/${year}/${view}`;
}

function clubsRoute(year, league) {
  return seasonRoute(league === "1-liga" ? "kluby/1-liga" : "kluby", year);
}

function teamRoute(view, team, included) {
  const suffix = positionSuffix(included);
  const route = `${view}/${team.id}${suffix ? `?pozycje=${suffix}` : ""}`;
  return seasonRoute(route, team.year);
}

function sessionKey(team, included) {
  const suffix = positionSuffix(included);
  const prefix = team.year === currentYear ? storagePrefix : `kto-na-topie-${team.year}-v1-`;
  return prefix + team.id + (team.imported ? "-import" : "") + (suffix ? "-" + suffix : "");
}

function rosterKey(team) {
  return JSON.stringify(team.players.map(([name]) => name));
}

function readSession(team, included) {
  const key = sessionKey(team, included);
  if (sessions.has(key)) return sessions.get(key);
  try {
    const stored = JSON.parse(localStorage.getItem(key));
    const pool = new Set(playerPool(team, included));
    if (team.imported && stored?.roster !== rosterKey(team)) return null;
    const validOrder = Array.isArray(stored?.order)
      && stored.order.length === pool.size
      && new Set(stored.order).size === pool.size
      && stored.order.every((index) => pool.has(index));
    const validVotes = Array.isArray(stored?.votes)
      && stored.votes.length <= pool.size ** 2
      && stored.votes.every((vote) => ["left", "right", "tie"].includes(vote));
    if (validOrder && validVotes) {
      sessions.set(key, stored);
      return stored;
    }
  } catch {
    // The sorter also runs when local storage is unavailable.
  }
  return null;
}

function newSession(team, included) {
  const order = playerPool(team, included);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { order, votes: [], roster: rosterKey(team) };
}

function saveSession() {
  const key = sessionKey(club, selectedPositions);
  sessions.set(key, session);
  try {
    localStorage.setItem(key, JSON.stringify(session));
  } catch {
    // The in-memory session remains usable until the tab is closed.
  }
}

function renderClubs() {
  const isArchive = selectedYear !== currentYear;
  for (const button of leagueButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.league === league));
  }
  byId("roster-note").textContent = isArchive
    ? `Archiwum sezonu ${seasonLabel(selectedYear)}`
    : "Kadry sprawdzone 11 listopada 2026.";
  const visibleClubs = clubsByYear.get(selectedYear).filter((team) => team.league === league);
  const forms = { one: "klub", few: "kluby", many: "klubów", other: "klubów" };
  const form = new Intl.PluralRules("pl").select(visibleClubs.length);
  byId("club-count").textContent = `${visibleClubs.length} ${forms[form]}`;
  clubGrid.replaceChildren(...visibleClubs.map((team) => {
    const card = element("a", "club-card", "");
    applyClubTheme(card, team);
    card.href = teamRoute("kadra", team, allPositions);
    const info = element("span", "club-identity", "");
    info.append(
      element("span", "club-name", team.name),
      element("span", "club-size", `${team.players.length} piłkarzy`),
    );
    const arrow = element("span", "club-arrow", "→");
    arrow.setAttribute("aria-hidden", "true");
    card.append(clubCrest(team), info, arrow);
    return card;
  }));
}

function playerPortrait(team, name, { photo } = {}, lazy = false) {
  const initials = name.split(" ").map((word) => word[0]).slice(0, 2).join("");
  const visual = element("span", "portrait", "");
  const badge = crest(team, initials);
  visual.append(badge);
  if (!photo) return visual;
  const image = document.createElement("img");
  image.alt = "";
  image.decoding = "async";
  if (lazy) image.loading = "lazy";
  image.referrerPolicy = "no-referrer";
  image.addEventListener("load", () => {
    image.classList.add("is-loaded");
    badge.hidden = true;
  }, { once: true });
  visual.append(image);
  image.src = photo;
  return visual;
}

function showPlayer(button, index) {
  const [name, role, details = {}] = club.players[index];
  const { number, photo, credit } = details;
  const visual = playerPortrait(club, name, details);
  const photoCredit = credit && photo ? element("span", "photo-credit", credit) : null;
  const position = positionLabel(role);
  button.replaceChildren(
    visual,
    element("span", "player-name", name),
    element("span", "position", number == null ? position : `#${number} · ${position}`),
  );
  if (photoCredit) button.append(photoCredit);
}

function renderSquadPlayers() {
  const list = [];
  for (const group of positionGroups) {
    if (!selectedPositions.has(group.code)) continue;
    for (const [name, role, details = {}] of club.players) {
      if (positionGroup(role) !== group) continue;
      const row = element("li", "squad-player", "");
      const identity = element("span", "squad-player-identity", "");
      identity.append(
        element("span", "squad-player-name", name),
        element("span", "position squad-position", positionLabel(role)),
      );
      if (details.number != null) identity.append(element("span", "squad-number", `#${details.number}`));
      row.append(playerPortrait(club, name, details, true), identity);
      list.push(row);
    }
  }
  byId("squad-players").replaceChildren(...list);
  const count = list.length;
  byId("squad-summary").textContent = count >= 2
    ? `${count} zawodników · do ${maximumComparisons(count)} porównań`
    : "Wybierz pozycje obejmujące co najmniej 2 zawodników.";
  const play = byId("squad-play");
  play.disabled = count < 2;
  const saved = readSession(club, selectedPositions);
  play.textContent = saved?.votes.length
    ? (sortPlayers(saved.order, saved.votes).pair ? "Wznów ranking" : "Zobacz ranking")
    : "Rozpocznij ranking";
}

function renderSquad(team) {
  byId("squad-crest").replaceChildren(clubCrest(team));
  byId("squad-league").textContent = `${leagues[team.league]} · ${seasonLabel(team.year)}`;
  byId("squad-title").textContent = team.name;
  byId("squad-filters").replaceChildren(...positionGroups.map(({ code, label }) => {
    const count = team.players.filter(([, role]) => positionGroup(role).code === code).length;
    const button = element("button", "squad-filter", "");
    button.type = "button";
    button.disabled = !count;
    button.setAttribute("aria-pressed", String(selectedPositions.has(code) && count > 0));
    button.append(label, element("span", "squad-filter-count", String(count)));
    button.addEventListener("click", () => {
      if (selectedPositions.has(code)) selectedPositions.delete(code);
      else selectedPositions.add(code);
      button.setAttribute("aria-pressed", String(selectedPositions.has(code)));
      renderSquadPlayers();
    });
    return button;
  }));
  renderSquadPlayers();
  byId("squad-title").focus({ preventScroll: true });
}

function rankingRows() {
  let place = 1;
  return state.ranking.flatMap((group) => {
    const label = String(place) + (group.length > 1 ? "=" : ".");
    place += group.length;
    return group.map((index) => {
      const [name, role, { number, photo, photoCrop } = {}] = club.players[index];
      return { label, name, role: positionLabel(role), number, photo, photoCrop };
    });
  });
}

function renderGame(focusTitle = false) {
  state = sortPlayers(session.order, session.votes);
  const playing = Boolean(state.pair);
  byId("battle").hidden = !playing;
  byId("result").hidden = playing;
  gameTitle.textContent = playing ? "Kogo wolisz?" : "Twój ranking";
  byId("game-instructions").textContent = playing
    ? "Wskaż piłkarza, którego wolisz."
    : `${session.order.length} piłkarzy według Twoich wyborów.`;
  notice.textContent = "";

  const { comparisons, remaining } = state;
  const percent = playing
    ? Math.min(99, Math.round(100 * comparisons / (comparisons + remaining)))
    : 100;
  byId("battle-number").textContent = playing
    ? `Porównanie ${comparisons + 1}`
    : `Liczba porównań · ${comparisons}`;
  byId("progress").value = percent;
  byId("progress-percent").textContent = playing && percent > 0 ? `ok. ${percent}%` : `${percent}%`;

  if (playing) {
    byId("undo").disabled = session.votes.length === 0;
    showPlayer(leftButton, state.pair[0]);
    showPlayer(rightButton, state.pair[1]);
  } else {
    byId("ranking").replaceChildren(...rankingRows().map(({ label, name, role }) => {
      const row = document.createElement("li");
      row.append(
        element("span", "rank-number", label),
        element("span", "rank-name", name),
        element("span", "position", role),
      );
      return row;
    }));
  }
  if (focusTitle) gameTitle.focus({ preventScroll: true });
}

function showRoute() {
  const hash = location.hash.slice(1);
  const archive = /^sezon\/(\d{4})\/(.*)$/.exec(hash);
  const requestedYear = archive?.[1] ?? currentYear;
  const yearAvailable = clubsByYear.has(requestedYear);
  const year = yearAvailable ? requestedYear : currentYear;
  const route = yearAvailable ? (archive?.[2] ?? hash) : "kluby";
  selectedYear = year;
  seasonPicker.value = year;

  const match = /^(kadra|gra)\/([a-z-]+)(?:\?pozycje=([BOPN](?:,[BOPN])*))?$/.exec(route);
  const team = match && clubsByYear.get(year).find(({ id }) => id === match[2]);
  if (team) league = team.league;
  else if (route === "kluby") league = "ekstraklasa";
  else if (route === "kluby/1-liga") league = "1-liga";
  for (const link of seasonLinks) {
    const view = link.dataset.seasonAnchor;
    link.href = view === "kluby" ? clubsRoute(year, league) : seasonRoute(view, year);
  }
  selectedPositions = new Set(match?.[3] ? match[3].split(",") : allPositions);
  const playing = team && match[1] === "gra" && playerPool(team, selectedPositions).length >= 2;
  byId("home").hidden = Boolean(team);
  byId("squad").hidden = !team || Boolean(playing);
  byId("game").hidden = !playing;
  state = undefined;
  if (team) {
    club = team;
    applyClubTheme(byId(playing ? "game" : "squad"), team);
    window.scrollTo({ top: 0, behavior: "instant" });
    if (!playing) {
      renderSquad(team);
      return;
    }
    session = readSession(team, selectedPositions) ?? newSession(team, selectedPositions);
    byId("game-back").href = teamRoute("kadra", team, selectedPositions);
    byId("game-club").replaceChildren(
      clubCrest(team),
      document.createTextNode(`${team.name} · ${leagues[team.league]} · ${seasonLabel(team.year)}`),
    );
    renderGame(true);
  } else {
    club = undefined;
    renderClubs();
    const section = route === "kluby/1-liga" ? "kluby" : route;
    if (["kluby", "zasady", "start"].includes(section)) byId(section).scrollIntoView();
  }
}

function vote(choice) {
  if (!state?.pair) return;
  session.votes.push(choice);
  saveSession();
  renderGame();
  if (!state.pair) {
    window.scrollTo({ top: 0, behavior: "instant" });
    gameTitle.focus({ preventScroll: true });
  }
}

function undoVote() {
  if (!session.votes.length) return;
  const wasComplete = !state.pair;
  session.votes.pop();
  saveSession();
  renderGame(wasComplete || session.votes.length === 0);
}

async function downloadRankingImage() {
  if (!club || !state || state.pair) return;
  const button = byId("download-poster");
  const team = club;
  const rows = rankingRows();
  button.disabled = true;
  notice.textContent = "Tworzę grafikę rankingu…";
  try {
    const poster = await createRankingPoster(team, rows, seasonLabel(team.year), leagues[team.league]);
    const url = URL.createObjectURL(poster);
    const link = document.createElement("a");
    link.href = url;
    const yearSuffix = team.year === currentYear ? "" : `-${team.year}-${Number(team.year) + 1}`;
    link.download = `ranking-${team.id}${yearSuffix}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (club === team && state && !state.pair) notice.textContent = "Grafika rankingu jest gotowa.";
  } catch {
    if (club === team && state && !state.pair) notice.textContent = "Nie udało się utworzyć grafiki. Spróbuj ponownie.";
  } finally {
    button.disabled = false;
  }
}

seasonPicker.replaceChildren(...Array.from(clubsByYear.keys(), (year) =>
  new Option(`Sezon ${seasonLabel(year)}`, year)));
seasonPicker.addEventListener("change", () => {
  location.hash = clubsRoute(seasonPicker.value, league);
});

for (const button of leagueButtons) {
  button.addEventListener("click", () => {
    location.hash = clubsRoute(selectedYear, button.dataset.league);
  });
}
for (const link of seasonLinks) {
  link.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.hash !== location.hash) return;
    event.preventDefault();
    byId(link.dataset.seasonAnchor).scrollIntoView();
  });
}

leftButton.addEventListener("click", () => vote("left"));
rightButton.addEventListener("click", () => vote("right"));
byId("tie").addEventListener("click", () => vote("tie"));
byId("undo").addEventListener("click", undoVote);
byId("undo-result").addEventListener("click", undoVote);
byId("download-poster").addEventListener("click", downloadRankingImage);
byId("squad-play").addEventListener("click", () => {
  if (!byId("squad-play").disabled) location.hash = teamRoute("gra", club, selectedPositions);
});
byId("restart").addEventListener("click", () => {
  session = newSession(club, selectedPositions);
  saveSession();
  renderGame(true);
});

const sources = byId("sources");
byId("sources-button").addEventListener("click", () => {
  byId("source-note").textContent = `Źródło kadr sezonu ${seasonLabel(selectedYear)}, herbów klubowych i większości zdjęć zawodników.`;
  byId("source-list").replaceChildren(...clubsByYear.get(selectedYear).map((team) => {
    const item = document.createElement("li");
    const link = element("a", "", team.name);
    link.href = team.imported ? team.transfermarkt : (team.source ?? team.transfermarkt);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    item.append(link);
    if (!team.imported && team.source && team.transfermarkt) {
      const squadLink = element("a", "", "Transfermarkt");
      squadLink.href = team.transfermarkt;
      squadLink.target = "_blank";
      squadLink.rel = "noopener noreferrer";
      item.append(" · ", squadLink);
    }
    return item;
  }));
  sources.showModal();
});

const keyVotes = { ArrowLeft: "left", ArrowRight: "right", "=": "tie" };
window.addEventListener("keydown", (event) => {
  if (!state?.pair || sources.open || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
  if (!Object.hasOwn(keyVotes, event.key)) return;
  event.preventDefault();
  vote(keyVotes[event.key]);
});
window.addEventListener("hashchange", showRoute);
showRoute();
