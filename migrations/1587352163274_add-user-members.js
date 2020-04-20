exports.up = pgm => {
  pgm.createTable('user_members', {
    id: { type: 'uuid', primaryKey: true },
    userid: { type: 'string', notNull: true },
    name: { type: 'string', unique: true, notNull: true },
    email: { type: 'string', unique: true, notNull: true },
    grade: { type: 'string', notNull: true }
  })

  pgm.addConstraint('user_members', 'uuid_fkey', {
    foreignKeys: {
      columns: 'userid',
      references: 'users("id")',
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }
  })
};

exports.down = pgm => {
  pgm.dropConstraint('user_members', 'uuid_fkey')
  pgm.dropTable('user_members')
}
