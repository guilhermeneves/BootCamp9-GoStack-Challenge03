import { Op } from 'sequelize';
import { subDays, parseISO } from 'date-fns';

import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async store(req, res) {
    /**
     * Check if the studentId is valid
     */

    const studentId = Number(req.params.id);
    const studentExists = await Student.findOne({ where: { id: studentId } });

    if (!studentExists) {
      return res.status(400).json({ error: 'studentId does not Exists!' });
    }

    /**
     * Check if the studentId has more than 5 checkins in the last 7 days
     */
    const today = new Date();
    const last7Day = subDays(today, 7).toISOString();

    const checkinCount = await Checkin.count({
      where: { student_id: studentId, created_at: { [Op.gte]: last7Day } },
    });

    if (checkinCount > 4) {
      return res
        .status(400)
        .json('More than 5 checkins in a 7 row days are not allowed');
    }
    /**
     * If all validation are passed the checkin is included in the database
     */

    const newCheckin = await Checkin.create({
      student_id: studentId,
    });

    return res.json(newCheckin);
  }

  async index(req, res) {
    /**
     * Check if the studentId Exists
     */

    const studentId = Number(req.params.id);

    const studentExists = await Student.findOne({ where: { id: studentId } });

    if (!studentExists) {
      return res.status(400).json({ error: 'studentId does not Exists!' });
    }

    /**
     * List all checkins for a studentId
     */

    const checkinList = await Checkin.findAll({
      where: { student_id: studentId },
      attributes: ['student_id', 'created_at'],
    });

    return res.json(checkinList);
  }
}

export default new CheckinController();
