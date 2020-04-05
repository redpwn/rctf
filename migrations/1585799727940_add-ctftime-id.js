exports.up = function (pgm) {
  pgm.addColumns('users', {
    ctftime_id: { type: 'string', unique: true, notNull: false }
  })
  pgm.alterColumn('users', 'email', { notNull: false })
  pgm.addConstraint('users', 'require_email_or_ctftime_id', 'check ((email is not null) or (ctftime_id is not null))')
}

exports.down = function (pgm) {
  pgm.dropColumns('users', ['ctftime_id'])
  pgm.alterColumn('users', 'email', { notNull: true })
  pgm.dropConstraint('users', 'require_email_or_ctftime_id')
}
