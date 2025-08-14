# PDF Reader Application

This project is a PDF reader application that utilizes AI and text-to-speech technology to read PDF files aloud. The application highlights the text being read, allowing users to follow along visually while listening.

## Features

- Load and display PDF documents.
- Select different voice options for reading text.
- Highlight text as it is read aloud.
- User-friendly interface for both desktop and mobile views.

## Project Structure

```
pdf-reader-app
├── src
│   ├── main.ts               # Entry point of the application
│   ├── components            # Contains React components
│   │   ├── PdfViewer.tsx     # Component for displaying PDF files
│   │   ├── VoiceSelector.tsx  # Component for selecting voice options
│   │   └── HighlightedText.tsx# Component for highlighting text
│   ├── services              # Contains service files
│   │   ├── aiReader.ts       # AI-driven text-to-speech functionality
│   │   └── pdfParser.ts      # Functions for parsing PDF files
│   ├── assets                # Static assets (images, fonts, styles)
│   └── types                 # TypeScript interfaces and types
│       └── index.ts
├── package.json              # npm configuration file
├── tsconfig.json             # TypeScript configuration file
└── README.md                 # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pdf-reader-app.git
   ```
2. Navigate to the project directory:
   ```
   cd pdf-reader-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run:
```
npm start
```

Open your browser and navigate to `http://localhost:3000` to view the application.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.