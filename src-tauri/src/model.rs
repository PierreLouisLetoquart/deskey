use std::error::Error;
use std::path::Path;
use std::result::Result;

use ollama_rs::models::create::CreateModelRequest;
use ollama_rs::models::LocalModel;
use ollama_rs::Ollama;

fn abs_path(path: &str) -> Result<String, Box<dyn Error>> {
    Ok(Path::new(path)
        .canonicalize()
        .map_err(|e| e.to_string())?
        .to_str()
        .unwrap()
        .to_string())
}

// Create a model using a modelfile
pub async fn create_model(
    ollama: &Ollama,
    name: &str,
    modelfile_path: &str,
) -> Result<(), Box<dyn Error>> {
    if !Path::new(modelfile_path).exists() {
        return Err("Modelfile path provided is wrong".into());
    }

    let modelfile_path = abs_path(modelfile_path)?;
    let req = CreateModelRequest::path(name.into(), modelfile_path);

    let _ = ollama.create_model(req).await.map_err(|e| e.to_string())?;

    Ok(())
}

// Get the list of local LLM installed on the system
pub async fn list_local_models(ollama: &Ollama) -> Result<Vec<LocalModel>, Box<dyn Error>> {
    let local_models = ollama.list_local_models().await?;
    Ok(local_models)
}

// Check if a certain model is available on the system
pub fn check_model_availability(
    name: &str,
    available: &[LocalModel],
) -> Result<(), Box<dyn Error>> {
    if !available.iter().any(|model| model.name == name) {
        return Err("Model isn't available".into());
    } else {
        Ok(())
    }
}
