# 🛠️ Installation Guide: SilenceX by Umar Saeed

Follow these steps to install the SilenceX plugin in Adobe Premiere Pro.

## 1. Prerequisites
- **Adobe Premiere Pro 2020 or newer** (Optimized for 2023).
- **ZXP Installer** (Recommended: [aescripts.com/learn/zxp-installer-instructions](https://aescripts.com/learn/zxp-installer-instructions/)).

## 2. Manual Installation (Development Mode)
If you are developing or don't have a signed ZXP:

1. **Locate the Extensions Folder:**
   - **macOS:** `/Users/<username>/Library/Application Support/Adobe/CEP/extensions/`
   - **Windows:** `C:\Users\<username>\AppData\Roaming\Adobe\CEP\extensions\`

2. **Copy the Plugin:**
   - Create a folder named `com.umarsaeed.silencex`.
   - Copy all files from this project (manifest, index.html, src, etc.) into that folder.

3. **Enable Player Debug Mode (Required for unsigned extensions):**
   - **macOS:** Open Terminal and run:
     `defaults write com.adobe.CSXS.11 PlayerDebugMode 1` (Change 11 to your version, e.g., 10 for older).
   - **Windows:**
     - Open Registry Editor (`regedit`).
     - Go to `HKEY_CURRENT_USER/Software/Adobe/CSXS.11`.
     - Create a New String Value named `PlayerDebugMode` and set it to `1`.

## 3. Launching
1. Open Adobe Premiere Pro.
2. Go to **Window > Extensions > SilenceX**.
3. Select an audio clip or voiceover in your timeline.
4. Adjust Threshold and Minimum Duration in the SilenceX panel.
5. Click **Scan Silence** then **Remove**.

---

# 🐞 Debugging Guide

### Plugin won't show up in the Menu?
- Check your `manifest.xml` for any typos.
- Ensure the folder name in `CEP/extensions` matches the BundleId in manifest.
- Restart Premiere Pro after making changes to the manifest.

### "Scan Silence" doesn't find anything?
- Ensure your audio levels are indeed below the threshold (e.g., -40dB).
- Try decreasing the **Minimum Duration** to 0.2s.

### JavaScript Errors?
- You can debug the panel by navigating to `http://localhost:8080` (or the port specified in `.debug` file) in a Chrome browser while Premiere is open.

### Ripple Delete Issues?
- Ensure the audio tracks are not **Locked** in the timeline.
- SilenceX performs a global ripple delete on the In/Out range; if other tracks are unlocked, they will also be shifted.
