"use client";

export default function PropertyFilter() {
  function filterProperties(event) {
    const query = event.target.value.trim().toLowerCase();
    const cards = document.querySelectorAll("[data-property-card]");
    const links = document.querySelectorAll("[data-property-nav-item]");

    cards.forEach((card) => {
      const searchText = card.getAttribute("data-search") || "";
      card.hidden = query.length > 0 && !searchText.includes(query);
    });

    links.forEach((link) => {
      const searchText = link.getAttribute("data-search") || "";
      link.hidden = query.length > 0 && !searchText.includes(query);
    });
  }

  return (
    <label className="property-search">
      Find property
      <input type="search" placeholder="Search name, slug, or address" onChange={filterProperties} />
    </label>
  );
}
