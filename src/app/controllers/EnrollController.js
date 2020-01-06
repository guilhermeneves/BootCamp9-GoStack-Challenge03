import { parseISO, addMonths, isAfter, addDays } from 'date-fns';
import * as Yup from 'yup';
import { Op } from 'sequelize';
// import pt from 'date-fns/locale/pt';

import Enroll from '../models/Enroll';
import Gymplan from '../models/Gymplan';
import Student from '../models/Student';

import EnrollMail from '../jobs/EnrollMail';
import UpdateEnroll from '../jobs/UpdateEnroll';
import Queue from '../../lib/Queue';

class EnrollController {
  async store(req, res) {
    /**
     * Validate Req. Body Schema using Yup. Below an example of a valid request
     * {
     * "startDate": "2019-12-21T14:04:00-03:00",
     * "planId": 3,
     * "studentId": 2
     * }
     */
    const schema = Yup.object().shape({
      startDate: Yup.string().required(),
      planId: Yup.number().required(),
      studentId: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Incorrect Schema!' });
    }
    const { startDate, planId, studentId } = req.body;

    /**
     * Check if startDate is in the past, if so, allow only 7 days past at max.
     */
    const parsedStartDate = addDays(parseISO(startDate), 7);
    if (!isAfter(parsedStartDate, new Date())) {
      return res
        .status(400)
        .json({ error: 'Only allowed 7 days past dates on startDate!' });
    }

    /**
     * Check if the GymPlan Exists
     */

    const gymPlan = await Gymplan.findOne({
      where: { id: planId },
    });

    if (!gymPlan) {
      return res.status(400).json({ error: 'planID does not Exists!' });
    }

    /**
     * Check if the userId exists
     * Also if the user has an active enroll return bad request
     */

    const student = await Student.findOne({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(400).json({ error: 'Student ID does not Exists!' });
    }
    const { name, email } = student;

    // Convert timestamp format to an ISO string format
    const today = new Date().toISOString();

    const activeEnrollExists = await Enroll.findOne({
      where: {
        end_date: {
          [Op.gte]: today,
        },
        student_id: studentId,
      },
    });

    if (activeEnrollExists) {
      return res
        .status(400)
        .json({ error: 'An active Enroll is still valid!' });
    }
    /**
     * Create the enroll in the database using the Enroll Model
     */
    const { price, duration, title } = gymPlan;

    const totalPrice = price * duration;

    const endDate = addMonths(parseISO(startDate), duration);

    const newEnroll = await Enroll.create({
      start_date: startDate,
      end_date: endDate,
      price: totalPrice,
      student_id: studentId,
      plan_id: planId,
    });

    /**
     * Add the new Enroll in the Mail Queue to send the email to the student
     */

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
    const schema = Yup.object().shape({
      planId: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Incorrect Schema!' });
    }

    const { planId } = req.body;

    const enroll = await Enroll.findOne({ where: { id: req.params.id } });

    if (!enroll) {
      return res.status(400).json({ error: 'Enroll ID does not exists!' });
    }
    const { start_date, student_id } = enroll;

    const { price, duration, title } = await Gymplan.findOne({
      where: { id: planId },
    });

    const totalPrice = price * duration;

    const endDate = addMonths(start_date, duration);

    const updatedEnroll = await enroll.update({
      end_date: endDate,
      price: totalPrice,
      plan_id: planId,
    });

    const { name, email } = await Student.findOne({
      where: { id: student_id },
    });

    await Queue.add(UpdateEnroll.key, {
      name,
      email,
      title,
      start_date,
      endDate,
    });

    return res.json(updatedEnroll);
  }
}
export default new EnrollController();
