/**
 * MLN111 STUDY HUB - CORE JS LOGIC
 * Powered by HTML5, Vanilla CSS, and Vanilla JS
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. STATE CONFIGURATION & LOCAL STORAGE
  // ==========================================
  
  let state = {
    questions: [],             // All questions loaded from JSON
    userProgress: {},          // Correctly answered questions by set: { "all": [1, 2], "set-1": [1], ... }
    starredQuestions: [],      // Array of question IDs
    incorrectQuestions: [],    // Array of question IDs (the "Review Box")
    streak: 0,                 // Current consecutive correct answers
    maxStreak: 0,              // High score for consecutive correct answers
    examHistory: [],           // Array of exam results: { date, count, duration, correct, score }
    currentTheme: 'dark',      // 'dark' or 'light'
    studyPosition: { set: 'all', index: 0 }, // Last question viewed in Study mode
    dailyQuiz: { date: null, ids: [], completed: [] }, // Today's daily practice set
    dailyStreak: 0,             // Consecutive days the daily quiz was completed
    lastDailyStreakDate: null,  // Date string of the last day counted toward the streak
    achievements: [],           // Array of unlocked achievement ids
  };

  // Load state from localStorage if exists
  function loadState() {
    const saved = localStorage.getItem('mln111_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        state.userProgress = parsed.userProgress || {};
        state.starredQuestions = parsed.starredQuestions || [];
        state.incorrectQuestions = parsed.incorrectQuestions || [];
        state.streak = parsed.streak || 0;
        state.maxStreak = parsed.maxStreak || 0;
        state.examHistory = parsed.examHistory || [];
        state.currentTheme = parsed.currentTheme || 'dark';
        state.studyPosition = parsed.studyPosition || { set: 'all', index: 0 };
        state.dailyQuiz = parsed.dailyQuiz || { date: null, ids: [], completed: [] };
        state.dailyStreak = parsed.dailyStreak || 0;
        state.lastDailyStreakDate = parsed.lastDailyStreakDate || null;
        state.achievements = parsed.achievements || [];
      } catch (e) {
        console.error('Failed to parse saved state, initializing fresh state', e);
      }
    }

    // Ensure basic structure exists
    if (!state.userProgress.all) state.userProgress.all = [];
    for (let i = 1; i <= 6; i++) {
      if (!state.userProgress[`set-${i}`]) state.userProgress[`set-${i}`] = [];
    }
  }

  // Persist state to localStorage without triggering achievement checks (avoids recursion)
  function persistState() {
    localStorage.setItem('mln111_state', JSON.stringify({
      userProgress: state.userProgress,
      starredQuestions: state.starredQuestions,
      incorrectQuestions: state.incorrectQuestions,
      streak: state.streak,
      maxStreak: state.maxStreak,
      examHistory: state.examHistory,
      currentTheme: state.currentTheme,
      studyPosition: state.studyPosition,
      dailyQuiz: state.dailyQuiz,
      dailyStreak: state.dailyStreak,
      lastDailyStreakDate: state.lastDailyStreakDate,
      achievements: state.achievements
    }));
  }

  // Save current state to localStorage
  function saveState() {
    persistState();
    checkAchievements();
    updateBadges();
  }

  // ==========================================
  // EXAM SESSION PERSISTENCE (separate key: has its own timer lifecycle)
  // ==========================================
  const EXAM_SESSION_KEY = 'mln111_exam_session';

  function saveExamSession() {
    if (!examState.examQuestions.length) return;
    localStorage.setItem(EXAM_SESSION_KEY, JSON.stringify({
      examQuestions: examState.examQuestions,
      userAnswers: examState.userAnswers,
      flagged: examState.flagged,
      currentIndex: examState.currentIndex,
      timeLeft: examState.timeLeft,
      totalTime: examState.totalTime,
      savedAt: Date.now()
    }));
  }

  function clearExamSession() {
    localStorage.removeItem(EXAM_SESSION_KEY);
  }

  function loadExamSession() {
    try {
      const raw = localStorage.getItem(EXAM_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // ==========================================
  // 2. APP INITIALIZATION
  // ==========================================

  const UI = {
    // Navigation & Layout
    navBtns: document.querySelectorAll('.nav-btn'),
    sections: document.querySelectorAll('.content-section'),
    pageTitle: document.getElementById('current-page-title'),
    themeToggle: document.getElementById('theme-toggle'),
    sidebarToggle: document.getElementById('sidebar-toggle'),
    sidebar: document.getElementById('app-sidebar'),
    toast: document.getElementById('app-toast'),
    
    // Pilla / Badges
    incorrectBadge: document.getElementById('incorrect-badge'),
    starredCountPill: document.getElementById('starred-count-pill'),
    streakCountPill: document.getElementById('streak-count-pill'),
    overallProgressPct: document.getElementById('overall-progress-pct'),
    overallProgressBar: document.getElementById('overall-progress-bar'),
    overallProgressCount: document.getElementById('overall-progress-count'),

    // Dashboard UI
    dashLearnedCount: document.getElementById('dash-learned-count'),
    dashLearnedPct: document.getElementById('dash-learned-pct'),
    dashAccuracyRate: document.getElementById('dash-accuracy-rate'),
    dashAccuracySub: document.getElementById('dash-accuracy-sub'),
    dashIncorrectCount: document.getElementById('dash-incorrect-count'),
    dashHighScore: document.getElementById('dash-high-score'),
    dashHighScoreSub: document.getElementById('dash-high-score-sub'),
    setsContainer: document.getElementById('sets-container'),
    examHistoryTbody: document.getElementById('exam-history-tbody'),
    quickStudyAll: document.getElementById('quick-study-all'),
    quickExam40: document.getElementById('quick-exam-40'),
    quickReviewErrors: document.getElementById('quick-review-errors'),

    // Daily Quiz UI
    dailyQuizStatusText: document.getElementById('daily-quiz-status-text'),
    dailyQuizProgressBar: document.getElementById('daily-quiz-progress-bar'),
    dailyQuizProgressCount: document.getElementById('daily-quiz-progress-count'),
    dailyQuizStreakCount: document.getElementById('daily-quiz-streak-count'),
    btnStartDailyQuiz: document.getElementById('btn-start-daily-quiz'),

    // Achievements UI
    achievementsContainer: document.getElementById('achievements-container'),

    // Study UI
    studySetSelect: document.getElementById('study-set-select'),
    btnModeQuiz: document.getElementById('btn-mode-quiz'),
    btnModeFlashcard: document.getElementById('btn-mode-flashcard'),
    btnModeRecall: document.getElementById('btn-mode-recall'),
    btnStudyResetProgress: document.getElementById('btn-study-reset-progress'),
    studyChunksizeSelect: document.getElementById('study-chunksize-select'),
    studyPrioritizeWeak: document.getElementById('study-prioritize-weak'),
    studyChunkPager: document.getElementById('study-chunk-pager'),
    studyChunkLabel: document.getElementById('study-chunk-label'),
    btnChunkPrev: document.getElementById('btn-chunk-prev'),
    btnChunkNext: document.getElementById('btn-chunk-next'),
    studyProgressFill: document.getElementById('study-progress-fill'),
    studyCurrentIndex: document.getElementById('study-current-index'),
    studyProgressPctTxt: document.getElementById('study-progress-pct-txt'),
    studyQuestionBox: document.getElementById('study-question-box'),
    btnStudyPrev: document.getElementById('btn-study-prev'),
    btnStudyShowAnswer: document.getElementById('btn-study-show-answer'),
    btnStudyNext: document.getElementById('btn-study-next'),

    // Exam UI
    examSetupContainer: document.getElementById('exam-setup-container'),
    examActiveContainer: document.getElementById('exam-active-container'),
    examResultContainer: document.getElementById('exam-result-container'),
    examQtySelect: document.getElementById('exam-qty'),
    examTimeSelect: document.getElementById('exam-time'),
    btnStartExam: document.getElementById('btn-start-exam'),
    examQuestionBox: document.getElementById('exam-question-box'),
    btnExamPrev: document.getElementById('btn-exam-prev'),
    btnExamFlag: document.getElementById('btn-exam-flag'),
    btnExamNext: document.getElementById('btn-exam-next'),
    examTimer: document.getElementById('exam-timer'),
    examTimerBar: document.getElementById('exam-timer-bar'),
    examAnsweredCount: document.getElementById('exam-answered-count'),
    examTotalCount: document.getElementById('exam-total-count'),
    examGridContainer: document.getElementById('exam-grid-container'),
    btnSubmitExam: document.getElementById('btn-submit-exam'),
    
    // Exam Result UI
    resultScoreTxt: document.getElementById('result-score-txt'),
    resultScorePct: document.getElementById('result-score-pct'),
    resultEvalTitle: document.getElementById('result-eval-title'),
    resultEvalDesc: document.getElementById('result-eval-desc'),
    resultCorrectCount: document.getElementById('result-correct-count'),
    resultIncorrectCount: document.getElementById('result-incorrect-count'),
    resultSkippedCount: document.getElementById('result-skipped-count'),
    resultTimeTaken: document.getElementById('result-time-taken'),
    btnResultRestart: document.getElementById('btn-result-restart'),
    btnResultReviewIncorrect: document.getElementById('btn-result-review-incorrect'),
    btnResultToDashboard: document.getElementById('btn-result-to-dashboard'),
    examResultReviewList: document.getElementById('exam-result-review-list'),

    // Review UI
    reviewEmptyBox: document.getElementById('review-empty-box'),
    reviewActiveBox: document.getElementById('review-active-box'),
    reviewTotalCountBadge: document.getElementById('review-total-count-badge'),
    btnReviewClearAll: document.getElementById('btn-review-clear-all'),
    reviewQuestionBox: document.getElementById('review-question-box'),
    btnReviewPrev: document.getElementById('btn-review-prev'),
    btnReviewShowAnswer: document.getElementById('btn-review-show-answer'),
    btnReviewNext: document.getElementById('btn-review-next'),
    btnReviewGoStudy: document.getElementById('btn-review-go-study'),

    // Search UI
    searchInput: document.getElementById('search-input'),
    btnSearchClear: document.getElementById('btn-search-clear'),
    searchResultsCount: document.getElementById('search-results-count'),
    searchResultsList: document.getElementById('search-results-list'),
  };

  // Fetch questions database
  async function initApp() {
    loadState();
    applyTheme(state.currentTheme);
    
    try {
      const response = await fetch('questions.json');
      state.questions = await response.json();
      console.log(`Loaded ${state.questions.length} questions successfully.`);

      ensureDailyQuiz();
      initDashboard();
      initStudy();
      initExam();
      initReview();
      initSearch();
      checkAchievements();
      updateBadges();
      
      showToast('Tải cơ sở dữ liệu học tập thành công!', 'success');
    } catch (e) {
      console.error('Failed to fetch questions database', e);
      showToast('Lỗi tải cơ sở dữ liệu câu hỏi!', 'error');
    }
  }

  // ==========================================
  // 3. COMMON UTILITIES & VIEW MANAGER
  // ==========================================

  // Theme Management
  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.setAttribute('data-theme', 'light');
      UI.themeToggle.innerHTML = '<i class="fa-solid fa-sun text-warning"></i>';
    } else if (theme === 'pink') {
      document.body.setAttribute('data-theme', 'pink');
      UI.themeToggle.innerHTML = '<i class="fa-solid fa-heart" style="color:#f472b6"></i>';
    } else {
      document.body.removeAttribute('data-theme');
      UI.themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
    state.currentTheme = theme;
  }

  const THEME_CYCLE = ['dark', 'light', 'pink'];
  UI.themeToggle.addEventListener('click', () => {
    const currentIndex = THEME_CYCLE.indexOf(state.currentTheme);
    const nextTheme = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length];
    applyTheme(nextTheme);
    saveState();
  });

  // Mobile sidebar toggle
  UI.sidebarToggle.addEventListener('click', () => {
    UI.sidebar.classList.toggle('collapsed');
  });

  // Route / Page switching
  UI.navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      switchSection(targetId, btn);
    });
  });

  function switchSection(sectionId, activeBtn) {
    // Hide all sections
    UI.sections.forEach(s => s.classList.remove('active'));
    // Show active section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.add('active');

    // Update active nav button
    UI.navBtns.forEach(b => b.classList.remove('active'));
    if (activeBtn) {
      activeBtn.classList.add('active');
    } else {
      const correspondingBtn = Array.from(UI.navBtns).find(b => b.getAttribute('data-target') === sectionId);
      if (correspondingBtn) correspondingBtn.classList.add('active');
    }

    // Update Top Bar Title
    let title = "Bảng điều khiển";
    if (sectionId === 'study-section') title = "Ôn luyện học tập";
    else if (sectionId === 'exam-section') title = "Thi thử trắc nghiệm";
    else if (sectionId === 'review-section') title = "Câu hỏi trả lời sai";
    else if (sectionId === 'search-section') title = "Tra cứu nhanh câu hỏi";
    UI.pageTitle.textContent = title;

    // Mobile sidebar auto-collapse
    if (window.innerWidth <= 768) {
      UI.sidebar.classList.add('collapsed');
    }

    // Trigger section-specific reload
    if (sectionId === 'dashboard-section') renderDashboard();
    else if (sectionId === 'study-section') reloadStudySet();
    else if (sectionId === 'review-section') reloadReviewMode();
  }

  // Toast System
  function showToast(msg, type = 'info') {
    UI.toast.textContent = msg;
    UI.toast.className = 'toast show';
    if (type === 'success') UI.toast.style.borderLeft = '4px solid var(--success)';
    else if (type === 'error') UI.toast.style.borderLeft = '4px solid var(--error)';
    else if (type === 'warning') UI.toast.style.borderLeft = '4px solid var(--warning)';
    else UI.toast.style.borderLeft = '4px solid var(--primary)';
    
    setTimeout(() => {
      UI.toast.className = 'toast';
    }, 3000);
  }

  // Update overall progress numbers in sidebar & header pills
  function updateBadges() {
    const totalQ = 547;
    const learnedCount = getOverallLearnedCount();
    const pct = totalQ > 0 ? Math.round((learnedCount / totalQ) * 100) : 0;
    
    UI.overallProgressPct.textContent = `${pct}%`;
    UI.overallProgressBar.style.width = `${pct}%`;
    UI.overallProgressCount.textContent = `${learnedCount}/${totalQ} câu`;
    
    // Sidebar incorrect badge
    const incorrectCount = state.incorrectQuestions.length;
    UI.incorrectBadge.textContent = incorrectCount;
    if (incorrectCount > 0) {
      UI.incorrectBadge.classList.add('visible');
    } else {
      UI.incorrectBadge.classList.remove('visible');
    }

    // Header pills
    UI.starredCountPill.textContent = state.starredQuestions.length;
    UI.streakCountPill.textContent = state.streak;
  }

  function getOverallLearnedCount() {
    // Unique questions answered correctly in "all" list
    return state.userProgress.all ? state.userProgress.all.length : 0;
  }

  // Set 1-6 ID range mapping (shared by set filtering & achievement checks)
  const SET_LIMITS = {
    'set-1': { start: 1, end: 100 },
    'set-2': { start: 101, end: 200 },
    'set-3': { start: 201, end: 300 },
    'set-4': { start: 301, end: 400 },
    'set-5': { start: 401, end: 500 },
    'set-6': { start: 501, end: 547 }
  };

  // Helper to check if a question is in the study set
  function getQuestionsForSet(setName) {
    if (!state.questions.length) return [];
    if (setName === 'all') return state.questions;
    if (setName === 'starred') {
      return state.questions.filter(q => state.starredQuestions.includes(q.id));
    }
    if (setName === 'daily') {
      return state.dailyQuiz.ids
        .map(id => state.questions.find(q => q.id === id))
        .filter(Boolean);
    }

    const limit = SET_LIMITS[setName];
    if (limit) {
      return state.questions.slice(limit.start - 1, limit.end);
    }
    return [];
  }

  // ==========================================
  // 3.5 DAILY QUIZ MODULE LOGIC
  // ==========================================

  function getDateStrOffset(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }

  function getTodayStr() {
    return getDateStrOffset(0);
  }

  // Picks 10 questions for today: wrong answers first, then unlearned, then a few learned ones
  function generateDailyQuizIds() {
    const shuffle = arr => [...arr].sort(() => 0.5 - Math.random());
    const learnedSet = new Set(state.userProgress.all);
    const incorrectSet = new Set(state.incorrectQuestions);

    const weak = state.questions.filter(q => incorrectSet.has(q.id)).map(q => q.id);
    const unlearned = state.questions.filter(q => !learnedSet.has(q.id) && !incorrectSet.has(q.id)).map(q => q.id);
    const learned = state.questions.filter(q => learnedSet.has(q.id) && !incorrectSet.has(q.id)).map(q => q.id);

    const combined = [...shuffle(weak), ...shuffle(unlearned), ...shuffle(learned)];
    return combined.slice(0, 10);
  }

  // Regenerates today's daily quiz set if it hasn't been created yet
  function ensureDailyQuiz() {
    const today = getTodayStr();
    if (!state.dailyQuiz || state.dailyQuiz.date !== today) {
      state.dailyQuiz = { date: today, ids: generateDailyQuizIds(), completed: [] };
      saveState();
    }
  }

  // Marks a question as "practiced today" if it belongs to the daily set
  function registerDailyProgress(qId) {
    if (!state.dailyQuiz || !state.dailyQuiz.ids.includes(qId)) return;
    if (!state.dailyQuiz.completed.includes(qId)) {
      state.dailyQuiz.completed.push(qId);
      if (state.dailyQuiz.completed.length >= state.dailyQuiz.ids.length) {
        finalizeDailyStreak();
      }
    }
  }

  function finalizeDailyStreak() {
    const today = getTodayStr();
    if (state.lastDailyStreakDate === today) return; // already counted today

    const yesterday = getDateStrOffset(-1);
    state.dailyStreak = (state.lastDailyStreakDate === yesterday) ? state.dailyStreak + 1 : 1;
    state.lastDailyStreakDate = today;
    showToast(`Hoàn thành ôn tập hôm nay! Chuỗi ngày liên tục: ${state.dailyStreak}`, 'success');
  }

  function renderDailyQuizCard() {
    if (!UI.dailyQuizProgressBar) return;
    const total = state.dailyQuiz.ids.length || 10;
    const done = state.dailyQuiz.completed.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    UI.dailyQuizProgressBar.style.width = `${pct}%`;
    UI.dailyQuizProgressCount.textContent = `${done}/${total} câu`;
    UI.dailyQuizStreakCount.textContent = state.dailyStreak;

    if (done >= total) {
      UI.dailyQuizStatusText.textContent = 'Bạn đã hoàn thành ôn tập hôm nay. Hẹn gặp lại ngày mai!';
      UI.btnStartDailyQuiz.innerHTML = '<i class="fa-solid fa-rotate"></i> Ôn lại bộ hôm nay';
    } else if (done > 0) {
      UI.dailyQuizStatusText.textContent = 'Đang dở! Tiếp tục hoàn thành bộ câu hỏi hôm nay.';
      UI.btnStartDailyQuiz.innerHTML = '<i class="fa-solid fa-play"></i> Tiếp tục ôn tập';
    } else {
      UI.dailyQuizStatusText.textContent = 'Sẵn sàng cho 10 câu hỏi hôm nay!';
      UI.btnStartDailyQuiz.innerHTML = '<i class="fa-solid fa-play"></i> Bắt đầu ôn tập hôm nay';
    }
  }

  // ==========================================
  // 3.6 ACHIEVEMENTS (BADGES) MODULE LOGIC
  // ==========================================

  const ACHIEVEMENT_DEFS = [
    { id: 'first_steps', icon: 'fa-shoe-prints', title: 'Những bước đầu tiên', desc: 'Học thuộc 10 câu hỏi', check: () => getOverallLearnedCount() >= 10 },
    { id: 'century', icon: 'fa-star-half-stroke', title: 'Cột mốc trăm câu', desc: 'Học thuộc 100 câu hỏi', check: () => getOverallLearnedCount() >= 100 },
    { id: 'halfway', icon: 'fa-flag-checkered', title: 'Nửa chặng đường', desc: 'Học thuộc 250 câu hỏi', check: () => getOverallLearnedCount() >= 250 },
    { id: 'master', icon: 'fa-crown', title: 'Bậc thầy MLN111', desc: 'Học thuộc toàn bộ 547 câu hỏi', check: () => getOverallLearnedCount() >= 547 },
    { id: 'sharp_shooter', icon: 'fa-bullseye', title: 'Xạ thủ chính xác', desc: 'Trả lời đúng liên tiếp 10 câu', check: () => state.maxStreak >= 10 },
    { id: 'unstoppable', icon: 'fa-bolt', title: 'Không thể ngăn cản', desc: 'Trả lời đúng liên tiếp 20 câu', check: () => state.maxStreak >= 20 },
    { id: 'exam_ace', icon: 'fa-medal', title: 'Thi thử xuất sắc', desc: 'Đạt từ 90% trở lên trong 1 bài thi thử', check: () => state.examHistory.some(h => h.score >= 90) },
    { id: 'daily_streak_7', icon: 'fa-fire', title: 'Kiên trì 7 ngày', desc: 'Ôn tập hằng ngày liên tục 7 ngày', check: () => state.dailyStreak >= 7 },
  ];
  // Per-set completion achievements (Bộ 1-6)
  Object.keys(SET_LIMITS).forEach((setId, i) => {
    const limit = SET_LIMITS[setId];
    const count = limit.end - limit.start + 1;
    ACHIEVEMENT_DEFS.push({
      id: `${setId}_master`,
      icon: 'fa-layer-group',
      title: `Hoàn thành Bộ ${i + 1}`,
      desc: `Học thuộc 100% câu hỏi trong Bộ ${i + 1}`,
      check: () => (state.userProgress[setId] || []).length >= count
    });
  });

  // Compares current progress against all achievement definitions and unlocks new ones
  function checkAchievements() {
    if (!state.questions.length) return;
    let unlockedNew = false;
    ACHIEVEMENT_DEFS.forEach(def => {
      if (!state.achievements.includes(def.id) && def.check()) {
        state.achievements.push(def.id);
        showToast(`Mở khóa huy hiệu: ${def.title}!`, 'success');
        unlockedNew = true;
      }
    });
    if (unlockedNew) {
      persistState();
      renderAchievements();
    }
  }

  function renderAchievements() {
    if (!UI.achievementsContainer) return;
    UI.achievementsContainer.innerHTML = '';
    ACHIEVEMENT_DEFS.forEach(def => {
      const unlocked = state.achievements.includes(def.id);
      const item = document.createElement('div');
      item.className = `achievement-item ${unlocked ? 'unlocked' : 'locked'}`;
      item.title = def.desc;
      item.innerHTML = `
        <div class="achievement-icon"><i class="fa-solid ${unlocked ? def.icon : 'fa-lock'}"></i></div>
        <div class="achievement-info">
          <h6>${def.title}</h6>
          <p>${def.desc}</p>
        </div>
      `;
      UI.achievementsContainer.appendChild(item);
    });
  }

  // ==========================================
  // 4. DASHBOARD MODULE LOGIC
  // ==========================================

  function initDashboard() {
    renderDashboard();

    // Quick action bindings
    UI.quickStudyAll.addEventListener('click', () => {
      UI.studySetSelect.value = 'all';
      switchSection('study-section');
    });

    UI.quickExam40.addEventListener('click', () => {
      switchSection('exam-section');
    });

    UI.quickReviewErrors.addEventListener('click', () => {
      switchSection('review-section');
    });

    UI.btnStartDailyQuiz.addEventListener('click', () => {
      ensureDailyQuiz();
      goToDailyQuiz();
    });
  }

  // Switches the Study screen into today's daily quiz set
  function goToDailyQuiz() {
    ensureStudySetOption('daily', 'Ôn tập hôm nay (Daily)');
    UI.studySetSelect.value = 'daily';
    studyState.currentSet = 'daily';
    reloadStudySet(true);
    persistStudyPosition();
    switchSection('study-section');
  }

  function renderDashboard() {
    renderDailyQuizCard();
    renderAchievements();
    const totalQ = 547;
    const learned = getOverallLearnedCount();
    const learnedPct = Math.round((learned / totalQ) * 100);

    UI.dashLearnedCount.textContent = `${learned} / ${totalQ}`;
    UI.dashLearnedPct.textContent = `Đạt ${learnedPct}% tổng bộ câu hỏi`;

    // Accuracy Rate from history
    let accuracy = 0;
    if (state.examHistory.length > 0) {
      const totalCorrect = state.examHistory.reduce((sum, h) => sum + h.correct, 0);
      const totalExamQ = state.examHistory.reduce((sum, h) => sum + h.count, 0);
      accuracy = totalExamQ > 0 ? Math.round((totalCorrect / totalExamQ) * 100) : 0;
      UI.dashAccuracySub.textContent = `Dựa trên ${state.examHistory.length} lần thi gần nhất`;
    } else {
      // Approximate from study session
      const totalAttempts = learned + state.incorrectQuestions.length;
      accuracy = totalAttempts > 0 ? Math.round((learned / totalAttempts) * 100) : 0;
      UI.dashAccuracySub.textContent = `Từ tất cả các câu đã ôn tập`;
    }
    UI.dashAccuracyRate.textContent = `${accuracy}%`;

    // Review count
    UI.dashIncorrectCount.textContent = state.incorrectQuestions.length;

    // High Score
    if (state.examHistory.length > 0) {
      const maxScore = Math.max(...state.examHistory.map(h => h.score));
      UI.dashHighScore.textContent = `${maxScore}%`;
      const bestExam = state.examHistory.find(h => h.score === maxScore);
      UI.dashHighScoreSub.textContent = `Trả lời đúng ${bestExam.correct}/${bestExam.count} câu`;
    } else {
      UI.dashHighScore.textContent = "Chưa thi";
      UI.dashHighScoreSub.textContent = "Bắt đầu thi ở menu";
    }

    // Render Set Selector Cards
    const sets = [
      { id: 'set-1', name: 'Bộ câu hỏi 1-100', count: 100 },
      { id: 'set-2', name: 'Bộ câu hỏi 101-200', count: 100 },
      { id: 'set-3', name: 'Bộ câu hỏi 201-300', count: 100 },
      { id: 'set-4', name: 'Bộ câu hỏi 301-400', count: 100 },
      { id: 'set-5', name: 'Bộ câu hỏi 401-500', count: 100 },
      { id: 'set-6', name: 'Bộ câu hỏi 501-547', count: 47 }
    ];

    UI.setsContainer.innerHTML = '';
    sets.forEach(set => {
      const setLearned = state.userProgress[set.id] ? state.userProgress[set.id].length : 0;
      const pct = Math.round((setLearned / set.count) * 100);
      
      const card = document.createElement('div');
      card.className = 'set-card';
      card.innerHTML = `
        <div class="set-info">
          <h5>${set.name}</h5>
          <span>${set.count} câu hỏi trắc nghiệm</span>
        </div>
        <div class="set-progress">
          <div class="set-progress-text">
            <span>Đã thuộc: ${setLearned}/${set.count}</span>
            <span>${pct}%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
      card.addEventListener('click', () => {
        UI.studySetSelect.value = set.id;
        switchSection('study-section');
      });
      UI.setsContainer.appendChild(card);
    });

    // Render Recent Exams Table
    UI.examHistoryTbody.innerHTML = '';
    if (state.examHistory.length === 0) {
      UI.examHistoryTbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted">Chưa có lịch sử làm bài thi thử nào</td>
        </tr>
      `;
    } else {
      // Render top 5 recent exams
      const recent = [...state.examHistory].reverse().slice(0, 5);
      recent.forEach(h => {
        const tr = document.createElement('tr');
        
        let scoreClass = 'low';
        if (h.score >= 80) scoreClass = 'high';
        else if (h.score >= 50) scoreClass = 'mid';
        
        tr.innerHTML = `
          <td>${h.date}</td>
          <td>${h.count} câu</td>
          <td>${h.duration}</td>
          <td>${h.correct} / ${h.count}</td>
          <td><span class="score-badge ${scoreClass}">${h.score}%</span></td>
        `;
        UI.examHistoryTbody.appendChild(tr);
      });
    }
  }

  // ==========================================
  // 5. STUDY MODE MODULE LOGIC
  // ==========================================

  let studyState = {
    currentSet: 'all',
    questions: [],           // Questions in the currently visible chunk
    fullSetQuestions: [],    // All questions in the current set (before chunk slicing)
    currentIndex: 0,
    chunkSize: 0,             // 0 = no chunking (study whole set at once)
    chunkIndex: 0,
    prioritizeWeak: false,    // Show not-yet-learned questions first
    showMode: 'quiz', // 'quiz' (hide answer), 'flashcard' (reveal immediately), or 'recall' (active recall flip)
    answersRevealed: false,
    recallFlipped: false      // Whether the current card has been flipped in Active Recall mode
  };

  // Dynamically injects a hidden-by-default <option> into the set selector (used for 'daily')
  function ensureStudySetOption(value, label) {
    if (!UI.studySetSelect.querySelector(`option[value="${value}"]`)) {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = label;
      UI.studySetSelect.insertBefore(opt, UI.studySetSelect.firstChild);
    }
  }

  function initStudy() {
    // Restore last viewed set/question from saved state
    studyState.currentSet = state.studyPosition.set;
    studyState.currentIndex = state.studyPosition.index;
    if (studyState.currentSet === 'daily') {
      ensureStudySetOption('daily', 'Ôn tập hôm nay (Daily)');
    }
    UI.studySetSelect.value = studyState.currentSet;

    UI.studySetSelect.addEventListener('change', (e) => {
      studyState.currentSet = e.target.value;
      reloadStudySet(true);
      persistStudyPosition();
    });

    UI.btnModeQuiz.addEventListener('click', () => setStudyMode('quiz'));
    UI.btnModeFlashcard.addEventListener('click', () => setStudyMode('flashcard'));
    UI.btnModeRecall.addEventListener('click', () => setStudyMode('recall'));

    UI.btnStudyResetProgress.addEventListener('click', () => {
      if (confirm(`Bạn có chắc chắn muốn xóa tiến trình học tập của bộ [${UI.studySetSelect.options[UI.studySetSelect.selectedIndex].text}] không?`)) {
        resetStudyProgress(studyState.currentSet);
      }
    });

    UI.studyChunksizeSelect.addEventListener('change', (e) => {
      studyState.chunkSize = parseInt(e.target.value);
      studyState.chunkIndex = 0;
      reloadStudySet(true);
    });

    UI.studyPrioritizeWeak.addEventListener('change', (e) => {
      studyState.prioritizeWeak = e.target.checked;
      studyState.chunkIndex = 0;
      reloadStudySet(true);
    });

    UI.btnChunkPrev.addEventListener('click', () => {
      studyState.chunkIndex--;
      reloadStudySet(true, true);
    });

    UI.btnChunkNext.addEventListener('click', () => {
      studyState.chunkIndex++;
      reloadStudySet(true, true);
    });

    UI.btnStudyPrev.addEventListener('click', studyPrevQuestion);
    UI.btnStudyNext.addEventListener('click', studyNextQuestion);
    UI.btnStudyShowAnswer.addEventListener('click', revealStudyAnswer);
  }

  function setStudyMode(mode) {
    studyState.showMode = mode;
    studyState.recallFlipped = false;
    UI.btnModeQuiz.classList.toggle('active', mode === 'quiz');
    UI.btnModeFlashcard.classList.toggle('active', mode === 'flashcard');
    UI.btnModeRecall.classList.toggle('active', mode === 'recall');
    UI.btnStudyShowAnswer.innerHTML = mode === 'recall'
      ? '<i class="fa-solid fa-rotate"></i> Lật thẻ xem đáp án (Space)'
      : '<i class="fa-solid fa-eye"></i> Hiện đáp án (Space)';
    renderStudyQuestion();
  }

  // Persist the current study set/question so a page reload resumes here
  function persistStudyPosition() {
    state.studyPosition = { set: studyState.currentSet, index: studyState.currentIndex };
    saveState();
  }

  function reloadStudySet(resetIndex = false, preserveChunk = false) {
    let ordered = getQuestionsForSet(studyState.currentSet);

    // Prioritize not-yet-learned questions so weak spots surface first
    if (studyState.prioritizeWeak && studyState.currentSet !== 'daily') {
      const learnedSet = new Set(state.userProgress.all);
      const notLearned = ordered.filter(q => !learnedSet.has(q.id));
      const learned = ordered.filter(q => learnedSet.has(q.id));
      ordered = [...notLearned, ...learned];
    }
    studyState.fullSetQuestions = ordered;

    // Split into smaller chunks to reduce cognitive load (skip for the small daily set)
    if (studyState.chunkSize > 0 && studyState.currentSet !== 'daily' && ordered.length > 0) {
      const totalChunks = Math.max(1, Math.ceil(ordered.length / studyState.chunkSize));
      if (resetIndex && !preserveChunk) studyState.chunkIndex = 0;
      studyState.chunkIndex = Math.min(Math.max(studyState.chunkIndex, 0), totalChunks - 1);
      const start = studyState.chunkIndex * studyState.chunkSize;
      studyState.questions = ordered.slice(start, start + studyState.chunkSize);
      renderChunkPager(totalChunks, start, ordered.length);
    } else {
      studyState.chunkIndex = 0;
      studyState.questions = ordered;
      hideChunkPager();
    }

    if (resetIndex || studyState.currentIndex < 0 || studyState.currentIndex >= studyState.questions.length) {
      studyState.currentIndex = 0;
    }
    studyState.answersRevealed = false;
    studyState.recallFlipped = false;

    if (studyState.questions.length === 0) {
      UI.studyQuestionBox.innerHTML = `
        <div class="card text-center py-5">
          <p><i class="fa-solid fa-face-frown fa-3x text-muted"></i></p>
          <h4 class="mt-4">Bộ câu hỏi trống!</h4>
          <p class="text-muted mt-2">Vui lòng chọn bộ câu hỏi khác hoặc đánh dấu câu hỏi ở các chế độ khác.</p>
        </div>
      `;
      UI.studyCurrentIndex.textContent = 'Câu 0/0';
      UI.studyProgressPctTxt.textContent = '(0%)';
      UI.studyProgressFill.style.width = '0%';
      UI.btnStudyPrev.disabled = true;
      UI.btnStudyNext.disabled = true;
      UI.btnStudyShowAnswer.disabled = true;
    } else {
      renderStudyQuestion();
    }
  }

  function renderChunkPager(totalChunks, start, totalLen) {
    if (totalChunks <= 1) {
      hideChunkPager();
      return;
    }
    const end = Math.min(start + studyState.chunkSize, totalLen);
    UI.studyChunkPager.style.display = 'flex';
    UI.studyChunkLabel.textContent = `Chặng ${studyState.chunkIndex + 1}/${totalChunks} (câu ${start + 1}-${end} trong bộ)`;
    UI.btnChunkPrev.disabled = studyState.chunkIndex === 0;
    UI.btnChunkNext.disabled = studyState.chunkIndex >= totalChunks - 1;
  }

  function hideChunkPager() {
    UI.studyChunkPager.style.display = 'none';
  }

  function resetStudyProgress(setName) {
    if (setName === 'all') {
      state.userProgress.all = [];
      for (let i = 1; i <= 6; i++) {
        state.userProgress[`set-${i}`] = [];
      }
      showToast('Đã xóa toàn bộ tiến trình học tập!', 'success');
    } else if (setName === 'starred') {
      state.starredQuestions = [];
      showToast('Đã xóa toàn bộ câu đánh dấu!', 'success');
    } else {
      state.userProgress[setName] = [];
      // Re-compile all
      let allCorrect = [];
      for (let i = 1; i <= 6; i++) {
        allCorrect = [...allCorrect, ...state.userProgress[`set-${i}`]];
      }
      state.userProgress.all = [...new Set(allCorrect)];
      showToast(`Đã xóa tiến trình của ${setName.toUpperCase()}!`, 'success');
    }
    saveState();
    reloadStudySet(true);
    persistStudyPosition();
  }

  function renderStudyQuestion() {
    const q = studyState.questions[studyState.currentIndex];
    if (!q) return;

    studyState.answersRevealed = studyState.showMode === 'flashcard';
    
    // Update navigation stats
    const total = studyState.questions.length;
    const currentNum = studyState.currentIndex + 1;
    const pct = Math.round((currentNum / total) * 100);
    
    UI.studyCurrentIndex.textContent = `Câu ${currentNum} / ${total}`;
    UI.studyProgressPctTxt.textContent = `(${pct}%)`;
    UI.studyProgressFill.style.width = `${pct}%`;
    
    UI.btnStudyPrev.disabled = studyState.currentIndex === 0;
    UI.btnStudyNext.disabled = false; // Arrow keys can loop/wrap if needed, but here simple clamp
    
    // Render box
    const isStarred = state.starredQuestions.includes(q.id);
    const hasOptions = Object.keys(q.options).length > 0;
    const isRecallHidden = studyState.showMode === 'recall' && !studyState.recallFlipped;

    let optionsHtml = '';
    if (isRecallHidden) {
      // Active recall: hide the answer entirely until the user flips the card
      optionsHtml = `
        <div class="recall-hidden-hint">
          <i class="fa-solid fa-brain"></i>
          <p>Cố gắng nhớ đáp án đúng trong đầu, sau đó bấm "Lật thẻ" để kiểm tra.</p>
        </div>
      `;
    } else if (hasOptions) {
      optionsHtml = `<div class="options-list">`;
      Object.keys(q.options).forEach(letter => {
        optionsHtml += `
          <button class="option-btn" data-letter="${letter}">
            <div class="option-letter">${letter}</div>
            <div class="option-text">${q.options[letter]}</div>
          </button>
        `;
      });
      optionsHtml += `</div>`;
    } else {
      // Q176 short answer input
      optionsHtml = `
        <div class="short-answer-section">
          <input type="text" class="short-answer-field" id="study-short-answer-input" placeholder="Nhập câu trả lời của bạn..." autocomplete="off">
          <button class="btn btn-primary short-answer-check-btn" id="btn-study-check-short">Kiểm tra câu trả lời</button>
        </div>
      `;
    }

    const recallGradeHtml = (studyState.showMode === 'recall' && studyState.recallFlipped) ? `
      <div class="recall-grade-actions">
        <button class="btn btn-outline-error" id="btn-recall-forgot"><i class="fa-solid fa-xmark"></i> Tôi chưa nhớ</button>
        <button class="btn btn-recall-good" id="btn-recall-remembered"><i class="fa-solid fa-check"></i> Tôi đã nhớ</button>
      </div>
    ` : '';

    const shouldShowExplanation = studyState.showMode === 'recall' ? studyState.recallFlipped : studyState.answersRevealed;

    UI.studyQuestionBox.innerHTML = `
      <div class="question-card-wrapper" id="study-card-wrapper">
        <div class="question-card">
          <div class="question-header">
            <div class="question-meta">
              <span class="meta-pill">Câu hỏi ID: ${q.id}</span>
              <span class="meta-pill" style="background-color: var(--primary-glow); color: var(--primary)">MLN111</span>
            </div>
            <button class="btn-star-question ${isStarred ? 'starred' : ''}" id="btn-study-star" title="Đánh dấu câu hỏi này">
              <i class="${isStarred ? 'fa-solid' : 'fa-regular'} fa-star"></i>
            </button>
          </div>
          <div class="question-body">
            <h4>${q.question}</h4>
          </div>
          ${optionsHtml}

          <div class="explanation-card" id="study-explanation-box" style="display: ${shouldShowExplanation ? 'block' : 'none'};">
            <h5><i class="fa-solid fa-lightbulb"></i> Đáp án đúng: ${q.answer}</h5>
            ${buildExplanationExtras(q)}
            ${recallGradeHtml}
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    const starBtn = document.getElementById('btn-study-star');
    starBtn.addEventListener('click', () => {
      toggleStarred(q.id, starBtn);
    });

    if (isRecallHidden) {
      // No answer interaction yet; wait for the user to flip the card
    } else if (hasOptions) {
      const optBtns = UI.studyQuestionBox.querySelectorAll('.option-btn');
      optBtns.forEach(btn => {
        const letter = btn.getAttribute('data-letter');

        // In flashcard mode (or a flipped recall card), highlight the correct answer immediately
        const shouldHighlightCorrect = (studyState.showMode === 'flashcard' || (studyState.showMode === 'recall' && studyState.recallFlipped)) && q.answer.includes(letter);
        if (shouldHighlightCorrect) {
          btn.classList.add('correct');
        }

        // In recall mode, options are read-only display; grading happens via the dedicated buttons
        if (studyState.showMode === 'recall') return;

        btn.addEventListener('click', () => {
          if (studyState.answersRevealed && studyState.showMode === 'quiz') return; // Answered already
          handleStudyAnswerSelection(q, letter, btn, optBtns);
        });
      });
    } else {
      // Q176 checks
      const inputField = document.getElementById('study-short-answer-input');
      const checkBtn = document.getElementById('btn-study-check-short');

      if (studyState.showMode === 'flashcard' || studyState.showMode === 'recall') {
        inputField.value = q.answer;
        inputField.disabled = true;
        checkBtn.disabled = true;
      }

      checkBtn.addEventListener('click', () => {
        const userVal = inputField.value.trim().toLowerCase();
        const correctVal = q.answer.trim().toLowerCase();

        if (userVal === correctVal || correctVal.includes(userVal) && userVal.length > 2) {
          inputField.style.borderColor = 'var(--success)';
          inputField.style.boxShadow = '0 0 0 3px var(--success-glow)';
          showToast('Chính xác!', 'success');
          markQuestionCorrect(q.id);
          state.streak++;
        } else {
          inputField.style.borderColor = 'var(--error)';
          inputField.style.boxShadow = '0 0 0 3px var(--error-glow)';
          showToast(`Chưa chính xác! Đáp án đúng: ${q.answer}`, 'error');
          markQuestionIncorrect(q.id);
          state.streak = 0;
        }

        revealStudyAnswer();
        saveState();
      });
    }

    if (studyState.showMode === 'recall' && studyState.recallFlipped) {
      const btnForgot = document.getElementById('btn-recall-forgot');
      const btnRemembered = document.getElementById('btn-recall-remembered');
      if (btnForgot) btnForgot.addEventListener('click', () => gradeRecall(q, false));
      if (btnRemembered) btnRemembered.addEventListener('click', () => gradeRecall(q, true));
    }
  }

  // Self-assessment for Active Recall mode: records the outcome, then advances
  function gradeRecall(question, remembered) {
    if (remembered) {
      markQuestionCorrect(question.id);
      state.streak++;
      if (state.streak > state.maxStreak) state.maxStreak = state.streak;
      showToast('Tuyệt vời! Đã ghi nhớ.', 'success');
    } else {
      markQuestionIncorrect(question.id);
      state.streak = 0;
      showToast('Không sao, câu này đã được thêm vào Hộp ôn tập.', 'warning');
    }
    saveState();
    studyNextQuestion();
  }

  function toggleStarred(qId, btnElement) {
    const idx = state.starredQuestions.indexOf(qId);
    if (idx > -1) {
      state.starredQuestions.splice(idx, 1);
      btnElement.classList.remove('starred');
      btnElement.innerHTML = '<i class="fa-regular fa-star"></i>';
      showToast('Đã bỏ đánh dấu câu hỏi!', 'info');
    } else {
      state.starredQuestions.push(qId);
      btnElement.classList.add('starred');
      btnElement.innerHTML = '<i class="fa-solid fa-star"></i>';
      showToast('Đã lưu câu hỏi vào danh mục đánh dấu!', 'success');
    }
    saveState();
  }

  // Renders the optional keyword tag + short explanation + legacy note for a question
  function buildExplanationExtras(q) {
    let html = '';
    if (q.keywords) {
      html += `<div class="keyword-tag"><i class="fa-solid fa-tag"></i> ${q.keywords}</div>`;
    }
    if (q.explanation) {
      html += `<p class="explanation-text">${q.explanation}</p>`;
    }
    if (q.note) {
      html += `<p><strong>Ghi chú:</strong> ${q.note}</p>`;
    }
    return html;
  }

  // Inserts a clear "you picked X (wrong)" line right after the heading of an explanation box
  function addWrongAnswerNote(expBox, question, selectedLetter) {
    if (!expBox) return;
    const heading = expBox.querySelector('h5');
    if (!heading) return;
    const note = document.createElement('p');
    note.className = 'wrong-answer-note';
    note.innerHTML = `<i class="fa-solid fa-circle-xmark text-error"></i> Bạn đã chọn: <strong>${selectedLetter}. ${question.options[selectedLetter]}</strong> — chưa chính xác.`;
    heading.insertAdjacentElement('afterend', note);
  }

  function handleStudyAnswerSelection(question, selectedLetter, clickedBtn, allBtns) {
    studyState.answersRevealed = true;
    const isCorrect = question.answer.includes(selectedLetter);

    // Highlight correct & incorrect options
    allBtns.forEach(btn => {
      const letter = btn.getAttribute('data-letter');
      if (question.answer.includes(letter)) {
        btn.classList.add('correct');
      }
    });

    // Show explanation panel
    const expBox = document.getElementById('study-explanation-box');

    if (isCorrect) {
      clickedBtn.classList.add('correct');
      showToast('Chính xác!', 'success');
      markQuestionCorrect(question.id);
      state.streak++;
      if (state.streak > state.maxStreak) state.maxStreak = state.streak;
    } else {
      clickedBtn.classList.add('incorrect');
      showToast('Sai rồi!', 'error');
      markQuestionIncorrect(question.id);
      state.streak = 0;
      addWrongAnswerNote(expBox, question, selectedLetter);
    }

    if (expBox) expBox.style.display = 'block';

    saveState();
  }

  function markQuestionCorrect(qId) {
    registerDailyProgress(qId);
    // Add to all
    if (!state.userProgress.all.includes(qId)) {
      state.userProgress.all.push(qId);
    }
    
    // Add to set-1..6
    const setId = getSetIdForQuestionId(qId);
    if (setId && !state.userProgress[setId].includes(qId)) {
      state.userProgress[setId].push(qId);
    }

    // Remove from incorrect questions queue since answered correctly
    const errorIdx = state.incorrectQuestions.indexOf(qId);
    if (errorIdx > -1) {
      state.incorrectQuestions.splice(errorIdx, 1);
    }
  }

  function markQuestionIncorrect(qId) {
    registerDailyProgress(qId);
    if (!state.incorrectQuestions.includes(qId)) {
      state.incorrectQuestions.push(qId);
    }
  }

  function getSetIdForQuestionId(qId) {
    if (qId >= 1 && qId <= 100) return 'set-1';
    if (qId >= 101 && qId <= 200) return 'set-2';
    if (qId >= 201 && qId <= 300) return 'set-3';
    if (qId >= 301 && qId <= 400) return 'set-4';
    if (qId >= 401 && qId <= 500) return 'set-5';
    if (qId >= 501 && qId <= 547) return 'set-6';
    return null;
  }

  function studyPrevQuestion() {
    if (studyState.currentIndex > 0) {
      studyState.currentIndex--;
      studyState.recallFlipped = false;
      renderStudyQuestion();
      persistStudyPosition();
    }
  }

  function studyNextQuestion() {
    if (studyState.currentIndex < studyState.questions.length - 1) {
      studyState.currentIndex++;
      studyState.recallFlipped = false;
      renderStudyQuestion();
      persistStudyPosition();
    } else {
      showToast('Bạn đã hoàn thành câu hỏi cuối cùng của bộ này!', 'success');
    }
  }

  function revealStudyAnswer() {
    if (studyState.showMode === 'recall') {
      if (studyState.recallFlipped) return;
      // Options were hidden entirely, so a full re-render is needed to flip the card
      studyState.recallFlipped = true;
      renderStudyQuestion();
      return;
    }

    if (studyState.answersRevealed) return;
    studyState.answersRevealed = true;
    const q = studyState.questions[studyState.currentIndex];

    // Highlight options
    const optBtns = UI.studyQuestionBox.querySelectorAll('.option-btn');
    optBtns.forEach(btn => {
      const letter = btn.getAttribute('data-letter');
      if (q.answer.includes(letter)) {
        btn.classList.add('correct');
      }
    });

    const expBox = document.getElementById('study-explanation-box');
    if (expBox) expBox.style.display = 'block';
  }

  // ==========================================
  // 6. EXAM MODE MODULE LOGIC
  // ==========================================

  let examState = {
    examQuestions: [],         // Array of question objects
    userAnswers: {},           // index: letter selected (e.g. {0: 'A', 2: 'B'})
    flagged: [],               // indices of flagged questions
    currentIndex: 0,
    timeLeft: 0,               // seconds
    timerInterval: null,
    totalTime: 0               // seconds
  };

  function initExam() {
    UI.btnStartExam.addEventListener('click', startExamFlow);
    UI.btnExamPrev.addEventListener('click', examPrevQuestion);
    UI.btnExamNext.addEventListener('click', examNextQuestion);
    UI.btnExamFlag.addEventListener('click', examToggleFlag);
    UI.btnSubmitExam.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn nộp bài thi ngay? Các câu chưa làm sẽ không được tính điểm.')) {
        finishExam();
      }
    });

    UI.btnResultRestart.addEventListener('click', () => {
      UI.examResultContainer.style.display = 'none';
      UI.examSetupContainer.style.display = 'block';
    });

    UI.btnResultToDashboard.addEventListener('click', () => {
      switchSection('dashboard-section');
    });

    UI.btnResultReviewIncorrect.addEventListener('click', () => {
      // Add all incorrect answers to Review box and switch to review
      let added = 0;
      examState.examQuestions.forEach((q, idx) => {
        const ans = examState.userAnswers[idx];
        if (!ans || !q.answer.includes(ans)) {
          if (!state.incorrectQuestions.includes(q.id)) {
            state.incorrectQuestions.push(q.id);
            added++;
          }
        }
      });
      saveState();
      showToast(`Đã thêm ${added} câu hỏi làm sai vào Hộp câu sai!`, 'success');
      switchSection('review-section');
    });

    // Resume an in-progress exam if the page was reloaded mid-exam
    resumeExamSessionIfAny();
  }

  function resumeExamSessionIfAny() {
    const saved = loadExamSession();
    if (!saved || !saved.examQuestions || !saved.examQuestions.length) return;

    const elapsedSecs = Math.floor((Date.now() - (saved.savedAt || Date.now())) / 1000);
    const remaining = Math.max(0, (saved.timeLeft || 0) - elapsedSecs);

    examState.examQuestions = saved.examQuestions;
    examState.userAnswers = saved.userAnswers || {};
    examState.flagged = saved.flagged || [];
    examState.currentIndex = Math.min(Math.max(saved.currentIndex || 0, 0), examState.examQuestions.length - 1);
    examState.totalTime = saved.totalTime || 0;
    examState.timeLeft = remaining;

    UI.examSetupContainer.style.display = 'none';
    UI.examActiveContainer.style.display = 'grid';
    UI.examResultContainer.style.display = 'none';

    UI.examTotalCount.textContent = examState.examQuestions.length;

    renderExamGrid();
    renderExamQuestion();

    if (remaining > 0) {
      startTimer();
      showToast('Đã khôi phục bài thi đang làm dở!', 'info');
    } else {
      showToast('Hết giờ làm bài trong lúc bạn vắng mặt! Hệ thống tự động nộp đề.', 'warning');
      finishExam();
    }
  }

  function startExamFlow() {
    const qty = parseInt(UI.examQtySelect.value);
    const durationMins = parseInt(UI.examTimeSelect.value);
    
    // Choose random questions from pool
    if (state.questions.length === 0) {
      showToast('Cơ sở dữ liệu câu hỏi chưa sẵn sàng!', 'error');
      return;
    }

    const shuffled = [...state.questions].sort(() => 0.5 - Math.random());
    examState.examQuestions = shuffled.slice(0, qty);
    examState.userAnswers = {};
    examState.flagged = [];
    examState.currentIndex = 0;
    examState.totalTime = durationMins * 60;
    examState.timeLeft = durationMins * 60;

    // UI Switches
    UI.examSetupContainer.style.display = 'none';
    UI.examActiveContainer.style.display = 'grid';
    UI.examResultContainer.style.display = 'none';

    // Populate Side Grid
    UI.examTotalCount.textContent = qty;
    UI.examAnsweredCount.textContent = '0';
    
    renderExamGrid();
    renderExamQuestion();
    startTimer();
    saveExamSession();
  }

  function renderExamGrid() {
    UI.examGridContainer.innerHTML = '';
    examState.examQuestions.forEach((q, idx) => {
      const btn = document.createElement('button');
      btn.className = 'grid-btn';
      btn.textContent = idx + 1;
      btn.id = `exam-grid-btn-${idx}`;

      btn.addEventListener('click', () => {
        examState.currentIndex = idx;
        renderExamQuestion();
        saveExamSession();
      });
      UI.examGridContainer.appendChild(btn);
    });
    updateExamGridStyles();
  }

  function updateExamGridStyles() {
    let answered = 0;
    examState.examQuestions.forEach((q, idx) => {
      const btn = document.getElementById(`exam-grid-btn-${idx}`);
      if (!btn) return;

      btn.className = 'grid-btn'; // Reset
      
      if (idx === examState.currentIndex) {
        btn.classList.add('active');
      }
      
      if (examState.userAnswers[idx]) {
        btn.classList.add('answered');
        answered++;
      }
      
      if (examState.flagged.includes(idx)) {
        btn.classList.add('flagged');
      }
    });
    
    UI.examAnsweredCount.textContent = answered;
  }

  function renderExamQuestion() {
    const q = examState.examQuestions[examState.currentIndex];
    if (!q) return;

    UI.btnExamPrev.disabled = examState.currentIndex === 0;
    UI.btnExamNext.disabled = examState.currentIndex === examState.examQuestions.length - 1;

    // Flag button icon
    const isFlagged = examState.flagged.includes(examState.currentIndex);
    UI.btnExamFlag.innerHTML = isFlagged 
      ? '<i class="fa-solid fa-flag text-warning"></i> Bỏ đánh dấu' 
      : '<i class="fa-regular fa-flag"></i> Đánh dấu câu này';

    const selectedAns = examState.userAnswers[examState.currentIndex];
    const hasOptions = Object.keys(q.options).length > 0;

    let optionsHtml = '';
    if (hasOptions) {
      optionsHtml = `<div class="options-list">`;
      Object.keys(q.options).forEach(letter => {
        const isSelected = selectedAns === letter;
        optionsHtml += `
          <button class="option-btn ${isSelected ? 'correct' : ''}" data-letter="${letter}">
            <div class="option-letter">${letter}</div>
            <div class="option-text">${q.options[letter]}</div>
          </button>
        `;
      });
      optionsHtml += `</div>`;
    } else {
      // Q176 short answer
      optionsHtml = `
        <div class="short-answer-section">
          <input type="text" class="short-answer-field" id="exam-short-answer-input" placeholder="Nhập câu trả lời..." autocomplete="off" value="${selectedAns || ''}">
        </div>
      `;
    }

    UI.examQuestionBox.innerHTML = `
      <div class="question-header">
        <div class="question-meta">
          <span class="meta-pill">Đề thi: Câu ${examState.currentIndex + 1} / ${examState.examQuestions.length}</span>
          <span class="meta-pill text-muted">ID: ${q.id}</span>
        </div>
      </div>
      <div class="question-body">
        <h4>${q.question}</h4>
      </div>
      ${optionsHtml}
    `;

    // Listeners for choices
    if (hasOptions) {
      const optBtns = UI.examQuestionBox.querySelectorAll('.option-btn');
      optBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const letter = btn.getAttribute('data-letter');
          examState.userAnswers[examState.currentIndex] = letter;

          // Visual selection toggle
          optBtns.forEach(b => b.classList.remove('correct'));
          btn.classList.add('correct');

          updateExamGridStyles();
          saveExamSession();
        });
      });
    } else {
      const input = document.getElementById('exam-short-answer-input');
      input.addEventListener('input', (e) => {
        examState.userAnswers[examState.currentIndex] = e.target.value;
        updateExamGridStyles();
        saveExamSession();
      });
    }

    // Highlight current button in grid
    updateExamGridStyles();
  }

  function examPrevQuestion() {
    if (examState.currentIndex > 0) {
      examState.currentIndex--;
      renderExamQuestion();
      saveExamSession();
    }
  }

  function examNextQuestion() {
    if (examState.currentIndex < examState.examQuestions.length - 1) {
      examState.currentIndex++;
      renderExamQuestion();
      saveExamSession();
    }
  }

  function examToggleFlag() {
    const idx = examState.flagged.indexOf(examState.currentIndex);
    if (idx > -1) {
      examState.flagged.splice(idx, 1);
    } else {
      examState.flagged.push(examState.currentIndex);
    }
    renderExamQuestion(); // updates button UI
    saveExamSession();
  }

  // Timer Functions
  function startTimer() {
    if (examState.timerInterval) clearInterval(examState.timerInterval);

    updateTimerUI();

    examState.timerInterval = setInterval(() => {
      examState.timeLeft--;
      updateTimerUI();
      if (examState.timeLeft % 10 === 0) saveExamSession();

      if (examState.timeLeft <= 0) {
        clearInterval(examState.timerInterval);
        showToast('Hết giờ làm bài! Hệ thống tự động nộp đề.', 'warning');
        finishExam();
      }
    }, 1000);
  }

  function updateTimerUI() {
    const mins = Math.floor(examState.timeLeft / 60);
    const secs = examState.timeLeft % 60;
    
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    UI.examTimer.textContent = formatted;
    
    const pct = (examState.timeLeft / examState.totalTime) * 100;
    UI.examTimerBar.style.width = `${pct}%`;

    // Critical timing alert (< 5 mins)
    if (examState.timeLeft < 300) {
      UI.examTimer.classList.add('critical');
      UI.examTimerBar.classList.add('critical');
    } else {
      UI.examTimer.classList.remove('critical');
      UI.examTimerBar.classList.remove('critical');
    }
  }

  function finishExam() {
    clearInterval(examState.timerInterval);
    clearExamSession();

    // Evaluate answers
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;
    
    examState.examQuestions.forEach((q, idx) => {
      const userAns = examState.userAnswers[idx];
      if (!userAns) {
        skipped++;
      } else {
        const hasOptions = Object.keys(q.options).length > 0;
        if (hasOptions) {
          if (q.answer.includes(userAns)) {
            correct++;
          } else {
            incorrect++;
            markQuestionIncorrect(q.id); // Add to review box automatically
          }
        } else {
          // Short answer Q176 check
          if (q.answer.trim().toLowerCase() === userAns.trim().toLowerCase()) {
            correct++;
          } else {
            incorrect++;
            markQuestionIncorrect(q.id);
          }
        }
      }
    });

    const qty = examState.examQuestions.length;
    const score = Math.round((correct / qty) * 100);

    // Save exam to history
    const date = new Date();
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    const timeSpentSecs = examState.totalTime - examState.timeLeft;
    const spentMins = Math.floor(timeSpentSecs / 60);
    const spentSecs = timeSpentSecs % 60;
    const formattedSpent = `${spentMins.toString().padStart(2, '0')}:${spentSecs.toString().padStart(2, '0')}`;

    const newResult = {
      date: formattedDate,
      count: qty,
      duration: formattedSpent,
      correct: correct,
      score: score
    };

    state.examHistory.push(newResult);
    saveState();

    // Render results
    UI.resultScoreTxt.textContent = `${correct} / ${qty}`;
    UI.resultScorePct.textContent = `${score}%`;
    
    let evalTitle = "Chúc mừng bạn!";
    let evalDesc = `Bạn đạt kết quả rất tốt với điểm số cao.`;
    
    if (score >= 90) {
      evalTitle = "Xuất sắc! Thầy cô tự hào!";
      evalDesc = `Bạn đã làm chủ hoàn hảo bộ kiến thức Triết học Mác-Lênin.`;
    } else if (score >= 70) {
      evalTitle = "Rất tốt! Tiến lên!";
      evalDesc = `Bạn hoàn thành bài thi đạt loại giỏi. Tiếp tục ôn tập thêm.`;
    } else if (score >= 50) {
      evalTitle = "Đạt yêu cầu! Cố gắng nữa!";
      evalDesc = `Điểm số trung bình. Hãy tập trung luyện thêm các câu hỏi làm sai.`;
    } else {
      evalTitle = "Chưa đạt! Cần ôn luyện thêm.";
      evalDesc = `Kết quả thi thử dưới trung bình. Hãy chăm chỉ dùng Chế độ Học tập.`;
    }

    UI.resultEvalTitle.textContent = evalTitle;
    UI.resultEvalDesc.textContent = evalDesc;
    UI.resultCorrectCount.textContent = correct;
    UI.resultIncorrectCount.textContent = incorrect;
    UI.resultSkippedCount.textContent = skipped;
    UI.resultTimeTaken.textContent = formattedSpent;

    // Render Detailed Answer Review List
    UI.examResultReviewList.innerHTML = '';
    examState.examQuestions.forEach((q, idx) => {
      const userAns = examState.userAnswers[idx];
      const hasOptions = Object.keys(q.options).length > 0;
      
      let isQuestionCorrect = false;
      if (userAns) {
        isQuestionCorrect = hasOptions ? q.answer.includes(userAns) : q.answer.trim().toLowerCase() === userAns.trim().toLowerCase();
      }

      let optionsHtml = '';
      if (hasOptions) {
        optionsHtml = `<div class="review-item-options">`;
        Object.keys(q.options).forEach(letter => {
          let stateClass = '';
          const isCorrectLetter = q.answer.includes(letter);
          const isSelectedLetter = userAns === letter;
          
          if (isCorrectLetter) stateClass = 'correct';
          else if (isSelectedLetter) stateClass = 'incorrect';

          optionsHtml += `
            <div class="review-opt ${stateClass}">
              <strong>${letter}.</strong> ${q.options[letter]}
              ${isSelectedLetter ? ' <i class="fa-solid fa-user-check"> (Lựa chọn của bạn)</i>' : ''}
              ${isCorrectLetter && !isSelectedLetter ? ' <i class="fa-solid fa-circle-check"> (Đáp án đúng)</i>' : ''}
            </div>
          `;
        });
        optionsHtml += `</div>`;
      } else {
        optionsHtml = `
          <div class="short-answer-review">
            <p><strong>Lựa chọn của bạn:</strong> <span class="${isQuestionCorrect ? 'text-success' : 'text-error'}">${userAns || '(Trống)'}</span></p>
            <p><strong>Đáp án đúng:</strong> <span class="text-success">${q.answer}</span></p>
          </div>
        `;
      }

      const item = document.createElement('div');
      item.className = `review-item ${isQuestionCorrect ? 'correct' : 'incorrect'}`;
      item.innerHTML = `
        <div class="review-item-header">
          <span>Câu ${idx + 1} (ID: ${q.id})</span>
          <span class="review-status-label ${isQuestionCorrect ? 'correct' : 'incorrect'}">
            ${isQuestionCorrect ? 'ĐÚNG' : 'SAI / CHƯA LÀM'}
          </span>
        </div>
        <div class="review-item-question">${q.question}</div>
        ${optionsHtml}
        ${(q.keywords || q.explanation || q.note) ? `<div class="review-item-explanation">${buildExplanationExtras(q)}</div>` : ''}
      `;
      UI.examResultReviewList.appendChild(item);
    });

    // Switches
    UI.examActiveContainer.style.display = 'none';
    UI.examResultContainer.style.display = 'block';
  }

  // ==========================================
  // 7. REVIEW MODE MODULE LOGIC (THE BOX OF ERROR QUESTIONS)
  // ==========================================

  let reviewState = {
    questions: [],
    currentIndex: 0,
    answersRevealed: false
  };

  function initReview() {
    UI.btnReviewPrev.addEventListener('click', reviewPrevQuestion);
    UI.btnReviewNext.addEventListener('click', reviewNextQuestion);
    UI.btnReviewShowAnswer.addEventListener('click', revealReviewAnswer);
    UI.btnReviewGoStudy.addEventListener('click', () => {
      UI.studySetSelect.value = 'all';
      switchSection('study-section');
    });

    UI.btnReviewClearAll.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn xóa sạch danh sách câu trả lời sai không?')) {
        state.incorrectQuestions = [];
        saveState();
        reloadReviewMode();
        showToast('Đã dọn dẹp sạch Hộp câu hỏi sai!', 'success');
      }
    });
  }

  function reloadReviewMode() {
    // Filter questions whose IDs are in state.incorrectQuestions
    reviewState.questions = state.questions.filter(q => state.incorrectQuestions.includes(q.id));
    reviewState.currentIndex = 0;
    reviewState.answersRevealed = false;

    if (reviewState.questions.length === 0) {
      UI.reviewEmptyBox.style.display = 'block';
      UI.reviewActiveBox.style.display = 'none';
    } else {
      UI.reviewEmptyBox.style.display = 'none';
      UI.reviewActiveBox.style.display = 'block';
      UI.reviewTotalCountBadge.textContent = reviewState.questions.length;
      renderReviewQuestion();
    }
  }

  function renderReviewQuestion() {
    const q = reviewState.questions[reviewState.currentIndex];
    if (!q) return;

    reviewState.answersRevealed = false;
    UI.btnReviewPrev.disabled = reviewState.currentIndex === 0;
    UI.btnReviewNext.disabled = reviewState.currentIndex === reviewState.questions.length - 1;

    const isStarred = state.starredQuestions.includes(q.id);
    const hasOptions = Object.keys(q.options).length > 0;

    let optionsHtml = '';
    if (hasOptions) {
      optionsHtml = `<div class="options-list">`;
      Object.keys(q.options).forEach(letter => {
        optionsHtml += `
          <button class="option-btn" data-letter="${letter}">
            <div class="option-letter">${letter}</div>
            <div class="option-text">${q.options[letter]}</div>
          </button>
        `;
      });
      optionsHtml += `</div>`;
    } else {
      // Q176
      optionsHtml = `
        <div class="short-answer-section">
          <input type="text" class="short-answer-field" id="review-short-answer-input" placeholder="Nhập câu trả lời của bạn..." autocomplete="off">
          <button class="btn btn-primary short-answer-check-btn" id="btn-review-check-short">Kiểm tra câu trả lời</button>
        </div>
      `;
    }

    UI.reviewQuestionBox.innerHTML = `
      <div class="question-card">
        <div class="question-header">
          <div class="question-meta">
            <span class="meta-pill" style="background-color: var(--error-glow); color: var(--error)">Ôn tập câu sai: ${reviewState.currentIndex + 1} / ${reviewState.questions.length}</span>
            <span class="meta-pill text-muted">ID: ${q.id}</span>
          </div>
          <button class="btn-star-question ${isStarred ? 'starred' : ''}" id="btn-review-star">
            <i class="${isStarred ? 'fa-solid' : 'fa-regular'} fa-star"></i>
          </button>
        </div>
        <div class="question-body">
          <h4>${q.question}</h4>
        </div>
        ${optionsHtml}
        
        <div class="explanation-card" id="review-explanation-box" style="display: none;">
          <h5><i class="fa-solid fa-lightbulb"></i> Đáp án đúng: ${q.answer}</h5>
          ${buildExplanationExtras(q)}
        </div>
      </div>
    `;

    // Listeners
    const starBtn = document.getElementById('btn-review-star');
    starBtn.addEventListener('click', () => {
      toggleStarred(q.id, starBtn);
    });

    if (hasOptions) {
      const optBtns = UI.reviewQuestionBox.querySelectorAll('.option-btn');
      optBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          if (reviewState.answersRevealed) return;
          handleReviewAnswerSelection(q, btn.getAttribute('data-letter'), btn, optBtns);
        });
      });
    } else {
      const inputField = document.getElementById('review-short-answer-input');
      const checkBtn = document.getElementById('btn-review-check-short');

      checkBtn.addEventListener('click', () => {
        const userVal = inputField.value.trim().toLowerCase();
        const correctVal = q.answer.trim().toLowerCase();
        
        if (userVal === correctVal || correctVal.includes(userVal) && userVal.length > 2) {
          inputField.style.borderColor = 'var(--success)';
          inputField.style.boxShadow = '0 0 0 3px var(--success-glow)';
          showToast('Chính xác! Đã loại câu này ra khỏi Hộp câu sai.', 'success');
          
          // Remove from incorrect list
          const idx = state.incorrectQuestions.indexOf(q.id);
          if (idx > -1) state.incorrectQuestions.splice(idx, 1);
          markQuestionCorrect(q.id);
        } else {
          inputField.style.borderColor = 'var(--error)';
          inputField.style.boxShadow = '0 0 0 3px var(--error-glow)';
          showToast('Chưa chính xác! Tiếp tục cố gắng.', 'error');
        }

        revealReviewAnswer();
        saveState();
      });
    }
  }

  function handleReviewAnswerSelection(question, selectedLetter, clickedBtn, allBtns) {
    reviewState.answersRevealed = true;
    const isCorrect = question.answer.includes(selectedLetter);

    allBtns.forEach(btn => {
      const letter = btn.getAttribute('data-letter');
      if (question.answer.includes(letter)) {
        btn.classList.add('correct');
      }
    });

    const expBox = document.getElementById('review-explanation-box');

    if (isCorrect) {
      clickedBtn.classList.add('correct');
      showToast('Chính xác! Đã loại câu này ra khỏi Hộp câu sai.', 'success');

      // Remove from incorrect questions list
      const idx = state.incorrectQuestions.indexOf(question.id);
      if (idx > -1) {
        state.incorrectQuestions.splice(idx, 1);
      }
      markQuestionCorrect(question.id);
    } else {
      clickedBtn.classList.add('incorrect');
      showToast('Tiếp tục chưa chính xác!', 'error');
      addWrongAnswerNote(expBox, question, selectedLetter);
    }

    if (expBox) expBox.style.display = 'block';

    saveState();
  }

  function reviewPrevQuestion() {
    if (reviewState.currentIndex > 0) {
      reviewState.currentIndex--;
      renderReviewQuestion();
    }
  }

  function reviewNextQuestion() {
    if (reviewState.currentIndex < reviewState.questions.length - 1) {
      reviewState.currentIndex++;
      renderReviewQuestion();
    } else {
      // Finished reviewing errors list, reload to see what remains
      showToast('Đã duyệt qua toàn bộ danh sách ôn tập!', 'info');
      reloadReviewMode();
    }
  }

  function revealReviewAnswer() {
    if (!reviewState.answersRevealed) {
      reviewState.answersRevealed = true;
      const q = reviewState.questions[reviewState.currentIndex];
      
      const optBtns = UI.reviewQuestionBox.querySelectorAll('.option-btn');
      optBtns.forEach(btn => {
        const letter = btn.getAttribute('data-letter');
        if (q.answer.includes(letter)) {
          btn.classList.add('correct');
        }
      });
      
      const expBox = document.getElementById('review-explanation-box');
      if (expBox) expBox.style.display = 'block';
    }
  }

  // ==========================================
  // 8. QUICK SEARCH MODULE LOGIC
  // ==========================================

  function initSearch() {
    UI.searchInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val.length > 0) {
        UI.btnSearchClear.style.display = 'block';
      } else {
        UI.btnSearchClear.style.display = 'none';
      }

      if (val.length >= 2) {
        performSearch(val);
      } else {
        // Show guidance
        UI.searchResultsCount.textContent = '0';
        UI.searchResultsList.innerHTML = `
          <div class="text-center text-muted card py-5">
            <p><i class="fa-solid fa-search fa-2x"></i></p>
            <p class="mt-2">Nhập từ khóa từ 2 ký tự trở lên để tra cứu nhanh câu hỏi trắc nghiệm</p>
          </div>
        `;
      }
    });

    UI.btnSearchClear.addEventListener('click', () => {
      UI.searchInput.value = '';
      UI.btnSearchClear.style.display = 'none';
      UI.searchResultsCount.textContent = '0';
      UI.searchResultsList.innerHTML = `
        <div class="text-center text-muted card py-5">
          <p><i class="fa-solid fa-search fa-2x"></i></p>
          <p class="mt-2">Nhập từ khóa từ 2 ký tự trở lên để tra cứu nhanh câu hỏi trắc nghiệm</p>
        </div>
      `;
    });
  }

  function performSearch(query) {
    const qLower = query.toLowerCase();
    const matches = state.questions.filter(q => {
      // Search in question text
      if (q.question.toLowerCase().includes(qLower)) return true;
      
      // Search in options values
      const optMatch = Object.values(q.options).some(val => val.toLowerCase().includes(qLower));
      if (optMatch) return true;

      // Search in note/explanation
      if (q.note && q.note.toLowerCase().includes(qLower)) return true;

      return false;
    });

    UI.searchResultsCount.textContent = matches.length;

    if (matches.length === 0) {
      UI.searchResultsList.innerHTML = `
        <div class="text-center text-muted card py-5">
          <p><i class="fa-solid fa-magnifying-glass-blur fa-2x"></i></p>
          <p class="mt-2">Không tìm thấy câu hỏi nào phù hợp với từ khóa "${query}"</p>
        </div>
      `;
    } else {
      UI.searchResultsList.innerHTML = '';
      
      // Display up to 100 results for performance
      const listToShow = matches.slice(0, 100);
      listToShow.forEach(q => {
        const item = document.createElement('div');
        item.className = 'search-item';
        
        let optionsHtml = '';
        const hasOptions = Object.keys(q.options).length > 0;
        if (hasOptions) {
          optionsHtml = `<div class="search-item-options">`;
          Object.keys(q.options).forEach(letter => {
            const isCorrect = q.answer.includes(letter);
            optionsHtml += `
              <div class="search-opt ${isCorrect ? 'correct' : ''}">
                <strong>${letter}.</strong> ${q.options[letter]}
              </div>
            `;
          });
          optionsHtml += `</div>`;
        } else {
          optionsHtml = `
            <div class="short-answer-display">
              <strong>Đáp án đúng:</strong> <span class="text-success">${q.answer}</span>
            </div>
          `;
        }

        item.innerHTML = `
          <div class="search-item-header">
            <span class="search-item-qnum">Câu hỏi ID: ${q.id}</span>
            <button class="btn btn-outline btn-star-question ${state.starredQuestions.includes(q.id) ? 'starred' : ''}" data-qid="${q.id}">
              <i class="${state.starredQuestions.includes(q.id) ? 'fa-solid' : 'fa-regular'} fa-star"></i>
            </button>
          </div>
          <div class="search-item-question">${q.question}</div>
          ${optionsHtml}
          ${(q.keywords || q.explanation || q.note) ? `<div class="search-item-note">${buildExplanationExtras(q)}</div>` : ''}
        `;
        
        // Star listener
        const starBtn = item.querySelector('.btn-star-question');
        starBtn.addEventListener('click', () => {
          toggleStarred(q.id, starBtn);
        });

        UI.searchResultsList.appendChild(item);
      });

      if (matches.length > 100) {
        const footer = document.createElement('div');
        footer.className = 'text-center text-muted py-3';
        footer.textContent = `... Và thêm ${matches.length - 100} câu hỏi khác. Vui lòng gõ từ khóa chi tiết hơn để thu hẹp kết quả.`;
        UI.searchResultsList.appendChild(footer);
      }
    }
  }

  // ==========================================
  // 9. KEYBOARD SHORTCUTS LISTENER
  // ==========================================

  window.addEventListener('keydown', (e) => {
    // If user is typing in inputs, don't trigger hotkeys
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA') {
      return;
    }

    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;

    const key = e.key.toUpperCase();

    // 1. Study and Review hotkeys
    if (activeSection.id === 'study-section' || activeSection.id === 'review-section') {
      const isStudy = activeSection.id === 'study-section';
      const curState = isStudy ? studyState : reviewState;
      const q = curState.questions[curState.currentIndex];
      
      if (!q) return;

      const hasOptions = Object.keys(q.options).length > 0;

      // Select A, B, C, D (or 1, 2, 3, 4)
      if (hasOptions) {
        let selectedLetter = '';
        if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
          selectedLetter = key;
        } else if (['1', '2', '3', '4', '5'].includes(key)) {
          const index = parseInt(key) - 1;
          selectedLetter = Object.keys(q.options)[index];
        }

        if (selectedLetter && q.options[selectedLetter]) {
          const container = isStudy ? UI.studyQuestionBox : UI.reviewQuestionBox;
          const btn = container.querySelector(`.option-btn[data-letter="${selectedLetter}"]`);
          const allBtns = container.querySelectorAll('.option-btn');
          
          if (btn && !curState.answersRevealed) {
            if (isStudy) {
              handleStudyAnswerSelection(q, selectedLetter, btn, allBtns);
            } else {
              handleReviewAnswerSelection(q, selectedLetter, btn, allBtns);
            }
          }
        }
      }

      // Space to show answer
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (isStudy) revealStudyAnswer();
        else revealReviewAnswer();
      }

      // Arrow Right for next question
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (isStudy) studyNextQuestion();
        else reviewNextQuestion();
      }

      // Arrow Left for previous question
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (isStudy) studyPrevQuestion();
        else reviewPrevQuestion();
      }

      // 'S' key to star/unstar question
      if (key === 'S') {
        e.preventDefault();
        const starBtn = document.getElementById(isStudy ? 'btn-study-star' : 'btn-review-star');
        if (starBtn) {
          toggleStarred(q.id, starBtn);
        }
      }
    }

    // 2. Active Exam hotkeys
    if (activeSection.id === 'exam-section' && examState.examQuestions.length > 0 && UI.examActiveContainer.style.display === 'grid') {
      const q = examState.examQuestions[examState.currentIndex];
      const hasOptions = Object.keys(q.options).length > 0;

      // Select option
      if (hasOptions) {
        let selectedLetter = '';
        if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
          selectedLetter = key;
        } else if (['1', '2', '3', '4', '5'].includes(key)) {
          const index = parseInt(key) - 1;
          selectedLetter = Object.keys(q.options)[index];
        }

        if (selectedLetter && q.options[selectedLetter]) {
          examState.userAnswers[examState.currentIndex] = selectedLetter;
          
          // Render changes visually in active question box
          const btns = UI.examQuestionBox.querySelectorAll('.option-btn');
          btns.forEach(b => {
            if (b.getAttribute('data-letter') === selectedLetter) {
              b.classList.add('correct');
            } else {
              b.classList.remove('correct');
            }
          });
          
          updateExamGridStyles();
        }
      }

      // F to flag question
      if (key === 'F') {
        e.preventDefault();
        examToggleFlag();
      }

      // Arrow keys navigation
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        examNextQuestion();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        examPrevQuestion();
      }
    }
  });

  // Start the Application
  initApp();
});
