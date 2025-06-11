# Icons

Place your application icons here:

- `32x32.png` - 32x32 pixel PNG icon
- `128x128.png` - 128x128 pixel PNG icon  
- `128x128@2x.png` - 256x256 pixel PNG icon for retina displays
- `icon.icns` - macOS icon file
- `icon.ico` - Windows icon file

To enable icons, update the `icon` array in `tauri.conf.json`:

```json
"icon": [
  "icons/32x32.png",
  "icons/128x128.png", 
  "icons/128x128@2x.png",
  "icons/icon.icns",
  "icons/icon.ico"
]
```