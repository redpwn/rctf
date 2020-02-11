module.exports = {
  getAllChallenges: () => {
    return [{
      name: 'Test',
      category: 'Pwn',
      author: 'Test',
      flag: 'flag{example_flag_here}',
      description: 'A test challenge',
      points: {
        min: 50,
        max: 100
      },
      files: ['static/security.txt'],
      id: 'unique/id-here'
    }]
  },
  getChallenge: id => {

  },
  resetCache: () => {

  }
}
