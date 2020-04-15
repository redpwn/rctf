exports.up = function (pgm) {
  pgm.dropColumns('users', ['password'])
}

exports.down = false
