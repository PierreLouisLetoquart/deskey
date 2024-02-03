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

appWindow.listen("tauri://file-drop", ({ payload }: { payload: string[] }) => {
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
});

// === Generate keywords ===

const generateKeywords = async (path: string): Promise<string[]> => {
  let response: string[] = [];

  invoke<string>("gen_keywords", {
    document: path,
    model: "model-keywords:latest",
  })
    .then((res) => {
      JSON.parse(res).forEach((text: string) => {
        response.push(text);
      });
    })
    .catch((e) => {
      console.error(e);
    });

  return response;
};

const btn = document.getElementById("submit") as HTMLButtonElement;
btn.addEventListener("click", async () => {
  if (filePath === null) {
    return;
  }
  const keywords = await generateKeywords(filePath);
  console.log(keywords);
});
