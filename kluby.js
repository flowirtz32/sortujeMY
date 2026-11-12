const leagues = {
  "ekstraklasa": "Ekstraklasa",
  "1-liga": "1. Liga",
};

const season = "2026/27";
const positions = { B: "Bramkarz", O: "Obrońca", P: "Pomocnik", N: "Napastnik" };

const clubDefinitions = [
  {
    id: "lech", name: "Lech Poznań", mark: "LPO", league: "ekstraklasa", logo: "herby/lech.png",
    color: "#1758a2", accent: "#b9defe",
    source: "https://www.lechpoznan.pl/lech-poznan-pierwsza-druzyna%2C11.html",
    transfermarkt: "https://www.transfermarkt.pl/lech-posen/startseite/verein/238",
    players: [
      ["Mikael Ishak", "N"], ["Yannick Agnero", "N"], ["Patrik Wålemark", "P"],
      ["Antoni Kozubal", "P"], ["Luis Palma", "P"], ["Pablo Rodríguez", "P"],
      ["Michał Gurgul", "O"], ["Mateusz Skrzypczak", "O"], ["Joel Pereira", "O"],
      ["Mateusz Lis", "B"],
    ],
  },
  {
    id: "legia", name: "Legia Warszawa", mark: "LEG", league: "ekstraklasa", logo: "herby/legia.png",
    color: "#1c4c32", accent: "#eb555c",
    source: "https://legia.com/druzyny/pierwsza-druzyna-2026-27",
    transfermarkt: "https://www.transfermarkt.pl/legia-warszawa/kader/verein/255",
    players: [
      ["Ivan Brkić", "B"], ["Kamil Piątkowski", "O"], ["Arkadiusz Reca", "O"],
      ["Rafał Augustyniak", "O"], ["Paweł Wszołek", "P"], ["Bartosz Kapustka", "P"],
      ["Kacper Chodyna", "P"], ["Damian Szymański", "P"], ["Jan Kuchta", "N"],
      ["Jakub Żewłakow", "N"],
    ],
  },
  {
    id: "jagiellonia", name: "Jagiellonia Białystok", mark: "JAG", league: "ekstraklasa", logo: "herby/jagiellonia.png",
    color: "#f4cf52", accent: "#d52b35", ink: "#342015",
    source: "https://ekstraklasa.org/kluby/jagiellonia-bialystok/?tab=team",
    transfermarkt: "https://www.transfermarkt.pl/jagiellonia-bialystok/kader/verein/2300",
    players: [
      ["Sławomir Abramowicz", "B"], ["Bartłomiej Wdowik", "O"], ["Dušan Stojinović", "O"],
      ["Jesús Imaz", "P"], ["Taras Romanczuk", "P"], ["Sergio Lozano", "P"],
      ["Dawid Drachal", "P"], ["Kamil Jóźwiak", "P"], ["Nik Prelec", "N"],
      ["Dimitris Rallis", "N"],
    ],
  },
  {
    id: "wisla", name: "Wisła Kraków", mark: "WIS", league: "ekstraklasa", logo: "herby/wisla.png",
    color: "#ac263e", accent: "#e9ecfc",
    source: "https://wislakrakow.com/en/news/derby-sa-nasze-wisla-krakow-pokonala-cracovie-2-1",
    transfermarkt: "https://www.transfermarkt.pl/wisla-krakow/kader/verein/422",
    players: [
      ["Marcel Łubik", "B"], ["Alan Uryga", "O"], ["Raoul Giger", "O"],
      ["Jakub Krzyżanowski", "O"], ["Maxence Maisonneuve", "O"], ["Marc Carbó", "P"],
      ["Kacper Duda", "P"], ["Julius Ertlthaler", "P"], ["Frederico Duarte", "N"],
      ["Ángel Rodado", "N"],
    ],
  },
  {
    id: "lks", name: "ŁKS Łódź", mark: "ŁKS", league: "1-liga", logo: "herby/lks.png",
    color: "#b32b3e", accent: "#e9ebec",
    source: "https://lkslodz.pl/mecze/kadra/",
    transfermarkt: "https://www.transfermarkt.pl/lks-lodz/kader/verein/256",
    players: [
      ["Damian Węglarz", "B"], ["Artur Crăciun", "O"], ["Julian Keiblinger", "O"],
      ["Bartosz Farbiszewski", "O"], ["Kōki Hinokio", "P"], ["Mateusz Wysokiński", "P"],
      ["Igor Strzałek", "P"], ["Lenard Szczygieł", "P"], ["Andreu Arasa", "N"],
      ["Fabian Piasecki", "N"],
    ],
  },
  {
    id: "polonia", name: "Polonia Warszawa", mark: "KSP", league: "1-liga", logo: "herby/polonia.png",
    color: "#24292b", accent: "#d34549",
    source: "https://lkslodz.pl/aktualnosci/betclic-1-liga-lks-polonia-11/",
    transfermarkt: "https://www.transfermarkt.pl/polonia-warszawa/kader/verein/2745/saison_id/2026",
    players: [
      ["Henrich Ravas", "B"], ["Paweł Olszewski", "O"], ["Aleksander Gołoś", "O"],
      ["Jakub Budnicki", "O"], ["Patryk Janasik", "O"], ["Dave Gnaase", "P"],
      ["Tomasz Makowski", "P"], ["Simon Skrabb", "P"], ["İlkay Durmuş", "P"],
      ["Gierman Barkowskij", "N"],
    ],
  },
  {
    id: "stal", name: "Stal Rzeszów", mark: "STR", league: "1-liga", logo: "herby/stal.png",
    color: "#26588b", accent: "#d7e8f9",
    source: "https://stalrzeszow.pl/druzyna/pierwsza-druzyna/",
    transfermarkt: "https://www.transfermarkt.pl/stal-rzeszow/kader/verein/9510",
    players: [
      ["Marek Kozioł", "B"], ["Marco Thiede", "O"], ["Marcin Kaczor", "O"],
      ["Ksawery Kukułka", "O"], ["Vladislav Krasouski", "O"], ["Sean Goss", "P"],
      ["Mateusz Leniart", "P"], ["Marcin Listkowski", "P"], ["Aleksander Buksa", "N"],
      ["Szymon Salamon", "N"],
    ],
  },
  {
    id: "puszcza", name: "Puszcza Niepołomice", mark: "PUN", league: "1-liga", logo: "herby/puszcza.png",
    color: "#344b30", accent: "#e3cc87",
    source: "https://stalrzeszow.pl/remis-wywalczony-tuz-przed-koncem-stal-rzeszow-puszcza-niepolomice-2-2/",
    transfermarkt: "https://www.transfermarkt.pl/puszcza-niepolomice/kader/verein/28893",
    players: [
      ["Wiktor Kowal", "B"], ["Filip Szabaciuk", "O"], ["Adrian Piekarski", "O"],
      ["Omar Kočar", "O"], ["Mark Strajnar", "O"], ["Mateusz Cholewiak", "P"],
      ["Konrad Stępień", "P"], ["Filipe Nascimento", "P"], ["Andrzej Trubeha", "P"],
      ["Amarildo Gjoni", "N"],
    ],
  },
  {
    id: "cracovia", name: "Cracovia", mark: "CRA",
    league: "ekstraklasa", logo: "herby/cracovia.png", color: "#be243c", accent: "#f3e9e9",
    transfermarkt: "https://www.transfermarkt.com/cracovia/kader/verein/5689/saison_id/2026",
  },
  {
    id: "gks-katowice", name: "GKS Katowice", mark: "GKS",
    league: "ekstraklasa", logo: "herby/gks-katowice.png", color: "#213a32", accent: "#f2d43f",
    transfermarkt: "https://www.transfermarkt.com/gks-katowice/kader/verein/6456/saison_id/2026",
  },
  {
    id: "gornik-zabrze", name: "Górnik Zabrze", mark: "GÓR",
    league: "ekstraklasa", logo: "herby/gornik-zabrze.png", color: "#214689", accent: "#ef5957",
    transfermarkt: "https://www.transfermarkt.com/gornik-zabrze/kader/verein/428/saison_id/2026",
  },
  {
    id: "korona-kielce", name: "Korona Kielce", mark: "KOR",
    league: "ekstraklasa", logo: "herby/korona-kielce.png", color: "#b32432", accent: "#f5d23d",
    transfermarkt: "https://www.transfermarkt.com/korona-kielce/kader/verein/6110/saison_id/2026",
  },
  {
    id: "motor-lublin", name: "Motor Lublin", mark: "MOT",
    league: "ekstraklasa", logo: "herby/motor-lublin.png", color: "#2155a0", accent: "#f8d33e",
    transfermarkt: "https://www.transfermarkt.com/motor-lublin/kader/verein/3527/saison_id/2026",
  },
  {
    id: "piast-gliwice", name: "Piast Gliwice", mark: "PIA",
    league: "ekstraklasa", logo: "herby/piast-gliwice.png", color: "#1b4c8f", accent: "#ed6266",
    transfermarkt: "https://www.transfermarkt.com/piast-gliwice/kader/verein/6112/saison_id/2026",
  },
  {
    id: "pogon-szczecin", name: "Pogoń Szczecin", mark: "POG",
    league: "ekstraklasa", logo: "herby/pogon-szczecin.png", color: "#232f5b", accent: "#c85a6c",
    transfermarkt: "https://www.transfermarkt.com/pogon-stettin/kader/verein/324/saison_id/2026",
  },
  {
    id: "radomiak-radom", name: "Radomiak Radom", mark: "RAD",
    league: "ekstraklasa", logo: "herby/radomiak-radom.png", color: "#226f44", accent: "#d5edcd",
    transfermarkt: "https://www.transfermarkt.com/radomiak-radom/kader/verein/7154/saison_id/2026",
  },
  {
    id: "rakow-czestochowa", name: "Raków Częstochowa", mark: "RCZ",
    league: "ekstraklasa", logo: "herby/rakow-czestochowa.png", color: "#223b72", accent: "#ed6268",
    transfermarkt: "https://www.transfermarkt.com/rakow-czestochowa/kader/verein/9644/saison_id/2026",
  },
  {
    id: "slask-wroclaw", name: "Śląsk Wrocław", mark: "ŚLĄ",
    league: "ekstraklasa", logo: "herby/slask-wroclaw.png", color: "#176644", accent: "#e3cc84",
    transfermarkt: "https://www.transfermarkt.com/slask-wroclaw/kader/verein/759/saison_id/2026",
  },
  {
    id: "widzew-lodz", name: "Widzew Łódź", mark: "WID",
    league: "ekstraklasa", logo: "herby/widzew-lodz.png", color: "#b3233a", accent: "#f7d369",
    transfermarkt: "https://www.transfermarkt.com/widzew-lodz/kader/verein/88/saison_id/2026",
  },
  {
    id: "wieczysta-krakow", name: "Wieczysta Kraków", mark: "WIE",
    league: "ekstraklasa", logo: "herby/wieczysta-krakow.png", color: "#37302b", accent: "#f4d642",
    transfermarkt: "https://www.transfermarkt.com/wieczysta-krakow/kader/verein/30974/saison_id/2026",
  },
  {
    id: "wisla-plock", name: "Wisła Płock", mark: "WPŁ",
    league: "ekstraklasa", logo: "herby/wisla-plock.png", color: "#2252a0", accent: "#d8e7fb",
    transfermarkt: "https://www.transfermarkt.com/wisla-plock/kader/verein/2118/saison_id/2026",
  },
  {
    id: "zaglebie-lubin", name: "Zagłębie Lubin", mark: "ZAG",
    league: "ekstraklasa", logo: "herby/zaglebie-lubin.png", color: "#8b431b", accent: "#f2ac61",
    transfermarkt: "https://www.transfermarkt.com/zaglebie-lubin/kader/verein/168/saison_id/2026",
  },
  {
    id: "arka-gdynia", name: "Arka Gdynia", mark: "ARK",
    league: "1-liga", logo: "herby/arka-gdynia.png", color: "#214986", accent: "#f5d84a",
    transfermarkt: "https://www.transfermarkt.com/arka-gdynia/kader/verein/6107/saison_id/2026",
  },
  {
    id: "termalica-nieciecza", name: "Bruk-Bet Termalica Nieciecza", mark: "BBT",
    league: "1-liga", logo: "herby/termalica-nieciecza.png", color: "#213b6f", accent: "#f6a257",
    transfermarkt: "https://www.transfermarkt.com/bruk-bet-termalica-nieciecza/kader/verein/15906/saison_id/2026",
  },
  {
    id: "chrobry-glogow", name: "Chrobry Głogów", mark: "CHR",
    league: "1-liga", logo: "herby/chrobry-glogow.png", color: "#3d2c25", accent: "#ed9a4c",
    transfermarkt: "https://www.transfermarkt.com/chrobry-glogow/kader/verein/8377/saison_id/2026",
  },
  {
    id: "lechia-gdansk", name: "Lechia Gdańsk", mark: "LGD",
    league: "1-liga", logo: "herby/lechia-gdansk.png", color: "#236243", accent: "#dcebdc",
    transfermarkt: "https://www.transfermarkt.com/lechia-gdansk/kader/verein/4000/saison_id/2026",
  },
  {
    id: "miedz-legnica", name: "Miedź Legnica", mark: "MIE",
    league: "1-liga", logo: "herby/miedz-legnica.png", color: "#244c78", accent: "#7fcc81",
    transfermarkt: "https://www.transfermarkt.com/miedz-legnica/kader/verein/8936/saison_id/2026",
  },
  {
    id: "odra-opole", name: "Odra Opole", mark: "ODR",
    league: "1-liga", logo: "herby/odra-opole.png", color: "#204c89", accent: "#e66268",
    transfermarkt: "https://www.transfermarkt.com/odra-opole/kader/verein/5699/saison_id/2026",
  },
  {
    id: "podbeskidzie", name: "Podbeskidzie Bielsko-Biała", mark: "POD",
    league: "1-liga", logo: "herby/podbeskidzie.png", color: "#244480", accent: "#f16369",
    transfermarkt: "https://www.transfermarkt.com/podbeskidzie-bielsko-biala/kader/verein/6361/saison_id/2026",
  },
  {
    id: "pogon-grodzisk", name: "Pogoń Grodzisk Mazowiecki", mark: "PGM",
    league: "1-liga", logo: "herby/pogon-grodzisk.png", color: "#28436b", accent: "#ef676c",
    transfermarkt: "https://www.transfermarkt.com/pogon-grodzisk-mazowiecki/kader/verein/30998/saison_id/2026",
  },
  {
    id: "pogon-siedlce", name: "Pogoń Siedlce", mark: "PGS",
    league: "1-liga", logo: "herby/pogon-siedlce.png", color: "#22508f", accent: "#e9eefc",
    transfermarkt: "https://www.transfermarkt.com/pogon-siedlce/kader/verein/4896/saison_id/2026",
  },
  {
    id: "polonia-bytom", name: "Polonia Bytom", mark: "BYT",
    league: "1-liga", logo: "herby/polonia-bytom.png", color: "#243d78", accent: "#ef6467",
    transfermarkt: "https://www.transfermarkt.com/polonia-bytom/kader/verein/7976/saison_id/2026",
  },
  {
    id: "ruch-chorzow", name: "Ruch Chorzów", mark: "RCH",
    league: "1-liga", logo: "herby/ruch-chorzow.png", color: "#2259a1", accent: "#deecff",
    transfermarkt: "https://www.transfermarkt.com/ruch-chorzow/kader/verein/318/saison_id/2026",
  },
  {
    id: "stal-mielec", name: "Stal Mielec", mark: "STM",
    league: "1-liga", logo: "herby/stal-mielec.png", color: "#24568a", accent: "#e2edf8",
    transfermarkt: "https://www.transfermarkt.com/stal-mielec/kader/verein/22431/saison_id/2026",
  },
  {
    id: "unia-skierniewice", name: "Unia Skierniewice", mark: "UNI",
    league: "1-liga", logo: "herby/unia-skierniewice.png", color: "#244d84", accent: "#f0df72",
    transfermarkt: "https://www.transfermarkt.com/unia-skierniewice/kader/verein/30753/saison_id/2026",
  },
  {
    id: "warta-poznan", name: "Warta Poznań", mark: "WAR",
    league: "1-liga", logo: "herby/warta-poznan.png", color: "#1d6342", accent: "#d8ecd2",
    transfermarkt: "https://www.transfermarkt.com/warta-posen/kader/verein/7146/saison_id/2026",
  },
];
