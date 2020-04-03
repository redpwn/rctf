exports.up = function (pgm) {
  pgm.addColumns('users', {
    ctftime_id: { type: 'string', unique: true, notNull: false }
  })
  pgm.alterColumn('users', 'email', { notNull: false })
}

exports.down = function (pgm) {
  pgm.dropColumns('solves', ['ctftime_id'])
  pgm.alterColumn('users', 'email', { notNull: true })
}
