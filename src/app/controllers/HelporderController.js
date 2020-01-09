import * as Yup from 'yup';

import Helporder from '../models/Helporder';
import Student from '../models/Student';

class HelporderController {
  async store(req, res) {
    /**
     * Check if the body schema is valid
     */

    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Incorrect Schema!' });
    }
    /**
     * Check if the studentId exist
     */

    const { question } = req.body;
    const studentId = Number(req.params.id);

    const studentExists = await Student.findOne({
      where: { id: studentId },
    });

    if (!studentExists) {
      return res.status(400).json({ error: 'Student does not Exists!' });
    }

    /**
     * Create the question on HelpOrder Database
     */

    const { id, created_at } = await Helporder.create({
      student_id: studentId,
      question,
    });

    return res.json({ id, studentId, created_at, question });
  }

  async index(req, res) {
    /**
     * Check if the studentId exist
     */
    const studentId = Number(req.params.id);

    const studentExists = await Student.findOne({
      where: { id: studentId },
    });

    if (!studentExists) {
      return res.status(400).json({ error: 'Student does not Exists!' });
    }

    /**
     * Find All HelpOrder for an studentId
     */

    const allHelpOrders = await Helporder.findAll({
      where: {
        student_id: studentId,
      },
    });

    return res.json(allHelpOrders);
  }
}

export default new HelporderController();
