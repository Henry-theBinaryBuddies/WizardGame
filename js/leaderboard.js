export class Leaderboard {

  constructor() {

    this.endpoint =
      "https://waxtwrtpwjiciooqnwbr.supabase.co/functions/v1/dynamic-api";

    this.maxEntries = 5;
  }


  async getScores() {

    const response =
      await fetch(
        this.endpoint
      );

    if (!response.ok) {
      throw new Error(
        "Unable to load leaderboard."
      );
    }

    return await response.json();
  }


  async qualifies(time) {

    const scores =
      await this.getScores();

    if (
      scores.length <
      this.maxEntries
    ) {
      return true;
    }

    return time <
      scores[
      scores.length - 1
        ].time;
  }


  async addScore(
    name,
    time
  ) {

    const response =
      await fetch(
        this.endpoint,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            name: name,
            time: time
          })
        }
      );

    if (!response.ok) {
      throw new Error(
        "Unable to submit score."
      );
    }
  }
}
