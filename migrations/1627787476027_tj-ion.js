exports.up = pgm => {
  pgm.dropConstraint('users', 'require_email_or_ctftime_id')
  pgm.alterColumn('users', 'email', { notNull: true })
  pgm.dropColumns('users', ['ctftime_id'])
  pgm.addColumns('users', {
    ion_id: { type: 'string', unique: false },
    ion_data: { type: 'jsonb', notNull: false }
  })
}
