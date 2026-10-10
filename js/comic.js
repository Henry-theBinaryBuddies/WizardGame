
import * as pdfjsLib from
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

// =========================================================
// CONFIGURATION
// =========================================================

const PDF_URL =
  "./assets/TUNNEL%20RUN_WebComic.pdf";

const RENDER_SCALE = 1.8;

// =========================================================
// DOM REFERENCES
// =========================================================

const bookElement =
  document.getElementById("comic-book");

const stage =
  document.getElementById("reader-stage");

const loadingMessage =
  document.getElementById("loading-message");

const previousButton =
  document.getElementById("previous-page");

const nextButton =
  document.getElementById("next-page");

const pageCounter =
  document.getElementById("page-counter");

const zoomButton =
  document.getElementById("zoom-page");

const zoomRightButton =
  document.getElementById("zoom-right-page");

const zoomOverlay =
  document.getElementById("zoom-overlay");

const closeZoomButton =
  document.getElementById("close-zoom");

const zoomCanvas =
  document.getElementById("zoom-canvas");

// =========================================================
// STATE
// =========================================================

let pdfDocument = null;
let pageFlip = null;
let totalPages = 0;

let pageWidth = 396;
let pageHeight = 612;

// =========================================================
// LOAD PDF
// =========================================================

async function loadComic() {

  try {

    pdfDocument =
      await pdfjsLib.getDocument(PDF_URL).promise;

    totalPages = pdfDocument.numPages;

    const firstPage =
      await pdfDocument.getPage(1);

    const viewport =
      firstPage.getViewport({ scale: 1 });

    pageWidth = viewport.width;
    pageHeight = viewport.height;

    await renderAllPages();

    loadingMessage.classList.add("hidden");

    initializeBook();

  }
  catch (error) {

    console.error(
      "Failed to load comic:",
      error
    );

    loadingMessage.classList.remove("hidden");

    loadingMessage.textContent =
      "UNABLE TO LOAD COMIC. CHECK PDF PATH OR NETWORK.";

  }
}

// =========================================================
// RENDER PDF PAGES
// =========================================================

async function renderAllPages() {

  bookElement.innerHTML = "";

  for (
    let pageNumber = 1;
    pageNumber <= totalPages;
    pageNumber++
  ) {

    const page =
      await pdfDocument.getPage(pageNumber);

    const viewport =
      page.getViewport({
        scale: RENDER_SCALE
      });

    const canvas =
      document.createElement("canvas");

    canvas.width =
      Math.ceil(viewport.width);

    canvas.height =
      Math.ceil(viewport.height);

    const context =
      canvas.getContext("2d");

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    const pageElement =
      document.createElement("div");

    pageElement.className = "comic-page";

    const image =
      document.createElement("img");

    image.src =
      canvas.toDataURL("image/jpeg", 0.92);

    image.alt =
      `Comic page ${pageNumber}`;

    image.draggable = false;

    pageElement.appendChild(image);
    bookElement.appendChild(pageElement);

    // Release temporary rendering canvas memory.
    canvas.width = 0;
    canvas.height = 0;
  }
}

// =========================================================
// INITIALIZE PAGE FLIP
// =========================================================

function initializeBook() {

  if (typeof St === "undefined" ||
    typeof St.PageFlip !== "function") {

    throw new Error(
      "StPageFlip library did not load."
    );
  }

  const maxPageWidth = Math.max(
    240,
    Math.floor(
      (stage.clientHeight - 20) *
      (pageWidth / pageHeight)
    )
  );

  pageFlip = new St.PageFlip(bookElement, {

    width: pageWidth,
    height: pageHeight,

    size: "stretch",

    minWidth: 240,
    maxWidth: maxPageWidth,

    minHeight: 100,
    maxHeight: 2400,

    showCover: true,
    flippingTime: 700,

    maxShadowOpacity: 0.35,

    mobileScrollSupport: false

  });

  pageFlip.loadFromHTML(
    document.querySelectorAll(".comic-page")
  );

  pageFlip.on("flip", () => {
    updateControls();
  });

  pageFlip.on("changeOrientation", () => {
    updateControls();
  });

  updateControls();
}

// =========================================================
// NAVIGATION
// =========================================================

function updateControls() {

  if (!pageFlip) {
    return;
  }

  const currentPage =
    pageFlip.getCurrentPageIndex();

  const orientation =
    pageFlip.getOrientation();

  const isPortrait =
    orientation === "portrait";

  let firstVisiblePage = currentPage + 1;
  let lastVisiblePage = firstVisiblePage;

  if (!isPortrait && currentPage > 0) {

    // Desktop spreads contain two facing pages.
    firstVisiblePage = currentPage + 1;

    lastVisiblePage =
      Math.min(
        firstVisiblePage + 1,
        totalPages
      );
  }

  if (firstVisiblePage === lastVisiblePage) {

    pageCounter.textContent =
      `PAGE ${firstVisiblePage} / ${totalPages}`;

  }
  else {

    pageCounter.textContent =
      `PAGES ${firstVisiblePage}-${lastVisiblePage}`;

  }

  previousButton.disabled =
    currentPage === 0;

  nextButton.disabled =
    currentPage >= totalPages - 1;

  const hasTwoPages =
    !isPortrait &&
    currentPage > 0 &&
    currentPage < totalPages - 1;

  zoomButton.textContent =
    hasTwoPages
      ? "ENLARGE LEFT"
      : "ENLARGE PAGE";

  zoomRightButton.classList.toggle(
    "hidden",
    !hasTwoPages
  );

}

previousButton.addEventListener(
  "click",
  () => {
    pageFlip?.flipPrev();
  }
);

nextButton.addEventListener(
  "click",
  () => {
    pageFlip?.flipNext();
  }
);

document.addEventListener(
  "keydown",
  event => {

    if (!zoomOverlay.classList.contains("hidden")) {

      if (event.key === "Escape") {
        closeZoom();
      }

      return;
    }

    if (!pageFlip) {
      return;
    }

    if (event.key === "ArrowLeft") {

      event.preventDefault();
      pageFlip.flipPrev();

    }
    else if (event.key === "ArrowRight") {

      event.preventDefault();
      pageFlip.flipNext();

    }
  }
);

// =========================================================
// ZOOM
// =========================================================

async function openZoom(pageOffset = 0) {

  if (!pdfDocument || !pageFlip) {
    return;
  }

  const pageNumber =
    pageFlip.getCurrentPageIndex() + 1 + pageOffset;

  const page =
    await pdfDocument.getPage(pageNumber);

  const viewport =
    page.getViewport({
      scale: 2.5
    });

  zoomCanvas.width =
    Math.ceil(viewport.width);

  zoomCanvas.height =
    Math.ceil(viewport.height);

  const context =
    zoomCanvas.getContext("2d");

  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;

  zoomOverlay.classList.remove("hidden");
}

function closeZoom() {

  zoomOverlay.classList.add("hidden");

  zoomCanvas.width = 0;
  zoomCanvas.height = 0;
}

zoomButton.addEventListener(
  "click",
  () => openZoom(0)
);

zoomRightButton.addEventListener(
  "click",
  () => openZoom(1)
);

closeZoomButton.addEventListener(
  "click",
  closeZoom
);

zoomOverlay.addEventListener(
  "click",
  event => {

    if (event.target === zoomOverlay) {
      closeZoom();
    }
  }
);

loadComic();
