const mediaByName = new Map();

const wantedServices = [
  "Implantációs protetika",
  "Esztétikai fogászat",
  "Bérnyomtatás",
];

const wantedProducts = [
  "Crown & Bridge PRO",
  "Splint Resin",
  "3D PRO Multilayer cirkontömb",
];

function imageUrl(item) {
  return item?.localPath || (item?.localUrl ? `public/${item.localUrl}` : "") || item?.url || "";
}

function productImage(product) {
  return imageUrl(product?.images?.[0]);
}

function findMediaByFile(fileName) {
  return mediaByName.get(fileName.toLowerCase());
}

function formatPrice(price) {
  if (Array.isArray(price)) {
    const numeric = price.map((value) => Number(value)).filter(Boolean);
    if (!numeric.length) return "Ajánlatkérés";
    return `${Math.min(...numeric).toLocaleString("hu-HU")} Ft-tól`;
  }
  const numeric = Number(price);
  return numeric ? `${numeric.toLocaleString("hu-HU")} Ft` : "Ajánlatkérés";
}

function renderHero(media) {
  const slides = ["slide_2.jpg", "slide_3.jpg", "slide_4.jpg", "slide_5.jpg"]
    .map((name) => findMediaByFile(name))
    .filter(Boolean);
  const container = document.querySelector("#heroSlider");
  container.innerHTML = slides
    .map((slide, index) => `<div class="hero-slide ${index === 0 ? "active" : ""}" style="background-image:url('${imageUrl(slide)}')"></div>`)
    .join("");

  let current = 0;
  window.setInterval(() => {
    const nodes = [...container.querySelectorAll(".hero-slide")];
    if (!nodes.length) return;
    nodes[current].classList.remove("active");
    current = (current + 1) % nodes.length;
    nodes[current].classList.add("active");
  }, 5000);
}

function renderServices() {
  const cards = [
    {
      title: "Implantációs protetika",
      image: findMediaByFile("Implantacios-protetika.png"),
    },
    {
      title: "Esztétikai fogászat",
      image: findMediaByFile("Esztetikai-fogaszat.png"),
    },
    {
      title: "Bérnyomtatás",
      image: findMediaByFile("Bernyomtatas.png"),
    },
  ];

  document.querySelector("#serviceGrid").innerHTML = cards
    .map((card) => `
      <article class="service-card">
        <img src="${imageUrl(card.image)}" alt="${card.title}">
        <h3>${card.title}</h3>
      </article>
    `)
    .join("");

  const highlightOne = findMediaByFile("Bernyomtatas.png");
  const highlightTwo = findMediaByFile("Implantacios-protetika.png");
  document.querySelector("#highlightOne").style.backgroundImage = `url('${imageUrl(highlightOne)}')`;
  document.querySelector("#highlightTwo").style.backgroundImage = `url('${imageUrl(highlightTwo)}')`;
}

function renderProducts(products) {
  const chosen = wantedProducts
    .map((title) => products.find((product) => product.title === title))
    .filter(Boolean);

  document.querySelector("#productGrid").innerHTML = chosen
    .map((product) => `
      <article class="product-card">
        <img src="${productImage(product)}" alt="${product.title}">
        <h3>${product.title}</h3>
        <div class="meta">
          <span>${product.brand || "DentArtTechnik"}</span>
          <strong>${formatPrice(product.price)}</strong>
        </div>
      </article>
    `)
    .join("");
}

function renderNews(posts) {
  document.querySelector("#newsGrid").innerHTML = posts
    .filter((post) => post.title)
    .slice(0, 3)
    .map((post) => {
      const media = post.featuredMedia;
      return `
        <article class="news-card">
          ${media ? `<img src="${imageUrl(media)}" alt="${post.title}">` : ""}
          <h3>${post.title}</h3>
          <div class="meta">
            <span>${post.postDate?.slice(0, 10) || ""}</span>
            <strong>Hír</strong>
          </div>
        </article>
      `;
    })
    .join("");
}

async function init() {
  const [media, products, posts] = await Promise.all([
    fetch("data/media.json").then((response) => response.json()),
    fetch("data/products.json").then((response) => response.json()),
    fetch("data/posts.json").then((response) => response.json()),
  ]);

  media.forEach((item) => {
    if (item.attachedFile) {
      mediaByName.set(item.attachedFile.toLowerCase(), item);
    }
  });

  renderHero(media);
  renderServices();
  renderProducts(products);
  renderNews(posts);
}

document.querySelector(".menu-toggle").addEventListener("click", (event) => {
  const open = document.body.classList.toggle("menu-open");
  event.currentTarget.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".primary-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
  });
});

init();
