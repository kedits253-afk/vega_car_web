// src/pages/Quiz.jsx — "Quiz Me": one question at a time, progress bar, instant feedback with
// explanation, localStorage resume, results modal (focus-managed), share link + JSON download.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import questions from '../data/quiz.json';

const STORAGE_KEY = 'vega-evx-quiz-v1';

/** Encode results compactly: base64url of "score,total,answersCSV" */
function encodeResults(score, total, answers) {
  const raw = `${score},${total},${answers.map((a) => (a == null ? '-' : a)).join('')}`;
  return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function decodeResults(param) {
  try {
    const raw = atob(param.replace(/-/g, '+').replace(/_/g, '/'));
    const [score, total, ans] = raw.split(',');
    return { score: Number(score), total: Number(total), answers: ans.split('').map((c) => (c === '-' ? null : Number(c))) };
  } catch {
    return null;
  }
}

export default function Quiz() {
  // Restore saved progress (resume pattern)
  const saved = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
  }, []);

  const [index, setIndex] = useState(saved?.index ?? 0);
  const [answers, setAnswers] = useState(saved?.answers ?? Array(questions.length).fill(null));
  const [picked, setPicked] = useState(null);       // option index chosen for current q
  const [locked, setLocked] = useState(false);      // feedback shown until Next
  const [finished, setFinished] = useState(saved?.finished ?? false);
  const [sharedResult, setSharedResult] = useState(null); // when arriving via ?r=...
  const dialogRef = useRef(null);

  const q = questions[index];
  const answeredCount = answers.filter((a) => a !== null).length;
  const score = answers.reduce((s, a, i) => s + (a === questions[i].answer ? 1 : 0), 0);

  // Persist progress on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ index, answers, finished }));
  }, [index, answers, finished]);

  // Read shared results from URL (?r=base64)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '');
    const r = p.get('r');
    if (r) setSharedResult(decodeResults(r));
  }, []);

  // Focus management for the results dialog (a11y)
  useEffect(() => {
    if (finished && dialogRef.current) dialogRef.current.focus();
  }, [finished]);

  function choose(optionIdx) {
    if (locked) return;
    setPicked(optionIdx);
    setLocked(true);
    const next = [...answers];
    next[index] = optionIdx;
    setAnswers(next);
  }

  function next() {
    setPicked(null);
    setLocked(false);
    if (index + 1 < questions.length) setIndex(index + 1);
    else setFinished(true);
  }

  function restart() {
    localStorage.removeItem(STORAGE_KEY);
    setIndex(0);
    setAnswers(Array(questions.length).fill(null));
    setPicked(null);
    setLocked(false);
    setFinished(false);
  }

  function shareLink() {
    const enc = encodeResults(score, questions.length, answers);
    const url = `${window.location.origin}${window.location.pathname}#/quiz?r=${enc}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setSharedResult({ score, total: questions.length, answers });
    window.history.replaceState(null, '', `#/quiz?r=${enc}`);
  }

  function downloadJson() {
    const payload = {
      vehicle: 'Vega EVX',
      date: new Date().toISOString(),
      score,
      total: questions.length,
      answers: answers.map((a, i) => ({
        question: questions[i].question,
        yourAnswer: a == null ? null : questions[i].options[a],
        correct: a === questions[i].answer,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vega-evx-quiz-results.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ---- Shared-result view ------------------------------------------------
  if (sharedResult && !finished) {
    return (
      <section className="page quiz-page" aria-labelledby="quiz-title">
        <div className="container card">
          <h1 id="quiz-title">Shared Quiz Result</h1>
          <p className="lede">Someone scored <strong>{sharedResult.score}/{sharedResult.total}</strong> on the Vega EVX quiz.</p>
          <button className="btn btn-primary" onClick={() => { setSharedResult(null); restart(); }}>
            Take it yourself
          </button>
        </div>
      </section>
    );
  }

  const progressPct = Math.round((answeredCount / questions.length) * 100);

  return (
    <section className="page quiz-page" aria-labelledby="quiz-title">
      <div className="container">
        <h1 id="quiz-title">Quiz Me — How well do you know the Vega EVX?</h1>

        {/* Progress bar */}
        <div className="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100"
             aria-valuenow={progressPct} aria-label="Quiz progress">
          <span style={{ width: `${progressPct}%` }} />
        </div>
        <p className="small">Question {Math.min(index + 1, questions.length)} of {questions.length}</p>

        {!finished && q && (
          <fieldset className="card question-card">
            <legend className="q-text">{q.question}</legend>
            <ul className="options">
              {q.options.map((opt, i) => {
                let cls = 'option';
                if (locked) {
                  if (i === q.answer) cls += ' correct';
                  else if (i === picked) cls += ' wrong';
                }
                return (
                  <li key={i}>
                    <button type="button" className={cls} onClick={() => choose(i)} disabled={locked}>
                      {opt}
                    </button>
                  </li>
                );
              })}
            </ul>
            {locked && (
              <div className="feedback" role="status" aria-live="polite">
                <p className={picked === q.answer ? 'ok' : 'no'}>
                  {picked === q.answer ? '✅ Correct!' : '❌ Not quite.'}
                </p>
                <p>{q.explanation}</p>
                <button className="btn btn-primary" onClick={next}>
                  {index + 1 === questions.length ? 'See results' : 'Next question'}
                </button>
              </div>
            )}
          </fieldset>
        )}

        {/* Results dialog */}
        {finished && (
          <div className="modal-overlay">
            <div className="card modal" role="dialog" aria-modal="true" aria-labelledby="results-title"
                 ref={dialogRef} tabIndex={-1}>
              <h2 id="results-title">Your result: {score} / {questions.length}</h2>
              <ul className="breakdown">
                {questions.map((qq, i) => (
                  <li key={qq.id} className={answers[i] === qq.answer ? 'ok' : 'no'}>
                    {answers[i] === qq.answer ? '✅' : '❌'} {qq.question}
                  </li>
                ))}
              </ul>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={shareLink}>Copy share link</button>
                <button className="btn" onClick={downloadJson}>Download results (JSON)</button>
                <button className="btn" onClick={restart}>Restart quiz</button>
              </div>
              {sharedResult && <p role="status">Share link copied.</p>}
            </div>
          </div>
        )}

        {answeredCount > 0 && !finished && (
          <button className="btn btn-ghost" onClick={restart}>Reset my progress</button>
        )}
      </div>
    </section>
  );
}
