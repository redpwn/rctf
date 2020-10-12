exports.up = function (pgm) {
  pgm.alterColumn('users', 'created_at', {
    type: 'timestamptz'
  })
  pgm.alterColumn('solves', 'createdat', {
    type: 'timestamptz'
  })
}

exports.down = function (pgm) {
  pgm.alterColumn('solves', 'createdat', {
    type: 'timestamp'
  })
  pgm.alterColumn('users', 'created_at', {
    type: 'timestamp'
  })
}
