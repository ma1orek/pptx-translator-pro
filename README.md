# PPTX Translator Pro 🌍

A powerful web application for translating PowerPoint presentations to multiple languages while preserving formatting, built with React and Google APIs.

## ✨ Features

- **Mass Translation**: Translate presentations to up to 5 languages simultaneously
- **Format Preservation**: Maintains all original styling, layouts, and formatting  
- **Google Integration**: Uses Google Drive, Sheets, and Translate APIs
- **No Server Required**: All processing happens through Google services
- **Real-time Progress**: Live updates during translation process
- **Multiple Languages**: Support for 12+ target languages
- **Liquid Glass UI**: Beautiful dark theme with animated backgrounds
- **Browser-Based**: Works entirely in your web browser

## 🚀 Quick Start

### Option 1: Automatic Installation (Recommended)

```bash
# Make the installation script executable
chmod +x install-dependencies.sh

# Run the installation script
./install-dependencies.sh

# Start the development server
npm run dev
```

### Option 2: Manual Installation

```bash
# Install core dependencies
npm install react@^18.2.0 react-dom@^18.2.0

# Install PPTX processing libraries (REQUIRED)
npm install googleapis@^126.0.1 jszip@^3.10.1 xml2js@^0.6.2 pptxgenjs@^3.12.0

# Install UI libraries
npm install lucide-react@^0.263.1 clsx@^2.0.0 class-variance-authority@^0.7.0 tailwind-merge@^1.14.0

# Install Radix UI components
npm install @radix-ui/react-select@^1.2.2 @radix-ui/react-checkbox@^1.0.4 @radix-ui/react-progress@^1.0.3 @radix-ui/react-dialog@^1.0.4

# Install type definitions
npm install --save-dev @types/react@^18.2.0 @types/react-dom@^18.2.0 @types/xml2js@^0.4.14

# Install build tools
npm install --save-dev @vitejs/plugin-react@^4.0.0 typescript@^5.0.0 vite@^4.4.0 tailwindcss@^4.0.0-alpha.1 @tailwindcss/vite@^4.0.0-alpha.1

# Start development server
npm run dev
```

## 📋 Prerequisites

- **Node.js 16+** - Download from [nodejs.org](https://nodejs.org/)
- **npm** - Comes with Node.js installation
- **Modern web browser** - Chrome, Firefox, Safari, or Edge
- **Google Cloud Project** (optional for production) with:
  - Google Drive API enabled
  - Google Sheets API enabled  
  - Service Account with proper permissions

## 🔧 Configuration

### Development Mode (Default)
The application works out-of-the-box in development mode with mock data and simulated processing. This is perfect for:
- Testing the UI and user experience
- Demonstrating the application flow
- Development and customization

### Production Mode (Google APIs)
For real translation functionality, you need:

1. **Google Cloud Project Setup**:
   ```bash
   # Enable required APIs
   gcloud services enable drive.googleapis.com
   gcloud services enable sheets.googleapis.com
   ```

2. **Service Account Configuration**:
   - The credentials are already configured in `/services/googleApi.ts`
   - For production, move credentials to environment variables
   - Ensure the service account has proper scopes:
     - `https://www.googleapis.com/auth/drive`
     - `https://www.googleapis.com/auth/spreadsheets`

## 🎯 How to Use

1. **Start the Application**:
   ```bash
   npm run dev
   ```

2. **Open in Browser**:
   - Navigate to `http://localhost:3000`
   - The app will automatically open

3. **Upload and Translate**:
   - Select a PowerPoint file (.pptx or .ppt)
   - Choose up to 5 target languages
   - Click "Start Translation"
   - Monitor real-time progress
   - Download translated files

## 🔄 Translation Process

1. **File Upload** → Google Drive
2. **Text Extraction** → Parse PPTX structure and extract text
3. **Sheet Creation** → Create Google Sheets with extracted content
4. **Translation** → Add `GOOGLETRANSLATE()` formulas
5. **Processing** → Wait for Google to calculate translations
6. **PPTX Rebuild** → Generate new presentations with translated text
7. **Download** → Provide links to translated files
8. **Cleanup** → Remove temporary files

## 🌍 Supported Languages

- **Polish** (pl) 🇵🇱
- **Spanish** (es) 🇪🇸  
- **French** (fr) 🇫🇷
- **German** (de) 🇩🇪
- **Italian** (it) 🇮🇹
- **Portuguese** (pt) 🇵🇹
- **Dutch** (nl) 🇳🇱
- **Russian** (ru) 🇷🇺
- **Japanese** (ja) 🇯🇵
- **Korean** (ko) 🇰🇷
- **Chinese** (zh) 🇨🇳
- **Arabic** (ar) 🇸🇦

## 📏 File Limitations

- **Maximum file size**: 100MB
- **Supported formats**: .pptx, .ppt
- **Maximum languages**: 5 simultaneous translations
- **Maximum slides**: 50 slides per presentation (for performance)
- **Processing time**: 2-10 minutes depending on file size and complexity

## ⚠️ Troubleshooting

### Common Issues

1. **"Module not found" errors**:
   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **"Google APIs not available"**:
   - This is normal in development mode
   - App will use mock data and still demonstrate functionality
   - Check browser console for detailed logs

3. **"File upload failed"**:
   - Ensure file is a valid PPTX/PPT
   - Check file size (max 100MB)
   - Verify internet connection

4. **"Translation timeout"**:
   - Google Sheets may be overloaded
   - Try with smaller files
   - Reduce number of target languages

5. **Build errors**:
   ```bash
   # Clear cache and rebuild
   npm run build --clean
   ```

### Debug Mode

Enable detailed logging by opening browser console during translation:
```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');
```

### Performance Optimization

For large files:
- Reduce number of target languages
- Remove unnecessary slides before upload
- Ensure stable internet connection
- Close other browser tabs to free memory

## 🏗️ Development

### Project Structure
```
├── App.tsx                 # Main application component
├── components/             # React components
│   ├── FileUploader.tsx   # File upload component
│   ├── LanguageSelector.tsx # Language selection
│   ├── TranslationProgress.tsx # Progress tracking
│   └── ui/                # Shadcn UI components
├── services/              # Core business logic
│   ├── googleApi.ts       # Google APIs integration
│   ├── pptxProcessor.ts   # PPTX file processing
│   └── translationService.ts # Translation orchestration
├── hooks/                 # React hooks
│   └── useTranslation.ts  # Internationalization
└── styles/               # CSS and styling
    └── globals.css       # Global styles
```

### Adding New Languages

1. **Add language to supported list**:
   ```typescript
   // In App.tsx
   const AVAILABLE_LANGUAGES = [
     // ... existing languages
     { code: 'your_code', name: 'Your Language', flag: '🏳️' }
   ];
   ```

2. **Add translations**:
   ```typescript
   // In hooks/useTranslation.ts
   const translations = {
     // ... existing translations
     your_code: {
       subtitle: 'Your translated subtitle',
       // ... other translations
     }
   };
   ```

### Custom Styling

The app uses Tailwind CSS v4 with custom design tokens. Modify `/styles/globals.css` to customize:
- Color scheme
- Typography
- Spacing
- Animations

## 🔒 Security Considerations

- **Service account credentials** are embedded in code (development only)
- **In production**, move credentials to environment variables:
  ```javascript
  const credentials = {
    private_key: process.env.GOOGLE_PRIVATE_KEY,
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    // ... other fields
  };
  ```
- **Files are temporarily stored** in Google Drive and automatically cleaned up
- **No data is permanently stored** by the application
- **All processing happens client-side** or through Google services

## 📊 Performance Monitoring

The application includes built-in performance monitoring:
- File processing times
- Translation completion rates  
- Error tracking and recovery
- Memory usage optimization

## 🌟 Future Enhancements

- [ ] Batch processing of multiple files
- [ ] Custom translation glossaries
- [ ] Advanced formatting preservation
- [ ] Progress persistence across browser refreshes
- [ ] Integration with more translation services
- [ ] Collaborative translation workflows
- [ ] API rate limiting and optimization
- [ ] Offline mode for basic functionality

## 📄 License

This project is provided as-is for educational and development purposes.

## 🤝 Support

For issues related to:
- **Google APIs**: Check Google Cloud Console and API documentation
- **File processing**: Verify PPTX file integrity and format
- **UI/UX**: Review browser console for errors
- **Performance**: Monitor browser memory usage and network connections

## 💡 Tips for Best Results

1. **Use text-heavy presentations** for better translation results
2. **Avoid complex animations** which may not preserve perfectly
3. **Test with small files first** to understand the workflow
4. **Keep backup copies** of original files
5. **Use consistent formatting** in source presentations
6. **Review translations** for accuracy and context

---

**Note**: This application requires active internet connection and may incur Google Cloud usage costs in production mode. Development mode is completely free and works offline.

🚀 **Ready to translate the world, one presentation at a time!**