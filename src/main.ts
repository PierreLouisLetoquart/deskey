import { appWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/api/dialog";

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
    dropZone.innerText = selected;
    filePath = selected;
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

  dropZone.innerText = payload[0];
  filePath = payload[0];
});
