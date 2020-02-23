exports.up = function (pgm) {
  pgm.alterColumn('users', 'id', { type: 'string' })
  pgm.alterColumn('solves', 'id', { type: 'string' })
  pgm.alterColumn('solves', 'userid', { type: 'string' })
}

exports.down = function (pgm) {
  pgm.alterColumn('users', 'id', { type: 'uuid' })
  pgm.alterColumn('solves', 'id', { type: 'uuid' })
  pgm.alterColumn('solves', 'userid', { type: 'uuid' })
}
