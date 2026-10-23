# Travel photo inbox

Upload JPG, PNG or WebP images into a folder named after an existing trip ID.

Example: `photo-inbox/2026-10-croatia/zadar-01.webp`

After merging this feature, commits to `main` under `photo-inbox/` trigger an automatic conversion to optimized WebP and update the galleries. Name files in display order (`zadar-01`, `zadar-02`, etc.).

Only upload photos you want to publish. Although the workflow removes uploaded originals from the latest branch, they may remain accessible in Git history. HEIC files must first be converted to JPEG.

If GitHub Actions reports permission denied, check Settings > Actions > General > Workflow permissions and allow Read and write permissions.
