import { ArrowDown, ArrowRight, Mail, MapPin, Menu, Phone } from 'lucide-react';

const offers = [
  {
    "code": "01",
    "title": "iBar",
    "kicker": "Implantációs protetika",
    "lead": "Egyedileg tervezett titán váz komplex implantációs esetekhez.",
    "text": "Az aktuális ajánlat frissítés alatt áll.",
    "pdf": ""
  },
  {
    "code": "02",
    "title": "iBridge",
    "kicker": "Implantációs protetika",
    "lead": "Egyedi megoldás teljes íves implantációs rehabilitációkhoz.",
    "text": "Az aktuális ajánlat frissítés alatt áll.",
    "pdf": ""
  },
  {
    "code": "03",
    "title": "Subperiostealis implantátumok",
    "kicker": "Egyéni implantátumok",
    "lead": "Személyre szabott megoldások, digitális tervezéssel.",
    "text": "A 2 és 4 pilléres konstrukciók tartalma és árai a részletes ajánlatban találhatók.",
    "pdf": "subperiostealis-implantatumok"
  },
  {
    "code": "04",
    "title": "All-on-4",
    "kicker": "Teljes íves rehabilitáció",
    "lead": "4 implantátumra készülő, 12 tagú CoCr kerámia fogpótlás.",
    "text": "A csomag árát, a külön fizetendő alkatrészeket és a feltételeket a PDF tartalmazza.",
    "pdf": "all-on-4"
  },
  {
    "code": "05",
    "title": "All-on-6",
    "kicker": "Teljes íves rehabilitáció",
    "lead": "6 implantátumra készülő, 12 tagú CoCr kerámia fogpótlás.",
    "text": "A csomag árát, a külön fizetendő alkatrészeket és a feltételeket a PDF tartalmazza.",
    "pdf": "all-on-6"
  },
  {
    "code": "06",
    "title": "3D Resin",
    "kicker": "D-Tech anyagok",
    "lead": "Resinek a digitális fogtechnika különböző munkafolyamataihoz.",
    "text": "Típusok, kiszerelések, nettó és bruttó árak egy helyen.",
    "pdf": "3d-resin"
  }
];

export default function Home() {
  return <main>
    <header className="site-header">
      <a href="#top" className="brand" aria-label="Dent-Art-Technik – Kezdőlap"><img src="/assets/dentart-logo.png" alt="Dent-Art-Technik" /></a>
      <nav aria-label="Fő navigáció"><a href="#ajanlatok">Ajánlatok</a><a href="#szakmai-anyagok">Szakmai anyagok</a><a href="#kapcsolat">Kapcsolat</a></nav>
      <a className="header-cta" href="mailto:labor@dentarttechnik.hu">Ajánlatkérés <ArrowRight size={17} /></a>
      <button className="menu-button" aria-label="Menü megnyitása"><Menu /></button>
    </header>

    <section className="hero" id="top">
      <div className="hero-image" aria-hidden="true" /><div className="hero-overlay" aria-hidden="true" />
      <div className="hero-content">
        <p className="eyebrow light">DentArtTechnik · Aktuális ajánlatok</p>
        <h1>Megoldások a mindennapi esetektől a komplex kihívásokig.</h1>
        <p className="hero-lead">A digitális tervezést, a korszerű gyártástechnológiát és több évtizedes fogtechnikai tapasztalatunkat ötvözzük azért, hogy minden esethez megfelelő megoldást biztosítsunk.</p>
        <a className="primary-button" href="#ajanlatok">Ajánlatok megtekintése <ArrowDown size={18} /></a>
      </div>
      <div className="hero-index" aria-hidden="true"><span>01</span><span className="line" /><span>05</span></div>
    </section>

    <section className="intro section" id="ajanlatok">
      <div className="section-heading"><p className="eyebrow">Kiemelt ajánlataink</p><h2>Különböző igények.<br />Személyre szabott megoldások.</h2></div>
      <p className="section-copy">Válaszd ki, melyik terület érdekel, és nézd meg a hozzá kapcsolódó aktuális ajánlatunkat. Az alábbi megoldások a tervezéstől a megvalósításig biztos szakmai hátteret adnak.</p>
    </section>

    <section className="offer-grid section" aria-label="Ajánlatok">
      {offers.map((offer) => <article className="offer-card" key={offer.code}>
        <div className="card-body"><span className="offer-number">{offer.code}</span><p className="card-kicker">{offer.kicker}</p><h3>{offer.title}</h3><strong>{offer.lead}</strong><p>{offer.text}</p>
        {offer.pdf ? <a href={`ajanlatok/${offer.pdf}.pdf`} target="_blank" rel="noopener" aria-label={`${offer.title} ajánlat megnyitása PDF-ben, új lapon`}>Ajánlat megnyitása · PDF ↗</a> : <><span className="offer-status">Frissítés alatt</span><a href={`mailto:labor@dentarttechnik.hu?subject=${encodeURIComponent(offer.title + ' ajánlat')}`}>Érdeklődöm →</a></>}
        </div>
      </article>)}
    </section>

    <section className="help section" id="kapcsolat">
      <div><p className="eyebrow">Egyedi esetek</p><h2>Nem találtad meg,<br />amit kerestél?</h2></div>
      <div className="help-copy"><p>Nem minden eset és szakmai igény illeszthető egy előre összeállított ajánlatba. Ha konkrét páciens esetéhez keresel megoldást, egyedi tervezésre van szükséged, vagy szeretnéd átbeszélni a lehetőségeket, vedd fel velünk a kapcsolatot.</p><p>Szakmai csapatunk segít végiggondolni a lehetőségeket és megtalálni az adott esethez megfelelő megoldást.</p><a className="text-link" href="mailto:labor@dentarttechnik.hu">Kapcsolatfelvétel <ArrowRight size={18} /></a></div>
    </section>

    <section className="knowledge" id="szakmai-anyagok"><div className="section knowledge-inner"><p className="eyebrow light">DentArtTechnik tudástár</p><h2>Előbb szeretnél minket<br />jobban megismerni?</h2><p>Megoldásaink mögött több évtizedes fogtechnikai tapasztalat, digitális tervezés és folyamatos technológiai fejlesztés áll. Katalógusainkat, szakmai értekezéseinket, tudományos anyagainkat és videóinkat egy helyen gyűjtöttük össze.</p><a className="outline-button" href="https://www.dentarttechnik.hu/hirek/">Szakmai anyagok megtekintése <ArrowRight size={18} /></a></div></section>

    <section className="final-cta section"><div><p className="eyebrow">Közös gondolkodás</p><h2>Van egy eset, amit szívesen átbeszélnél velünk?</h2></div><div className="final-action"><p>A komplex eseteknél különösen fontos a közös gondolkodás. Küldd el kérdésedet, és szakmai csapatunk segít a következő lépésben.</p><a className="primary-button dark" href="mailto:labor@dentarttechnik.hu">Írj nekünk <Mail size={18} /></a></div></section>

    <footer><div className="footer-main section"><div className="footer-brand"><img src="/assets/dentart-logo.png" alt="Dent-Art-Technik" /><p>Innováció és stabilitás<br />a fogtechnikában.</p></div><div className="footer-contact"><h3>Elérhetőségek</h3><a href="https://maps.google.com/?q=9024+Győr+Csokonai+utca+10"><MapPin size={17} /> 9024 Győr, Csokonai u. 10.</a><a href="mailto:labor@dentarttechnik.hu"><Mail size={17} /> labor@dentarttechnik.hu</a><a href="tel:+36302273927"><Phone size={17} /> +36 30 227 3927</a></div><div className="footer-links"><h3>Információk</h3><a href="https://www.dentarttechnik.hu/rolunk/">Rólunk</a><a href="https://www.dentarttechnik.hu/adatkezelesi-tajekoztato/">Adatkezelés</a><a href="https://www.dentarttechnik.hu/kapcsolat/">Kapcsolat</a></div></div><div className="copyright section"><span>© 2026 Dent-Art-Technik Kft.</span><a href="https://da-technology.eu" target="_blank" rel="noopener noreferrer">Created by D.A.-Tech</a></div></footer>
  </main>;
}
