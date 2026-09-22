const DATA_URL = "airbnb_sf_listings_500.json"; // path to JSON file
const NUM_LISTINGS_TO_SHOW = 50;  // show first 50 listings

// DOM elements
const listingsContainer = document.getElementById("listings-container");
const statusMessage = document.getElementById("status-message");

/**
 * Parsing the amenities field in the JSON, which is a JSON-encoded string
 */
function parseAmenities(rawAmenities) {
  try {
    return JSON.parse(rawAmenities);
  } catch (error) {
    return []; // fall back to an empty list if parsing fails
  }
}

/**
 * Strip the "description" field of HTML tags (<br />, <b>...</b>)
 */
function stripHtml(htmlString) {
  const temp = document.createElement("div");
  temp.innerHTML = htmlString || "";
  return temp.textContent || "";
}

/** function to cap character length, adding "…" if it was cut off. */
function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

// build a listing cated
function createListingCard(listing) {
  const amenities = parseAmenities(listing.amenities);
  const shownAmenities = amenities.slice(0, 6);
  const extraAmenityCount = amenities.length - shownAmenities.length;

  const amenitiesHtml = shownAmenities
    .map((amenity) => `<span class="amenity-tag">${amenity}</span>`)
    .join("");
  const extraAmenityHtml =
    extraAmenityCount > 0
      ? `<span class="amenity-tag">+${extraAmenityCount} more</span>`
      : "";

  // add superhost badge
  const superhostBadgeHtml =
    listing.host_is_superhost === "t"
      ? `<span class="superhost-badge">SUPERHOST</span>`
      : "";

  const shortDescription = truncate(stripHtml(listing.description), 220);

  // create <article> element to contain the listing card
  const card = document.createElement("article");
  card.className = "listing-card";

  // Building static image cards
  card.innerHTML = `
    <img
      class="card-thumbnail"
      src="${listing.picture_url}"
      alt="${listing.name}"
    />
    <div class="card-body">
      <h3 class="card-name">${listing.name}</h3>
      <p class="card-price">${listing.price} / night</p>
      <p class="card-description">${shortDescription}</p>
      <div class="amenities-list">${amenitiesHtml}${extraAmenityHtml}</div>
      <div class="host-row">
        <img
          class="host-photo"
          src="${listing.host_picture_url}"
          alt="${listing.host_name}"
        />
        <span class="host-name">Hosted by ${listing.host_name}</span>
        ${superhostBadgeHtml}
      </div>
    </div>
  `;

  return card;
}

/** Renders an array of listing objects into the page. */
function renderListings(listings) {
  // Using a DocumentFragment so we only touch the real DOM once
  const fragment = document.createDocumentFragment();
  listings.forEach((listing) => {
    fragment.appendChild(createListingCard(listing));
  });
  listingsContainer.appendChild(fragment);
}

/** Fetch the JSON file and kick off rendering, using async/await. */
async function loadListings() {
  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const allListings = await response.json();
    const firstFifty = allListings.slice(0, NUM_LISTINGS_TO_SHOW);

    renderListings(firstFifty);

    // Data loaded successfully — remove the "Loading…" message
    statusMessage.remove();
  } catch (error) {
    // Show error message on the page instead of failing silently
    statusMessage.textContent =
      "Sorry, something went wrong loading the listings. Please try again later.";
    console.error("Failed to load listings:", error);
  }
}

loadListings();
