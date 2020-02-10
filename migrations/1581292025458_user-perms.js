exports.up = pgm => {
  pgm.addColumns('users', {
    perms: { type: 'int', notNull: true }
  })
}

exports.down = pgm => {
  pgm.dropColumns('users', 'perms')
}
