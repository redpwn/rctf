exports.up = function (pgm) {
  pgm.alterColumn('user_members', 'id', { type: 'string' })
}

exports.down = function (pgm) {
  pgm.alterColumn('user_members', 'id', { type: 'uuid', using: 'id::uuid' })
}
