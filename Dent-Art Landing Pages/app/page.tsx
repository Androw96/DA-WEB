import { ArrowDown, ArrowRight, Download, Mail, MapPin, Menu, Phone } from 'lucide-react';

const offers = [
  { code: '01', title: 'iBar', lead: 'Egyedileg tervezett titán váz komplex implantációs esetekhez', text: 'Digitális tervezéssel, az adott klinikai helyzethez igazodva készítjük el az iBar vázat a tervezéstől egészen a gyártásig.', image: '/assets/implant-protetika.png', accent: 'blue' },
  { code: '02', title: 'iBridge', lead: 'Egyedi megoldás teljes íves implantációs rehabilitációkhoz', text: 'A digitális tervezést és a gyártást egy komplex fogtechnikai megoldásban ötvözzük, az eset adottságaihoz és a végleges protetikai célokhoz igazodva.', image: '/assets/esztetika.png', accent: 'violet' },
  { code: '03', title: 'Egyéni implantátumok', lead: 'Személyre szabott megoldás speciális anatómiai helyzetekhez', text: 'A páciens CBCT-felvétele alapján olyan egyedi implantátumot tervezünk, amely igazodik a rendelkezésre álló csontállományhoz és a sebészeti szempontokhoz.', image: '/assets/bernyomtatas.png', accent: 'teal' },
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
      {offers.map((offer) => <article className={`offer-card ${offer.accent}`} key={offer.title}>
        <div className="card-image-wrap"><img src={offer.image} alt="" className="card-image" /><span className="card-code">{offer.code}</span></div>
        <div className="card-body"><p className="card-kicker">Implantációs protetika</p><h3>{offer.title}</h3><strong>{offer.lead}</strong><p>{offer.text}</p><a href={`mailto:labor@dentarttechnik.hu?subject=${encodeURIComponent(`${offer.title} ajánlat részletei`)}`}>Az ajánlat részletei <ArrowRight size={17} /></a></div>
      </article>)}
      <article className="wide-offer">
        <div className="wide-copy"><p className="eyebrow light">04 · Teljes íves rehabilitáció</p><h3>All-on-X</h3><p className="wide-lead">Komplex fogtechnikai háttér a tervezéstől a végleges fogpótlásig.</p><p>Összehangoljuk a digitális tervezés, a váz és a protetikai felépítmény fogtechnikai szempontjait. Válaszd ki az esetedhez tartozó konstrukciót.</p></div>
        <div className="download-options"><a href="mailto:labor@dentarttechnik.hu?subject=All-on-4 ajánlat"><span><b>All-on-4</b><small>4 implantátumra tervezve</small></span><Download size={21} /></a><a href="mailto:labor@dentarttechnik.hu?subject=All-on-6 ajánlat"><span><b>All-on-6</b><small>6 implantátumra tervezve</small></span><Download size={21} /></a></div>
      </article>
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
