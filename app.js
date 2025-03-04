// Main application logic
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const loadingScreen = document.getElementById('loading-screen');
  const welcomeScreen = document.getElementById('welcome-screen');
  const app = document.getElementById('app');
  const sessionCompleteScreen = document.getElementById('session-complete');
  
  // Settings Panel
  const settingsPanel = document.getElementById('settings-panel');
  const toggleSettingsBtn = document.getElementById('toggle-settings');
  const closeSettingsBtn = document.getElementById('close-settings');
  const speechRateInput = document.getElementById('speech-rate');
  const listeningTimeInput = document.getElementById('listening-time');
  const listeningTimeValue = document.getElementById('listening-time-value');
  const showExamplesCheckbox = document.getElementById('show-examples');
  const showTranscriptionCheckbox = document.getElementById('show-transcription');
  const resetProgressBtn = document.getElementById('reset-progress');
  
  // Mode Selection
  const modeGermanBtn = document.getElementById('mode-german');
  const modeGreekBtn = document.getElementById('mode-greek');
  const modeMixedBtn = document.getElementById('mode-mixed');
  const switchModeBtn = document.getElementById('switch-mode');
  const currentModeDisplay = document.getElementById('current-mode');
  
  // Session Progress
  const currentIndexEl = document.getElementById('current-index');
  const totalWordsEl = document.getElementById('total-words');
  const correctCountEl = document.getElementById('correct-count');
  const incorrectCountEl = document.getElementById('incorrect-count');
  const progressRing = document.getElementById('progress-ring');
  const progressPercentage = document.getElementById('progress-percentage');
  
  // Word Card
  const wordCard = document.getElementById('word-card');
  const wordCategory = document.getElementById('word-category');
  const currentWordEl = document.getElementById('current-word');
  const exampleContainer = document.getElementById('example-container');
  const exampleText = document.getElementById('example-text');
  const translationEl = document.getElementById('translation');
  const translationExampleContainer = document.getElementById('translation-example-container');
  const translationExample = document.getElementById('translation-example');
  const playWordBtn = document.getElementById('play-word');
  const playTranslationBtn = document.getElementById('play-translation');
  
  // Speech Recognition
  const startListeningBtn = document.getElementById('start-listening');
  const skipWordBtn = document.getElementById('skip-word');
  const timerDisplay = document.getElementById('timer-display');
  const timerProgress = document.getElementById('timer-progress');
  const statusText = document.getElementById('status-text');
  const transcriptionContainer = document.getElementById('transcription-container');
  const transcriptionText = document.getElementById('transcription-text');
  
  // Feedback
  const feedbackContainer = document.getElementById('feedback-container');
  const correctFeedback = document.getElementById('correct-feedback');
  const incorrectFeedback = document.getElementById('incorrect-feedback');
  const correctTranslation = document.getElementById('correct-translation');
  const userTranslation = document.getElementById('user-translation');
  const nextWordBtn = document.getElementById('next-word');
  
  // Session Complete
  const finalCorrectCount = document.getElementById('final-correct-count');
  const finalIncorrectCount = document.getElementById('final-incorrect-count');
  const accuracyPercentage = document.getElementById('accuracy-percentage');
  const startNewSessionBtn = document.getElementById('start-new-session');
  
  // Application State
  let glossaryData = null;
  let currentMode = 'german-to-greek'; // german-to-greek, greek-to-german, mixed
  let currentWordIndex = 0;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let sessionWords = [];
  let userVocabulary = {
    learningItems: {},
    lastSession: null
  };
  let recognition = null;
  let speechSynthesis = window.speechSynthesis;
  let timerInterval = null;
  let timeLeft = 5;
  let isListening = false;
  let currentRecognitionLanguage = 'el-GR'; // Default to Greek for German->Greek mode
  
  // Settings
  let settings = {
    speechRate: 1.0,
    listeningTime: 5,
    showExamples: true,
    showTranscription: true
  };

  // Initialize the application
  initApp();

  // Initialize the application
  async function initApp() {
    try {
      // Load settings from localStorage
      loadSettings();
      
      // Load user vocabulary progress
      loadUserProgress();
      
      // Load glossary data from JSON file
      await loadGlossaryData();
      
      // Hide loading screen, show welcome screen
      loadingScreen.classList.add('hidden');
      welcomeScreen.classList.remove('hidden');
      
      // Initialize speech recognition if available
      initSpeechRecognition();
      
      // Set up event listeners
      setupEventListeners();
      
    } catch (error) {
      console.error('Error initializing app:', error);
      alert('Failed to initialize the application. Please refresh the page and try again.');
    }
  }

  // Load glossary data from JSON file
  async function loadGlossaryData() {
    try {
      const response = await fetch('vocabulary.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load vocabulary data: ${response.status} ${response.statusText}`);
      }
      
      glossaryData = await response.json();
      
      if (!glossaryData || !glossaryData.entries || !Array.isArray(glossaryData.entries)) {
        throw new Error('Invalid vocabulary data format');
      }
      
      console.log(`Loaded ${glossaryData.entries.length} vocabulary items`);
      
      // Initialize user vocabulary items if they don't exist yet
      initializeUserVocabularyItems();
      
      return true;
    } catch (error) {
      console.error('Error loading glossary data:', error);
      throw error;
    }
  }

  // Initialize speech recognition
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Your browser does not support speech recognition. Please use Chrome, Edge or Safari.');
      return false;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = currentRecognitionLanguage;
    
    recognition.onstart = function() {
      isListening = true;
      startListeningBtn.classList.add('bg-red-600');
      startListeningBtn.classList.remove('bg-blue-600');
      statusText.textContent = 'Listening...';
      
      // Start timer
      startTimer();
    };
    
    recognition.onend = function() {
      isListening = false;
      startListeningBtn.classList.remove('bg-red-600');
      startListeningBtn.classList.add('bg-blue-600');
      statusText.textContent = 'Processing...';
      
      // Clear timer
      clearInterval(timerInterval);
    };
    
    recognition.onresult = function(event) {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {