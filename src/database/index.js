import Sequelize from 'sequelize';

import Student from '../app/models/Student';
import User from '../app/models/User';
import Gymplan from '../app/models/Gymplan';

import databaseConfig from '../config/database';

const models = [Student, User, Gymplan];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models.map(model => model.init(this.connection));
  }
}

export default new Database();
