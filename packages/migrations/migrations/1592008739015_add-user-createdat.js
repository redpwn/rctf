exports.up = function (pgm) {
  pgm.addColumns('users', {
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  })
}

exports.down = function (pgm) {
  pgm.dropColumns('users', ['created_at'])
}
