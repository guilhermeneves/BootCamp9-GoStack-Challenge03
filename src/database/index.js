import Sequelize from 'sequelize';

import Student from '../app/models/Student';
import User from '../app/models/User';
import Gymplan from '../app/models/Gymplan';
import Enroll from '../app/models/Enroll';
import Checkin from '../app/models/Checkin';
import Helporder from '../app/models/Helporder';

import databaseConfig from '../config/database';

const models = [Student, User, Gymplan, Enroll, Checkin, Helporder];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
