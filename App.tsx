import React, { useState, useEffect } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';
import { DataProvider, useData } from './context/DataContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import ClassView from './components/ClassView';
import PracticeView from './components/PracticeView';
import QuizView from './components/QuizView';
import WorksheetView from './components/WorksheetView';
import SearchView from './components/SearchView';
import DashboardView from './components/DashboardView';
import AdminView from './components/AdminView';
import AboutView from './components/AboutView';

import {
  getProgress,
  recordQuestionSolved,
  recordWorksheetCompleted,
  recordQuizAttempt,
  toggleFavoriteChapter,
  saveProgress,
  claimDailyReward
} from './lib/persistence';
import { UserProgress } from './types';
import { BookOpen, Atom, HelpCircle, FileText, LayoutDashboard, Compass } from 'lucide-react';

function AppContent() {
  const { classes: CLASSES_DATA } = useData();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  // Quick Start Quiz States
  const [quizClassId, setQuizClassId] = useState<number | null>(null);
  const [quizChapterId, setQuizChapterId] = useState<string | null>(null);
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'hard' | 'all'>('all');
  const [quizAutoStart, setQuizAutoStart] = useState<boolean>(false);

  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('physics_qb_dark_mode');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // User Progress State
  const [progress, setProgress] = useState<UserProgress>(getProgress);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const handleClaimDailyReward = () => {
    const updated = claimDailyReward();
    if (updated) {
      setProgress(updated);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  // Synchronize Dark Mode Class on mount and change
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('physics_qb_dark_mode', darkMode.toString());
    } catch (e) {
      console.error(e);
    }
  }, [darkMode]);

  // Handle active callbacks
  const handleToggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleSelectClass = (classId: number) => {
    setSelectedClassId(classId);
    setCurrentView(`class-${classId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePracticeChapter = (classId: number, chapterId: string) => {
    setSelectedClassId(classId);
    setSelectedChapterId(chapterId);
    setSelectedQuestionId(null);
    setCurrentView('practice-session');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePracticeQuestion = (classId: number, chapterId: string, questionId: string) => {
    setSelectedClassId(classId);
    setSelectedChapterId(chapterId);
    setSelectedQuestionId(questionId);
    setCurrentView('practice-session');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizChapter = (classId: number, chapterId: string) => {
    // Navigate straight to Quiz tab, triggering the Quiz Lobby
    setCurrentView('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavoriteChapter = (chapter: string) => {
    const updated = toggleFavoriteChapter(chapter);
    setProgress(updated);
  };

  const handleQuestionSolved = (questionId: string, answer: string, isCorrect: boolean) => {
    const updated = recordQuestionSolved(questionId, answer, isCorrect);
    setProgress(updated);
  };

  const handleWorksheetCompleted = (worksheetId: string) => {
    const updated = recordWorksheetCompleted(worksheetId);
    setProgress(updated);
  };

  const handleQuizCompleted = (attempt: {
    classId: number;
    chapterId: string;
    score: number;
    total: number;
    percentage: number;
    timeTaken: number;
    bookmarkedQuestions?: string[];
  }) => {
    let updated = recordQuizAttempt({ ...attempt, chapterId: attempt.chapterId || "" });
    if (attempt.bookmarkedQuestions && attempt.bookmarkedQuestions.length > 0) {
      attempt.bookmarkedQuestions.forEach(qId => {
        if (!updated.bookmarkedQuestions.includes(qId)) {
          updated.bookmarkedQuestions.push(qId);
        }
      });
      saveProgress(updated);
    }
    setProgress(updated);
  };

  const handleQuickStartQuiz = (classId: number, chapterId: string, difficulty: 'easy' | 'hard' | 'all') => {
    setQuizClassId(classId);
    setQuizChapterId(chapterId);
    setQuizDifficulty(difficulty);
    setQuizAutoStart(true);
    setCurrentView('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (view === 'classes') {
      setSelectedClassId(null);
      setSelectedChapterId(null);
    }
    if (view !== 'quiz') {
      setQuizAutoStart(false);
      setQuizClassId(null);
      setQuizChapterId(null);
      setQuizDifficulty('all');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }} />}
      {/* Sticky Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={handleViewChange}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main Screen Router Workspace */}
      <main className="flex-grow pb-16">
        {currentView === 'home' && (
          <HomeView
            onSelectClass={handleSelectClass}
            onViewChange={handleViewChange}
            progress={progress}
            onQuickStartQuiz={handleQuickStartQuiz}
          />
        )}

        {currentView === 'classes' && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
            <div>
              <h1 className="font-sans text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                Syllabus Hub
              </h1>
              <p className="font-sans text-sm text-slate-500 dark:text-slate-400 mt-1">
                Browse official Physics worksheets and chapters customized for Classes 6 through 10.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CLASSES_DATA.map((cls) => (
                <div
                  key={cls.id}
                  id={`classes-list-card-${cls.id}`}
                  onClick={() => handleSelectClass(cls.id)}
                  className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      <Atom className="h-6 w-6 animate-spin-slow" />
                    </div>
                    <div>
                      <h3 className="font-sans text-base font-bold text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Class {cls.id} Physics
                      </h3>
                      <p className="font-sans text-xs font-semibold text-slate-400">
                        {cls.chaptersCount} Chapters • {cls.worksheetsCount} Worksheets
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView.startsWith('class-') && selectedClassId && (
          <ClassView
            classId={selectedClassId}
            onBack={() => handleViewChange('home')}
            onPracticeChapter={handlePracticeChapter}
            onQuizChapter={handleQuizChapter}
            favoriteChapters={progress.favoriteChapters}
            onToggleFavorite={handleToggleFavoriteChapter}
          />
        )}

        {currentView === 'practice-session' && (
          <PracticeView
            onQuestionSolved={handleQuestionSolved}
            solvedQuestionsMap={progress.solvedQuestions}
            initialClassId={selectedClassId}
            initialChapterId={selectedChapterId}
            initialQuestionId={selectedQuestionId}
          />
        )}

        {currentView === 'quiz' && (
          <QuizView
            onQuizCompleted={handleQuizCompleted}
            initialClassId={quizClassId}
            initialChapterId={quizChapterId}
            initialDifficulty={quizDifficulty}
            autoStartQuiz={quizAutoStart}
          />
        )}

        {currentView === 'worksheets' && (
          <WorksheetView
            onWorksheetCompleted={handleWorksheetCompleted}
            completedWorksheets={progress.completedWorksheets}
          />
        )}

        {currentView === 'search' && (
          <SearchView onPracticeQuestion={handlePracticeQuestion} />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            progress={progress}
            onPracticeChapter={handlePracticeChapter}
            onRemoveFavorite={handleToggleFavoriteChapter}
            onPracticeQuestion={handlePracticeQuestion}
            onClaimDailyReward={handleClaimDailyReward}
          />
        )}

        {currentView === 'about' && <AboutView />}
        {currentView === 'admin' && <AdminView />}
      </main>

      {/* Global Footer */}
      <Footer onViewChange={handleViewChange} />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
