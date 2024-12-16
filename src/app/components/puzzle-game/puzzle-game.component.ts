import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-puzzle-game',
  templateUrl: './puzzle-game.component.html',
  styleUrls: ['./puzzle-game.component.scss'],
  standalone: true,
  imports: [
    MatListModule, 
    CommonModule, 
    MatIconModule, 
    MatButtonModule
  ]
})
export class PuzzleGameComponent implements OnInit, OnDestroy {
  currentQuestionIndex = 0;
  score = 0;
  timeLeft = 30; 
  timer: any;
  isGameOver = false;
  isPaused = false;
  remainingTimeBeforePause = 0;

  questions: Array<{
    question: string;
    answer: number | string;
    options: (number | string)[];
  }> = [
    {
      question: 'אני מספר בין 1 ל-10. אם תכפיל אותי ב-2, תקבל 8. מי אני?',
      answer: 4,
      options: [2, 4, 6, 8],
    },
    {
      question: 'מה המספר הנכון: המספר הראשוני הגדול מ-5?',
      answer: 7,
      options: [5, 6, 7, 8],
    },
    {
      question: 'מה הסדר הנכון לפי הגודל: כדור, חתול, עץ, שמש?',
      answer: 'כדור, חתול, עץ, שמש',
      options: [
        'חתול, כדור, עץ, שמש',
        'כדור, חתול, עץ, שמש',
        'עץ, חתול, כדור, שמש',
        'שמש, עץ, כדור, חתול',
      ],
    },
  ];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  startTimer(): void {
    this.timer = setInterval(() => {
      if (this.timeLeft > 0 && !this.isPaused) {
        this.timeLeft--; 
      } else if (this.timeLeft <= 0) {
        this.checkAnswer(null);
      }
    }, 1000);
  }

  pauseGame(): void {
    this.isPaused = true;
    this.remainingTimeBeforePause = this.timeLeft;
    clearInterval(this.timer);
  }

  resumeGame(): void {
    this.isPaused = false;
    this.startTimer();
  }

  checkAnswer(selectedOption: any): void {
    clearInterval(this.timer);

    const currentQuestion = this.questions[this.currentQuestionIndex];
    if (selectedOption === currentQuestion.answer) {
      this.score += 10;
      this.snackBar.open('תשובה נכונה! קיבלת 10 נקודות.', 'סגור', {
        duration: 2000,
        panelClass: ['custom-snackbar']
      });
    } else {
      this.snackBar.open('תשובה שגויה! נסה שוב.', 'סגור', { duration: 2000, panelClass: ['custom-snackbar'] });
    }

    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.questions.length) {
      this.timeLeft = 30; 
      this.startTimer();
    } else {
      this.isGameOver = true;
    }
  }

  resetGame(): void {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.timeLeft = 30;
    this.isGameOver = false;
    this.isPaused = false;
    this.startTimer();
  }
}