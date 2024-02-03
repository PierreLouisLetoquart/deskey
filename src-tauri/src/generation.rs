use anyhow::{bail, Context, Result};
use ollama_rs::generation::format::FormatType;
use ollama_rs::{generation::completion::request::GenerationRequest, models::LocalModel, Ollama};
use serde_json;

#[tauri::command]
pub async fn gen_keywords(document: &str, model: &str) -> Result<String, String> {
    let ollama = Ollama::default();

    let models_available = list_local_models(&ollama)
        .await
        .map_err(|err| err.to_string())?;

    check_model_availability(model, &models_available).map_err(|err| err.to_string())?;

    let content = std::fs::read_to_string(document)
        .with_context(|| format!("Unable to read the file: {:?}", document))
        .map_err(|err| err.to_string())?;

    println!("Generating keywords...");

    let res = ollama
        .generate(GenerationRequest::new(model.to_string(), content).format(FormatType::Json))
        .await
        .map_err(|err| anyhow::anyhow!("Unable to generate the document: {}", err));

    if let Ok(res) = res {
        let j = serde_json::to_string(&res.response).map_err(|err| err.to_string())?;
        Ok(j)
    } else {
        return Err("Unable to generate the document".to_string());
    }
}

async fn list_local_models(ollama: &Ollama) -> Result<Vec<LocalModel>> {
    ollama
        .list_local_models()
        .await
        .with_context(|| "Unable to list local models")
}

fn check_model_availability(model_name: &str, models_available: &[LocalModel]) -> Result<()> {
    if !models_available
        .iter()
        .any(|model| model.name == model_name)
    {
        bail!("Model '{}' is not available.", model_name);
    }
    Ok(())
}
