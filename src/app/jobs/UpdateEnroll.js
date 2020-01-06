import { parseISO, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class UpdateEnroll {
  get key() {
    return 'UpdateEnroll';
  }

  async handle({ data }) {
    const { name, email, title, start_date, endDate } = data;

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'Atualização de Matrícula',
      // text: `Sua matrícula foi confirmada com início em ${startDate}
      // e se encerra em ${endDate} e ${title}`,
      template: 'updateEnroll',
      context: {
        student: name,
        plan: title,
        startDate: format(parseISO(start_date), 'dd-MM-yyyy', {
          locale: pt,
        }),
        endDate: format(parseISO(endDate), 'dd-MM-yyyy', {
          locale: pt,
        }),
      },
    });
  }
}

export default new UpdateEnroll();
