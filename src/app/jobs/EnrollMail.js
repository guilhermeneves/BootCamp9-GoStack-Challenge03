import { parseISO, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class EnrollMail {
  get key() {
    return 'EnrollMail';
  }

  async handle({ data }) {
    const { name, email, title, startDate, endDate } = data;

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'Parabéns! Nova Matrícula',
      // text: `Sua matrícula foi confirmada com início em ${startDate}
      // e se encerra em ${endDate} e ${title}`,
      template: 'newEnroll',
      context: {
        student: name,
        plan: title,
        startDate: format(parseISO(startDate), 'dd-mm-yyyy', {
          locale: pt,
        }),
        endDate: format(endDate, 'dd-mm-yyyy', {
          locale: pt,
        }),
      },
    });
  }
}

export default new EnrollMail();
