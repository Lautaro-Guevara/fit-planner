// ==============================
// HEADER + FOOTER LOADER
// ==============================

const baseUrl = import.meta.env.BASE_URL || "/";

function withBase(path) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.replace(/^\/+/, "");
  return `${normalizedBase}${normalizedPath}`;
}

async function loadTemplate(path) {
  const res = await fetch(path);
  return await res.text();
}

export async function loadHeaderFooter() {
  const headerTemplate = await loadTemplate(withBase("partials/header.html"));
  const footerTemplate = await loadTemplate(withBase("partials/footer.html"));

  const headerElement = document.querySelector("#main-header");
  const footerElement = document.querySelector("#main-footer");

  console.log("Header loaded")

  if (!headerElement || !footerElement) return;

  headerElement.innerHTML = headerTemplate;
  footerElement.innerHTML = footerTemplate;

  headerElement.querySelectorAll("a[data-route]").forEach((link) => {
    const route = link.getAttribute("data-route");
    if (route) link.setAttribute("href", withBase(route));
  });

//   // IMPORTANT: wait for DOM injection before running cart badge
//   setTimeout(() => {
//     superscript();
//   }, 0);
}


export function createExerciseCard(exercise) {

    return `
    
    <article class="exercise-card">

        <img
            src="${exercise.gifUrl}"
            alt="${exercise.name}"
            class="exercise-image"
        >

        <div class="exercise-content">

            <h3>${exercise.name}</h3>

            <div class="tags">
                <span>${exercise.bodyPart}</span>
                <span>${exercise.target}</span>
            </div>

            <p>
                Exercise targeting the
                ${exercise.target} muscle group.
            </p>

            <button class="workout-btn">
                Add to Workout
            </button>

        </div>

    </article>

    `;
}