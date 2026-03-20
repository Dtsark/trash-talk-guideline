// Логика игры
class Game {
  constructor() {
    this.currentLessonIndex = 0;
    this.currentQuestionIndex = 0;
    this.profile = Storage.initProfile();
    this.progress = Storage.initProgress();
    this.answered = false;
    this.answerCorrect = null;
    this.selectedOptionIndex = null;
  }

  // Получить текущий урок
  getCurrentLesson() {
    return gameData.lessons[this.currentLessonIndex % gameData.lessons.length];
  }

  // Получить текущий вопрос
  getCurrentQuestion() {
    const lesson = this.getCurrentLesson();
    return lesson.questions[this.currentQuestionIndex];
  }

  // Проверить ответ
  checkAnswer(optionIndex) {
    if (this.answered) return; // Уже ответили

    const question = this.getCurrentQuestion();
    this.selectedOptionIndex = optionIndex;
    this.answerCorrect = question.options[optionIndex].isCorrect;

    // Сохранить ответ
    Storage.saveAnswer(question.id, this.answerCorrect);

    // Добавить XP
    if (this.answerCorrect) {
      this.profile = Storage.addXP(10);
    }

    this.answered = true;
    return this.answerCorrect;
  }

  // Перейти на следующий вопрос
  nextQuestion() {
    const lesson = this.getCurrentLesson();

    if (this.currentQuestionIndex < lesson.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      // Завершить урок и перейти к следующему
      Storage.completeLesson(lesson.id);

      // Добавить бонус за завершение дня
      if (this.currentQuestionIndex > 0) {
        this.profile = Storage.addXP(5);
      }

      // Обновить стрик
      this.profile = Storage.updateStreak();

      // Перейти на следующий урок
      this.currentLessonIndex++;
      this.currentQuestionIndex = 0;
    }

    this.answered = false;
    this.answerCorrect = null;
    this.selectedOptionIndex = null;
  }

  // Получить информацию для отрисовки
  getDisplayData() {
    const lesson = this.getCurrentLesson();
    const question = this.getCurrentQuestion();
    const totalQuestions = lesson.questions.length;
    const progress = this.currentQuestionIndex + 1;

    return {
      lesson: lesson.title,
      question: question.question,
      options: question.options,
      hint: question.hint,
      progress: `${progress}/${totalQuestions}`,
      profile: {
        level: this.profile.level,
        xp: this.profile.totalXP,
        streak: this.profile.streak
      },
      answered: this.answered,
      answerCorrect: this.answerCorrect
    };
  }

  // Получить описание правильного ответа
  getCorrectOptionText() {
    const question = this.getCurrentQuestion();
    return question.options.find(opt => opt.isCorrect).text;
  }
}

// Инициализировать игру при загрузке
let game;

document.addEventListener('DOMContentLoaded', () => {
  game = new Game();
  render();
});

// Отрисовка интерфейса
function render() {
  const data = game.getDisplayData();

  // Обновить профиль
  document.getElementById('level').textContent = data.profile.level;
  document.getElementById('xp').textContent = data.profile.xp;
  document.getElementById('streak').textContent = data.profile.streak;

  // Обновить урок
  document.getElementById('lesson-title').textContent = data.lesson;

  // Обновить вопрос
  document.getElementById('question-text').textContent = data.question;

  // Обновить варианты ответов
  const optionsContainer = document.getElementById('options');
  optionsContainer.innerHTML = '';

  data.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'option-btn';
    button.textContent = option.text;

    if (!data.answered) {
      button.addEventListener('click', () => handleAnswer(index));
    } else {
      // После ответа - пометить правильный и неправильный
      if (option.isCorrect) {
        button.classList.add('correct');
      } else if (index === game.selectedOptionIndex) {
        // Пометить выбранный неправильный ответ
        button.classList.add('incorrect');
      }
    }

    optionsContainer.appendChild(button);
  });

  // Показать результат
  const resultDiv = document.getElementById('result');
  if (data.answered) {
    resultDiv.classList.remove('hidden');
    resultDiv.classList.toggle('correct', data.answerCorrect);
    resultDiv.classList.toggle('incorrect', !data.answerCorrect);

    if (data.answerCorrect) {
      resultDiv.innerHTML = `
        <div class="result-content">
          <span class="result-icon">✓</span>
          <span class="result-text">Правильно!</span>
          <p class="result-xp">+10 XP</p>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `
        <div class="result-content">
          <span class="result-icon">✗</span>
          <span class="result-text">Неправильно</span>
          <p class="result-explanation">Правильный ответ: ${game.getCorrectOptionText()}</p>
        </div>
      `;
    }
  } else {
    resultDiv.classList.add('hidden');
  }

  // Кнопка "Дальше"
  const nextBtn = document.getElementById('next-btn');
  if (data.answered) {
    nextBtn.classList.remove('hidden');
    nextBtn.onclick = () => {
      game.nextQuestion();
      render();
    };
  } else {
    nextBtn.classList.add('hidden');
  }

  // Прогресс дня
  document.getElementById('progress').textContent = data.progress;

  // Обновить полоску прогресса
  const progressParts = data.progress.split('/');
  const currentQ = parseInt(progressParts[0]);
  const totalQ = parseInt(progressParts[1]);
  const progressPercent = (currentQ / totalQ) * 100;
  document.getElementById('progress-fill').style.width = progressPercent + '%';

  // Подсказка
  const hintDiv = document.getElementById('hint');
  if (data.hint && !data.answered) {
    hintDiv.innerHTML = `<em>💡 ${data.hint}</em>`;
  } else {
    hintDiv.innerHTML = '';
  }
}

// Обработчик ответа
function handleAnswer(optionIndex) {
  game.checkAnswer(optionIndex);
  render();
}
