import Mail from '../../lib/Mail';

class AnswerHelpOrder {
  get key() {
    return 'AnswerHelpOrder';
  }

  async handle({ data }) {
    const { name, email, question, answer } = data;

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'Temos uma resposta para seu pedido de auxílio!',
      template: 'answerHelpOrder',
      context: {
        student: name,
        question,
        answer,
      },
    });
  }
}

export default new AnswerHelpOrder();
