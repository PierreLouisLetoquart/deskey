import { tempdir } from "@tauri-apps/api/os";
import { appConfigDir } from "@tauri-apps/api/path";
import { downloadDir } from "@tauri-apps/api/path";
import { ask, message } from "@tauri-apps/api/dialog";

const tempdirPath = await tempdir();
// path to the app's configuration directory
const appConfigDirPath = await appConfigDir();
const downloadDirPath = await downloadDir();

console.log("tmp dir : " + tempdirPath);
console.log("config dir : " + appConfigDirPath);
console.log("download dir : " + downloadDirPath);

// Native dialog
const dialogBtn = document.getElementById("dialogBtn");

if (dialogBtn === null) {
  throw new Error("dialogBtn is null");
} else {
  dialogBtn.addEventListener("click", async () => {
    const yes = await ask("This action cannot be reverted. Are you sure?", {
      title: "Tauri",
      type: "info",
    });

    console.log(yes);
  });
}

// Native messages
const messageBtn = document.getElementById("messageBtn");

if (messageBtn === null) {
  throw new Error("messageBtn is null");
} else {
  messageBtn.addEventListener("click", async () => {
    await message("File not found", { title: "Tauri", type: "error" });
  });
}
