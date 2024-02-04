// === Tauri related ===
import { appWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api";
// === UI/Anim related ===
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(TextPlugin);

// === Global Variables ===
let filePath: string | null = null;
let ollamaIsUp = false;
let ollamaError: string | null = null;

type keyword = {
  text: string;
  relevance: number;
};

let keywordsList: { keywords: keyword[] } | null = null;

// === Generate keywords ===
invoke("verify_model")
  .then(() => {
    ollamaIsUp = true;
  })
  .catch((e: string) => {
    ollamaIsUp = false;
    ollamaError = e;
  });

const keywordsEl = document.getElementById("keywords") as HTMLDivElement;

const generateKeywords = async () => {
  if (ollamaIsUp === false) {
    keywordsEl.innerText = ollamaError || "Ollama is down";
  }

  if (filePath === null) {
    keywordsEl.innerText = "No file selected";
  }

  keywordsEl.innerText = "Generating keywords...";

  invoke<string>("generate_keywords", { path: filePath })
    .then((res) => {
      keywordsList = JSON.parse(res);

      if (!keywordsList) {
        keywordsEl.innerText = "No keywords found";
        return;
      }

      keywordsEl.innerHTML = "";

      const keywordsListEl = document.createElement("ul");
      keywordsListEl.id = "keywords-list";

      keywordsList.keywords.forEach((el: keyword) => {
        const li = document.createElement("li");
        li.innerHTML = `${el.text} <span>${el.relevance}</span>`;
        keywordsListEl.appendChild(li);
      });

      keywordsEl.appendChild(keywordsListEl);
    })
    .catch((e) => {
      keywordsEl.innerText = e;
    });
};

// === File Drop Zone ===

let dropZoneTexts = {
  default:
    '<p>Drag &apos;n&apos; drop a file or <span class="cta-min">click to select one</span></p>',
  hover: "Drop it!",
  error: "One file at a time please",
  unknown: "An error occurred. Please try again",
};

const dropZone = document.getElementById("dropzone") as HTMLDivElement;
dropZone.innerHTML = dropZoneTexts.default;

dropZone.addEventListener("click", async () => {
  const selected = await open({
    multiple: false,
    filters: [
      {
        name: "Document",
        extensions: ["txt", "md", "html"],
      },
    ],
  });

  if (selected !== null) {
    if (Array.isArray(selected)) {
      dropZone.innerText = dropZoneTexts.error;
      return;
    }
    filePath = selected;
    gsap.to(dropZone, {
      duration: 2.5,
      text: selected,
      ease: "slow(0.7,0.7,false)",
    });

    await generateKeywords();
  }
});

appWindow.listen(
  "tauri://file-drop-hover",
  ({ payload }: { payload: string[] }) => {
    if (payload.length === 1) {
      dropZone.innerText = dropZoneTexts.hover;
    }
  },
);

appWindow.listen("tauri://file-drop-cancelled", () => {
  if (filePath !== null) {
    dropZone.innerText = filePath;
    return;
  }
  dropZone.innerHTML = dropZoneTexts.default;
});

appWindow.listen(
  "tauri://file-drop",
  async ({ payload }: { payload: string[] }) => {
    if (payload.length === 0) {
      dropZone.innerText = dropZoneTexts.unknown;
      return;
    }

    if (payload.length > 1) {
      dropZone.innerText = dropZoneTexts.error;
      return;
    }

    filePath = payload[0];

    gsap.to(dropZone, {
      duration: 2,
      text: payload[0],
      ease: "none",
    });

    await generateKeywords();
  },
);
