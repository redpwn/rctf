exports.up = function (pgm) {
  pgm.dropColumns('users', ['password'])
}

exports.down = function (pgm) {
  pgm.addColumns('users', {
    password: { type: 'string', notNull: true }
  })
}
