use std::error::Error;
use std::result::Result;

use ollama_rs::generation::completion::request::GenerationRequest;
use ollama_rs::generation::format::FormatType;
use ollama_rs::Ollama;

// generate the keywords list from a given document. Returns a json object stringified
pub async fn gen_keywords(
    ollama: &Ollama,
    model: &str,
    prompt: &str,
) -> Result<String, Box<dyn Error>> {
    let req = GenerationRequest::new(model.into(), prompt.to_string()).format(FormatType::Json);

    let res = ollama.generate(req).await;

    if let Ok(res) = res {
        Ok(res.response)
    } else {
        return Err("An error occured during the generation".into());
    }
}
