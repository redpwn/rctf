exports.up = function (pgm) {
  pgm.dropColumns('user_members', ['name', 'grade'])
}

exports.down = false
