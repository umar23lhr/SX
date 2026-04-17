# SilenceX by Umar Saeed
## Professional Adobe Premiere Pro Silence Remover

SilenceX is a high-performance CEP extension for Adobe Premiere Pro that automatically detects silent gaps in voiceovers and performs ripple deletes to streamline your editing workflow.

### 🚀 Core Features
- **Intelligent Detection**: adjustable dB threshold and minimum silence duration.
- **Ripple Delete**: Automatically closes gaps after cutting silence.
- **Frosted Glass UI**: Modern, hardware-inspired aesthetic with real-time visualization.
- **Sensitivity Presets**: One-click switching between Low, Medium, and High detection modes.
- **Undo Safety**: All operations are wrapped in a single undo group.

### 🛠 Technical Specification
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Animation**: Motion for React
- **Logic**: ExtendScript (JSX) for PPRO API
- **CEP Compatibility**: Premiere Pro 2023+ (v23.0+)

### 📁 Structure
- `/src`: Frontend React application.
- `/jsx`: Premiere Pro ExtendScript logic.
- `/CSXS`: Manifest configuration for Adobe CEP.
- `/public`: Static assets.

### 🧪 Installation (Manual)
1. **Enable Debug Mode**:
   Open Terminal and run:
   `defaults write com.adobe.CSXS.11 PlayerDebugMode 1` (For CC 2023)
   `defaults write com.adobe.CSXS.12 PlayerDebugMode 1` (For CC 2024)
2. **Deploy Extension**:
   Copy the project folder to:
   - Mac: `/Library/Application Support/Adobe/CEP/extensions/`
   - Win: `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\`
3. **Launch**:
   Open Premiere Pro > Window > Extensions > SilenceX.

### 🧑‍💻 Author
Developed by **Umar Saeed**
Professional Video Editor & Software Engineer
