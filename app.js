const BASE_URL = "https://api.restcountries.com/countries/v5";
const FIELDS = "names.common,capitals,region,population,area,kilometers,flag.url_svg,flag.description";


const grid = document.getElementById("grid");
const statusMsg= document.getElementById("status");
const retryBtn = document.getElementById("retry");
const searchInput = document.getElementById("search");
const regionSelect = document.getElementById("region");
const sortSelect = document.getElementById("sort");

let countries = [];


async function fetchPage(offset) {
    const url = BASE_URL + "?limit=100&offset=" + offset + "&response_fields=" + FIELDS;
    const res = await fetch(url, {
        headers: {
            "Authorization": "Bearer " + API_KEY
        }
    });
    if (!res.ok) throw new Error("API error: " + res.status);
    return res.json();
}
     
function createCard(c) {
    const card = document.createElement("article");
    card.className = "card";

    const img = document.createElement("img");
    img.src = c.flag.url_svg;
    img.alt = c.flag.description || "Flag of " + c.names.common;
    img.addEventListener("error", function() {
      const placeholder = document.createElement("div");
      placeholder.className = "no-flag";
      placeholder.textContent = "No flag available";
      img.replaceWith(placeholder);
    });
    const name = document.createElement("h2");
        name.textContent = c.names.common;
    
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.dataset.region = c.region;
    badge.textContent= c.region;    

    const capital = c.capitals && c.capitals.length > 0 ? c.capitals[0].name : "None";
    const info = document.createElement("p");
  info.textContent = "Capital: " + capital ;

    const pop = document.createElement("p");
  pop.textContent = "Population: " + (c.population || 0).toLocaleString();

  card.append(img, badge, name, info, pop);
  return card;
}

function render(list) {
    grid.replaceChildren(...list.map(createCard));
    if (list.length === 0) {
        statusMsg.textContent = "No countries found. Try a different name or region.";
    } else {
    statusMsg.textContent = "Showing " + list.length + " of " + countries.length + " countries.";
}
}

function fillRegions() {
  regionSelect.length = 1;
  const regions = [...new Set(countries.map(c => c.region).filter(Boolean))].sort();
  for (const r of regions) {
    const option = document.createElement("option");
    option.value = r;
    option.textContent = r;
    regionSelect.appendChild(option);
  }
}

function applyFilters() {
  const term = searchInput.value.trim().toLowerCase();
  const region = regionSelect.value;

  const list = countries.filter(function (c) {
    const capital = c.capitals && c.capitals.length > 0 ? c.capitals[0].name.toLowerCase() : "";
    const matchesTerm = c.names.common.toLowerCase().includes(term) || capital.includes(term);
    const matchesRegion = region === "all" || c.region === region;
    return matchesTerm && matchesRegion;
  });

  const area = (c) => (c.area ? c.area.kilometers : 0);
  const pop = (c) => c.population || 0;

  switch (sortSelect.value) {
    case "name-desc": list.sort((a, b) => b.names.common.localeCompare(a.names.common)); break;
    case "pop-asc": list.sort((a, b) => pop(a) - pop(b)); break;
    case "pop-desc": list.sort((a, b) => pop(b) - pop(a)); break;
    case "area-asc": list.sort((a, b) => area(a) - area(b)); break;
    case "area-desc": list.sort((a, b) => area(b) - area(a)); break;
    default: list.sort((a, b) => a.names.common.localeCompare(b.names.common));
  }

  render(list);
}

async function loadCountries() {
     statusMsg.textContent = "Loading countries…";
     retryBtn.hidden = true;
    try {
      countries = [];
      let offset = 0;
      let more = true;

      while (more) {
        const page = await fetchPage(offset);
        countries = countries.concat(page.data.objects);
        more = page.data.meta.more;
        offset += 100;
      }

      fillRegions();
      applyFilters();

  } catch (err) {
    statusMsg.textContent = "Could not load countries: " + err.message;
    retryBtn.hidden = false;
  }
}

retryBtn.addEventListener("click", loadCountries);
searchInput.addEventListener("input", applyFilters);
regionSelect.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);
loadCountries();