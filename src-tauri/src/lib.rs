use serde::{Deserialize, Serialize};
use std::fs;
use tauri::command;

#[derive(Serialize, Deserialize, Debug)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Vec<FileEntry>,
}

#[command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[command]
fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[command]
fn scan_dir(path: String) -> Result<Vec<FileEntry>, String> {
    scan_recursive(&path).map_err(|e| e.to_string())
}

fn scan_recursive(path: &str) -> Result<Vec<FileEntry>, std::io::Error> {
    let mut entries = Vec::new();
    for entry in fs::read_dir(path)? {
        let entry = entry?;
        let meta = entry.metadata()?;
        let name = entry.file_name().to_string_lossy().to_string();
        let full_path = entry.path().to_string_lossy().to_string();

        if meta.is_dir() {
            let children = scan_recursive(&full_path).unwrap_or_default();
            if !children.is_empty() {
                entries.push(FileEntry {
                    name,
                    path: full_path,
                    is_dir: true,
                    children,
                });
            }
        } else if name.ends_with(".md") {
            entries.push(FileEntry {
                name,
                path: full_path,
                is_dir: false,
                children: vec![],
            });
        }
    }
    entries.sort_by(|a, b| match (a.is_dir, b.is_dir) {
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
    });
    Ok(entries)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_file, write_file, scan_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
