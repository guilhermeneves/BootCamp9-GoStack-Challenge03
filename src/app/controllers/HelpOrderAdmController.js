import * as Yup from 'yup';
// import { parseISO } from 'date-fns';

import Helporder from '../models/Helporder';
import Student from '../models/Student';

import UpdateEnroll from '../jobs/AnswerHelpOrder';
import Queue from '../../lib/Queue';

class HelpOrderAdmController {
  async store(req, res) {
    const helpOrderId = Number(req.params.id);
    const { answer } = req.body;
    /**
     * Check if body schema is valid
     */

    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Incorret Schema!' });
    }

    /**
     * Check if Help Order Id is valid
     */

    const helpOrder = await Helporder.findOne({
      where: {
        id: helpOrderId,
      },
    });

    if (!helpOrder) {
      return res.status(400).json({ error: 'HelpOrder does not Exists!' });
    }

    const answerHelpOrder = await helpOrder.update({
      answer,
      answer_at: new Date(),
    });

    const { student_id, question } = answerHelpOrder;

    const { name, email } = await Student.findOne({
      where: { id: student_id },
    });

    await Queue.add(UpdateEnroll.key, {
      name,
      email,
      question,
      answer,
    });

    return res.json(answerHelpOrder);
  }

  async index(req, res) {
    const openedOrders = await Helporder.findAll({
      where: {
        answer: null,
      },
    });
    return res.json(openedOrders);
  }
}

export default new HelpOrderAdmController();
