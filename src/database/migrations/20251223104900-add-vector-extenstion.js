module.exports = {
  up(queryInterface, _Sequelize) {
    return queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS vector;',
    );
  },
};
