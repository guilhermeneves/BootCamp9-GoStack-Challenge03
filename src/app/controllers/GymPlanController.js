import * as Yup from 'yup';

import Gymplan from '../models/Gymplan';

class GymPlanController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Incorret Schema!' });
    }

    const gymPlanExists = await Gymplan.findOne({
      where: { title: req.body.title },
    });

    if (gymPlanExists) {
      return res.status(400).json({ error: 'GymPlan already Exists!' });
    }

    const { title, duration, price } = await Gymplan.create(req.body);

    return res.json({
      title,
      duration,
      price,
    });
  }

  async index(req, res) {
    const gymPlans = await Gymplan.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
    });

    return res.json(gymPlans);
  }

  async delete(req, res) {
    const idExists = await Gymplan.findOne({ where: { id: req.params.id } });

    if (!idExists) {
      return res.status(400).json({ error: 'GymPlan Id not found' });
    }

    await Gymplan.destroy({ where: { id: req.params.id } });

    return res.json(`GymPlan ID ${req.params.id} removed!`);
  }

  async update(req, res) {
    const gymplan = await Gymplan.findOne({ where: { id: req.params.id } });

    if (!gymplan) {
      return res.status(400).json({ error: 'GymPlan Id not found' });
    }

    const { id, title, duration, price } = await gymplan.update(req.body);

    return res.json({ id, title, duration, price });
  }
}

export default new GymPlanController();
