# VocaboBoost: German-Greek Vocabulary Learning Application

## Project Documentation

## 1. Project Requirements

The VocaboBoost application was designed to meet the following core requirements:

1. **Random Term Selection**: 
   - Retrieve 10 random vocabulary terms per session
   - Allow users to select between German, Greek, or mixed language modes

2. **Voice-Based Learning**:
   - Speak each term aloud using speech synthesis
   - Pause for 5 seconds to allow the user to think
   - Accept spoken user translations via speech recognition
   - Score user responses for correctness

3. **Spaced Repetition Implementation**:
   - Not all words should be completely random during each session
   - Some words should reappear based on the user's past performance
   - Prioritize words the user has struggled with

4. **Web-Based Implementation**:
   - Create a responsive web application accessible across devices
   - Provide an intuitive user interface
   - Store learning progress locally

## 2. Implemented Functionality

### 2.1 Core Features

#### Language Modes
- **German → Greek**: Application speaks German words, user responds in Greek
- **Greek → German**: Application speaks Greek words, user responds in German
- **Mixed Mode**: Random alternation between the two directions, providing varied practice

#### Voice-Powered Learning
- **Text-to-Speech**: Each word is pronounced clearly using the Web Speech API
- **Speech Recognition**: User responses are captured and evaluated in real-time
- **Adjustable Timer**: Default 5-second response window that can be customized

#### Spaced Repetition System
- **SM-2 Algorithm**: Implementation of the proven SuperMemo 2 algorithm
- **Dynamic Scheduling**: Words reappear based on recall difficulty
- **Ease Factor**: Each word has a personalized difficulty rating that evolves
- **Interval Calculation**: Time between reviews increases logarithmically for known words

#### Session Management
- **Progress Tracking**: Visual indicators of session progress
- **Real-time Feedback**: Immediate response validation
- **Session Summary**: Performance statistics after completing 10 words

### 2.2 Additional Features

#### User Interface
- **Card-Based Design**: Vocabulary appears on virtual flashcards
- **Card Flipping Animation**: Reveal translations with an intuitive flip interaction
- **Progress Indicators**: Visual representation of session completion
- **Responsive Layout**: Works on mobile, tablet, and desktop devices

#### Accessibility Features
- **Adjustable Speech Rate**: Control the speed of pronunciation
- **Visual Transcription**: Option to see text representation of speech
- **Example Sentences**: Context for vocabulary usage when available

#### Settings and Customization
- **User Preferences**: Configurable speech rate, listening time, and display options
- **Progress Reset**: Option to start fresh if desired
- **Mode Switching**: Change learning direction without restarting

#### Data Management
- **Local Storage**: Progress saved in browser's localStorage
- **External JSON Data**: Vocabulary loaded from separate data file
- **Learning Statistics**: Track performance over time

## 3. JSON Data Structure

The application uses a JSON file (`vocabulary.json`) that contains all vocabulary items and their metadata. The structure is as follows:

### 3.1 Top-Level Structure

```json
{
  "metadata": {
    "title": "German-Greek Economic Terminology Glossary",
    "description": "A comprehensive glossary of economic and business terminology",
    "language": "German-Greek",
    "totalEntries": 70,
    "categories": ["economics", "business", "finance", "management"],
    "modules": [
      {
        "id": 1,
        "title": "Wirtschaftsspiel",
        "sections": ["Auftakt", "Economic Terms"]
      },
      ...
    ],
    "version": "1.0",
    "creationDate": "2025-03-03"
  },
  "entries": [
    // Array of vocabulary entries
  ]
}
```

### 3.2 Vocabulary Entry Structure

Each vocabulary entry follows this structure:

```json
{
  "id": "abschwung",
  "german": {
    "word": "der Abschwung",
    "article": "der",
    "gender": "masculine",
    "grammaticalNotes": "Singular (Sg.)"
  },
  "greek": {
    "word": "η ύφεση",
    "article": "η"
  },
  "context": {
    "category": "economics",
    "subcategory": "business cycles",
    "moduleNumber": 1,
    "sectionId": "auftakt"
  },
  "examples": [
    {
      "german": "wirtschaftlicher Abschwung",
      "greek": "οικονομική ύφεση"
    }
  ],
  "difficulty": "intermediate"
}
```

### 3.3 Key Properties

- **id**: Unique identifier for the vocabulary item
- **german**: German word with grammatical information
  - **word**: The full word including article
  - **article**: Separate field for the article (der, die, das)
  - **gender**: Grammatical gender
  - **grammaticalNotes**: Additional linguistic information
- **greek**: Greek translation
  - **word**: The Greek word with article
  - **article**: Separate field for the Greek article
- **context**: Categorization and grouping information
  - **category**: Primary topic area
  - **subcategory**: More specific classification
  - **moduleNumber**: Group number for thematic organization
  - **sectionId**: Subsection identifier
- **examples**: Array of example usages
  - Each example contains matching German and Greek phrases
- **difficulty**: Predefined difficulty level (beginner, intermediate, advanced)

## 4. Technical Implementation

### 4.1 Application Architecture

The application follows a modular structure with separate HTML, CSS, and JavaScript components:

- **index.html**: User interface structure and layout
- **app.js**: Core functionality and business logic
- **vocabulary.json**: Data storage for vocabulary items

The JavaScript implementation follows an event-driven architecture with the following key components:

1. **Initialization System**: Loads data, settings, and configures speech interfaces
2. **UI Controller**: Manages screen transitions and user interactions
3. **Learning Engine**: Implements the spaced repetition algorithm
4. **Speech System**: Handles text-to-speech and speech recognition
5. **Storage Manager**: Persists progress and settings in localStorage

### 4.2 The Web Speech API Implementation

VocaboBoost leverages two core features of the Web Speech API:

#### Speech Synthesis (TTS)
```javascript
function playCurrentWord() {
  // Get the word based on current mode
  let textToSpeak = '';
  let langToSpeak = '';
  
  if (currentMode === 'german-to-greek') {
    textToSpeak = wordData.german.word;
    langToSpeak = 'de-DE';
  } else {
    textToSpeak = wordData.greek.word;
    langToSpeak = 'el-GR';
  }
  
  // Create and configure utterance
  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = langToSpeak;
  utterance.rate = settings.speechRate;
  
  // Speak the word
  speechSynthesis.cancel(); // Cancel any ongoing speech
  speechSynthesis.speak(utterance);
}
```

#### Speech Recognition (STT)
```javascript
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = currentRecognitionLanguage;
  
  recognition.onresult = function(event) {
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      }
    }
    
    if (finalTranscript) {
      checkAnswer(finalTranscript);
    }
  };
}
```

### 4.3 Spaced Repetition Algorithm (SM-2)

The application implements a variation of the SuperMemo 2 (SM-2) algorithm for spaced repetition:

```javascript
function updateLearningData(wordId, isCorrect) {
  const learningItem = userVocabulary.learningItems[wordId];
  
  // Update counters
  if (isCorrect) {
    learningItem.timesCorrect++;
  } else {
    learningItem.timesIncorrect++;
  }
  
  // Apply spaced repetition algorithm
  const quality = isCorrect ? 5 : 0; // Quality of recall (0-5)
  
  // Update ease factor based on performance
  learningItem.easeFactor = Math.max(1.3, 
    learningItem.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  
  // Calculate next interval
  if (!isCorrect) {
    // Reset interval for incorrect answers
    learningItem.interval = 1;
  } else {
    // Increase interval for correct answers
    if (learningItem.interval === 1) {
      learningItem.interval = 6; // 6 days
    } else {
      learningItem.interval = Math.round(learningItem.interval * learningItem.easeFactor);
    }
  }
  
  // Calculate next due date
  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + learningItem.interval);
  learningItem.dueDate = nextDueDate.toISOString();
}
```

### 4.4 User Data Structure

The application stores user progress in localStorage with the following structure:

```javascript
let userVocabulary = {
  learningItems: {
    // For each vocabulary word
    "abschwung": {
      id: "abschwung",
      timesCorrect: 3,
      timesIncorrect: 1,
      lastPracticed: "2025-03-03T12:34:56.789Z",
      easeFactor: 2.5,
      interval: 6,
      dueDate: "2025-03-09T12:34:56.789Z"
    },
    // More words...
  },
  lastSession: "2025-03-03T12:34:56.789Z"
};
```

## 5. Deployment Guide

### 5.1 Prerequisites

- Modern web browser with Web Speech API support (Chrome, Edge, Safari)
- Web server to host the application files

### 5.2 Installation Steps

1. **Create Repository Structure**
   - Create a new folder for the application
   - Add the following files:
     - `index.html`
     - `app.js`
     - `vocabulary.json`

2. **Deploy to GitHub Pages**
   - Create a new GitHub repository
   - Upload the files to the repository
   - Enable GitHub Pages in repository settings
   - Site will be available at `https://[username].github.io/[repository-name]/`

3. **Alternative Deployment**
   - The application can be deployed to any static web hosting service
   - Upload all files to your web hosting service
   - Ensure HTTPS is enabled for speech recognition to work

### 5.3 Browser Compatibility

- **Full Support**: Chrome, Edge, Safari
- **Partial Support**: Firefox (speech synthesis only)
- **No Support**: Internet Explorer

## 6. Future Enhancements

### 6.1 Potential Improvements

1. **Enhanced Speech Recognition**
   - Implement fuzzy matching for more accurate response evaluation
   - Add dialect support for different German and Greek accents
   - Implement partial scoring for close-but-not-perfect answers

2. **Learning Analytics**
   - Visualization of learning progress over time
   - Heatmaps of vocabulary strengths and weaknesses
   - Detailed statistics on learning patterns

3. **Content Expansion**
   - Support for additional language pairs
   - Thematic vocabulary groups
   - Grammar rules and exercises

4. **Social Features**
   - User accounts with cloud sync
   - Competition and leaderboards
   - Class/group learning mode

### 6.2 Technical Enhancements

1. **Progressive Web App (PWA)**
   - Offline support
   - Installation on home screen
   - Push notifications for study reminders

2. **Backend Integration**
   - User accounts and profiles
   - Cross-device synchronization
   - Advanced analytics

3. **Accessibility Improvements**
   - Enhanced keyboard navigation
   - High contrast mode
   - Screen reader optimizations

## 7. Troubleshooting

### Common Issues and Solutions

1. **Speech Recognition Not Working**
   - Ensure the site is served over HTTPS
   - Check browser microphone permissions
   - Try using Chrome or Edge browsers
   - Check that the correct language is selected for speech recognition

2. **Vocabulary Not Loading**
   - Verify that vocabulary.json is in the same directory as the application
   - Check the browser console for fetch errors
   - Ensure the JSON file has valid syntax

3. **Progress Not Saving**
   - Verify that localStorage is not disabled in browser settings
   - Check that you're not using private/incognito browsing
   - Clear browser cache if settings appear corrupted

## 8. Resources and References

- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [SuperMemo 2 Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

This documentation provides a comprehensive overview of the VocaboBoost application, its requirements, implementation, and data structures. For specific technical questions or implementation details, please refer to the inline comments in the source code.