// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod generation;
mod model;

use ollama_rs::Ollama;
use tauri::Manager;

#[tauri::command]
async fn verify_model() -> Result<(), String> {
    let ollama = Ollama::default();

    let models = model::list_local_models(&ollama).await.unwrap();

    if !model::check_model_availability("templite:latest", &models).is_ok() {
        let _ = model::create_model(&ollama, "templite", "./assets/Modelfile")
            .await
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn generate_keywords(path: &str) -> Result<String, String> {
    if !std::path::Path::new(path).exists() {
        return Err("File not found".to_string());
    }

    let content = std::fs::read_to_string(path).map_err(|e| e.to_string())?;

    let ollama = Ollama::default();

    let result = generation::gen_keywords(&ollama, "templite:latest", &content)
        .await
        .map_err(|e| e.to_string())?;
    Ok(result)
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![verify_model, generate_keywords])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
