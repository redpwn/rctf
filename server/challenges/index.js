module.exports = {
  getAllChallenges: () => {
    return [{
      name: "Test",
      category: "Pwn",
      author: "Test",
      description: "A test challenge",
      points: {
        min: 50
        max: 100
      },
      files: ["static/security.txt"],
      id: "random-uuid-here"
    }]
  },
  getChallenge: id => {

  },
  resetCache: () => {

  }
}
