import { parseISO, addMonths } from 'date-fns';
// import pt from 'date-fns/locale/pt';

import Enroll from '../models/Enroll';
import Gymplan from '../models/Gymplan';
import Student from '../models/Student';

import EnrollMail from '../jobs/EnrollMail';
import Queue from '../../lib/Queue';

class EnrollController {
  async store(req, res) {
    const { startDate, planId, studentId } = req.body;

    const { price, duration, title } = await Gymplan.findOne({
      where: { id: planId },
    });

    const { name, email } = await Student.findOne({
      where: { id: studentId },
    });

    const totalPrice = price * duration;

    const endDate = addMonths(parseISO(startDate), duration);

    const newEnroll = await Enroll.create({
      start_date: startDate,
      end_date: endDate,
      price: totalPrice,
      student_id: studentId,
      plan_id: planId,
    });

    await Queue.add(EnrollMail.key, {
      name,
      email,
      title,
      startDate,
      endDate,
    });

    return res.json(newEnroll);
  }

  async delete(req, res) {
    const enrollExists = await Enroll.findOne({ where: { id: req.params.id } });

    if (!enrollExists) {
      return res.status(400).json({ error: 'Enroll ID does not exists!' });
    }

    await Enroll.destroy({ where: { id: req.params.id } });

    return res.json(`Enroll ID ${req.params.id} removed!`);
  }

  async index(req, res) {
    const enrollList = await Enroll.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Gymplan,
          as: 'plan',
          attributes: ['id', 'title', 'price'],
        },
      ],
    });

    return res.json(enrollList);
  }

  async update(req, res) {
    const { planId } = req.body;

    const enroll = await Enroll.findOne({ where: { id: req.params.id } });

    if (!enroll) {
      return res.status(400).json({ error: 'Enroll ID does not exists!' });
    }
    const { start_date } = enroll;

    const { price, duration } = await Gymplan.findOne({
      where: { id: planId },
    });

    const totalPrice = price * duration;

    const endDate = addMonths(start_date, duration);

    const updatedEnroll = await enroll.update({
      end_date: endDate,
      price: totalPrice,
      plan_id: planId,
    });

    return res.json(updatedEnroll);
  }
}
export default new EnrollController();
