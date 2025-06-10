use anyhow::Result;
use std::path::Path;
use crate::utils::fs::FileSystem;
use crate::core::processor::MediaProcessor;

pub struct PhotoRenamer {
    processor: MediaProcessor,
}

impl PhotoRenamer {
    pub fn new(orientation_mode: crate::args::OrientationMode) -> Self {
        Self {
            processor: MediaProcessor::new(orientation_mode),
        }
    }

    pub fn process_directory(&mut self, dir: &Path, output_dir: Option<&Path>) -> Result<()> {
        let files = self.processor.fs.find_all_media_files(dir)?;
        self.processor.display.set_total_files(files.len());

        for file in files {
            self.processor.process_file(&file, output_dir)?;
        }

        Ok(())
    }
} 