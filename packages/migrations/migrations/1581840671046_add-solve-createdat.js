exports.up = function (pgm) {
  pgm.addColumns('solves', {
    createdat: { type: 'timestamp', notNull: true }
  })
}

exports.down = function (pgm) {
  pgm.dropColumns('solves', ['createdat'])
}
