// Управление localStorage для сохранения прогресса игры
const Storage = {
  // Ключи в localStorage
  PROFILE_KEY: 'ttgame_profile',
  PROGRESS_KEY: 'ttgame_progress',

  // Инициализировать профиль при первом запуске
  initProfile() {
    const existing = this.getProfile();
    if (!existing) {
      const defaultProfile = {
        level: 1,
        totalXP: 0,
        streak: 0,
        lastPlayed: this.getTodayDate()
      };
      localStorage.setItem(this.PROFILE_KEY, JSON.stringify(defaultProfile));
      return defaultProfile;
    }
    return existing;
  },

  // Инициализировать прогресс
  initProgress() {
    const existing = this.getProgress();
    if (!existing) {
      const defaultProgress = {
        completedLessons: [],
        dailyAnswers: {}
      };
      localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(defaultProgress));
      return defaultProgress;
    }
    return existing;
  },

  // Получить профиль
  getProfile() {
    const data = localStorage.getItem(this.PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Получить прогресс
  getProgress() {
    const data = localStorage.getItem(this.PROGRESS_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Обновить XP и уровень
  addXP(amount) {
    const profile = this.getProfile();
    profile.totalXP += amount;

    // Проверить новый уровень (каждые 100 XP)
    const newLevel = Math.floor(profile.totalXP / 100) + 1;
    profile.level = newLevel;

    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
    return profile;
  },

  // Обновить стрик
  updateStreak() {
    const profile = this.getProfile();
    const today = this.getTodayDate();

    // Если это первый раз сегодня - увеличить стрик
    if (profile.lastPlayed !== today) {
      profile.streak += 1;
      profile.lastPlayed = today;
    }

    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
    return profile;
  },

  // Сохранить ответ на сегодняшний вопрос
  saveAnswer(questionId, isCorrect) {
    const progress = this.getProgress();
    const today = this.getTodayDate();

    if (!progress.dailyAnswers[today]) {
      progress.dailyAnswers[today] = {};
    }

    progress.dailyAnswers[today][questionId] = isCorrect;
    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progress));

    return progress;
  },

  // Проверить, ответил ли уже на этот вопрос сегодня
  hasAnsweredToday(questionId) {
    const progress = this.getProgress();
    const today = this.getTodayDate();

    if (!progress.dailyAnswers[today]) {
      return false;
    }

    return questionId in progress.dailyAnswers[today];
  },

  // Получить сегодняшние ответы
  getTodayAnswers() {
    const progress = this.getProgress();
    const today = this.getTodayDate();

    return progress.dailyAnswers[today] || {};
  },

  // Получить количество правильных ответов сегодня
  getTodayCorrectCount() {
    const todayAnswers = this.getTodayAnswers();
    return Object.values(todayAnswers).filter(isCorrect => isCorrect).length;
  },

  // Завершить урок
  completeLesson(lessonId) {
    const progress = this.getProgress();

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progress));
    }

    return progress;
  },

  // Проверить, завершена ли пара вопросов дня (для бонуса XP)
  isDayCompleted() {
    const todayAnswers = this.getTodayAnswers();
    return Object.keys(todayAnswers).length >= 2; // Минимум 2 вопроса
  },

  // Получить сегодняшнюю дату в формате YYYY-MM-DD
  getTodayDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  },

  // Очистить всё (для тестирования)
  reset() {
    localStorage.removeItem(this.PROFILE_KEY);
    localStorage.removeItem(this.PROGRESS_KEY);
  }
};
