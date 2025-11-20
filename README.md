# BYB-Reader

BYB-Reader is a browser-based contract review tool that makes legal documents easier to consume. Upload a PDF or DOCX and BYB-Reader will hyperlink legal terms to their Wikipedia definitions, surface a TLDR summary, and provide reading aids like progress tracking, light/dark mode, and text-to-speech.

## Features
- **File uploads:** PDF and DOCX files are processed directly in the browser—no server required.
- **Hyperlinked legal terms:** Common legalese is automatically linked to relevant Wikipedia definitions for quick reference.
- **TLDR summary:** The first few sentences of the contract are highlighted at the top for fast context.
- **Reading progress:** A scroll-aware progress bar shows how much of the contract remains.
- **Light/Dark mode:** Toggle between light and dark themes to match your environment.
- **Text-to-speech:** Listen to the contract using your browser's built-in speech synthesis.

## Getting started
1. Open `index.html` in a modern browser (desktop recommended).
2. Upload a contract file (`.pdf` or `.docx`).
3. Review the TLDR, follow linked terms, track your progress as you scroll, and optionally start text-to-speech playback.

## Notes
- Processing happens locally in your browser using PDF.js and Mammoth.js loaded from a CDN.
- Text-to-speech requires a browser with the Web Speech API (most modern browsers support this).
