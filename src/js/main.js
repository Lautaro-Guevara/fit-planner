import { loadHeaderFooter } from "./utils.mjs";

async function init() {
  await loadHeaderFooter(); // wait until header/footer are fully loaded
}

init();