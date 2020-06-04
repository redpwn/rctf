exports.up = function (pgm) {
  pgm.createExtension('citext', { ifNotExists: true })
  pgm.alterColumn('users', 'name', { type: 'citext' })
}

exports.down = function (pgm) {
  pgm.alterColumn('users', 'name', { type: 'string' })
  pgm.dropExtension('citext', { ifExists: true })
}
