const fs = require('fs');

// 1. App.tsx - Cannot find name 'chapterId'
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/handlePracticeChapter\(classId, chapterId\)/g, 'handlePracticeChapter(classId, chapter)');
app = app.replace(/handlePracticeQuestion\(classId, chapterId, questionId\)/g, 'handlePracticeQuestion(classId, chapter, questionId)');
app = app.replace(/handleQuizChapter\(classId, chapterId\)/g, 'handleQuizChapter(classId, chapter)');
app = app.replace(/handleQuickStartQuiz\(classId, chapterId, /g, 'handleQuickStartQuiz(classId, chapter, ');
// wait, if parameter was named chapterId originally, my script might have renamed the param definition but not its usages.
// Let's just do a naive regex restore for params in App.tsx
app = app.replace(/handlePracticeChapter = \(classId: number, chapter: string\)/g, 'handlePracticeChapter = (classId: number, chapterId: string)');
app = app.replace(/handlePracticeQuestion = \(classId: number, chapter: string, questionId: string\)/g, 'handlePracticeQuestion = (classId: number, chapterId: string, questionId: string)');
app = app.replace(/handleQuizChapter = \(classId: number, chapter: string\)/g, 'handleQuizChapter = (classId: number, chapterId: string)');
app = app.replace(/handleQuickStartQuiz = \(classId: number, chapter: string, /g, 'handleQuickStartQuiz = (classId: number, chapterId: string, ');
fs.writeFileSync('src/App.tsx', app);

// 2. AboutView.tsx - Property 'text' does not exist
let about = fs.readFileSync('src/components/AboutView.tsx', 'utf8');
about = about.replace(/question:/g, 'text:'); // Revert question: to text: in AboutView
fs.writeFileSync('src/components/AboutView.tsx', about);

// 3. AdminView.tsx - Property 'classId' is missing in addChapter
let admin = fs.readFileSync('src/components/AdminView.tsx', 'utf8');
admin = admin.replace(/class: parseInt\(classId\)/g, 'classId: parseInt(classId)');
fs.writeFileSync('src/components/AdminView.tsx', admin);

// 4. data/questions.ts - chapterId and classId on Question
let qs = fs.readFileSync('src/data/questions.ts', 'utf8');
qs = qs.replace(/q\.chapterId/g, 'q.chapter');
qs = qs.replace(/q\.classId/g, 'q.class');
fs.writeFileSync('src/data/questions.ts', qs);

// 5. lib/persistence.ts - chapterId in QuizSession
let persist = fs.readFileSync('src/lib/persistence.ts', 'utf8');
persist = persist.replace(/chapter: chapterId/g, 'chapterId: chapterId'); // Revert if any
persist = persist.replace(/chapter: quizSession\.chapter/g, 'chapterId: quizSession.chapterId');
persist = persist.replace(/chapter: /g, 'chapterId: '); 
// Wait, I should just revert 'chapterId' replacement in persistence.ts.
// Let's replace chapter: back to chapterId: for quizSession.
persist = persist.replace(/quizSession\.chapter(?!\w)/g, 'quizSession.chapterId');
fs.writeFileSync('src/lib/persistence.ts', persist);

