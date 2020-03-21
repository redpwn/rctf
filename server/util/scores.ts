const threshold = 100

module.exports = {
  getScore: (type:string, minVal:number, maxVal:number, solves:number):number => {
    if (type === 'static') {
      return minVal
    } else {
      // Assumes dynamic if type is not static
      return Math.ceil((minVal - maxVal) / Math.pow(threshold, 2) * Math.pow(solves, 2) + maxVal)
    }
  }
}
