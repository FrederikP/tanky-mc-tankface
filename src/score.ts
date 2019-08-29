export class Score {

    private currentScore = 0;
    private oldHighScore: number;
    private isHighscore = false;

    constructor(highScore: number) {
        this.oldHighScore = highScore;
    }

    public addPoints(points: number) {
        this.currentScore += points;
        if (!this.isHighscore && this.currentScore > this.oldHighScore) {
            this.isHighscore = true;
        }
        if (this.isHighscore) {
            localStorage.setItem("tankymctankface_highscore", String(this.currentScore));
        }
    }

    public getScore(): number {
        return this.currentScore;
    }

    public newHighscore(): boolean {
        return this.isHighscore;
    }

    public getHighscore(): number {
        if (this.isHighscore) {
            return this.currentScore;
        }
        return this.oldHighScore;
    }
}
