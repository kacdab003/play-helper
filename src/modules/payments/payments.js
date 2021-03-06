import moment from 'moment';
import Big from 'big.js';
import config from '../../shared/identifiers';
import { convertDate } from '../../shared/utils';

const generateInvoiceString = (name, invoices) => {
    const genderEnding = name.endsWith('a') ? 'Rozłożyłam' : 'Rozłożyłem';

    const invoiceEnding = invoices.length > 1 ? 'faktury o numerach:' : 'fakturę o numerze';
    const invoicesList = invoices.map((invoice, index) => {
        return `${invoice}${index + 1 === invoices.length ? '' : `,`}`;
    });

    return `Dziękuję za zgłoszenie. ${genderEnding} ${invoiceEnding} ${invoicesList.join(' ')}`;
};

const generatePaymentsObject = (generatorConfig, dividingDay, dueDay) => {
    const { currentDate, paymentsCount, amounts } = generatorConfig;
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();

    let startingMonth = currentDay >= dividingDay ? currentMonth + 1 : currentMonth;
    if (dueDay === 7) {
        startingMonth += 1;
    }
    const startingDate = moment(currentDate).set('month', startingMonth).set('date', dueDay);

    const payments = [];

    for (let i = 0; i < paymentsCount; i += 1) {
        const date = moment(startingDate).add(i, 'months');
        if (dueDay === 31 && i !== 0) {
            date.set('date', dueDay);
        }

        payments.push({
            amount: amounts[i],
            date: convertDate(date.toDate()),
        });
    }

    return payments;
};

const generatePaymentsList = (payments) => {
    const paymentStrings = payments.map((payment, index) => {
        switch (index + 1) {
            case 1:
                return `Rata pierwsza: ${payment.amount.toFixed(2)} zł z datą płatności ${payment.date},`;
            case 2:
                return `rata druga: ${payment.amount.toFixed(2)} zł z datą płatności ${payment.date}${
                    index - 1 === payments.length ? '.' : ','
                }`;
            case 3:
                return `rata trzecia: ${payment.amount.toFixed(2)} zł z datą płatności ${payment.date}.`;
            default:
                throw new Error('Nieobsługiwana liczba rat');
        }
    });

    return paymentStrings.join(`
`);
};

export const generatePayments = (paymentsConfig) => {
    const { currentDate, amounts, paymentsCount, paymentSpan } = paymentsConfig;
    const generatorConfig = {
        currentDate,
        amounts,
        paymentsCount,
    };
    try {
        const { dueDay, dividingDay } = config.payments.deadlines[paymentSpan];
        return generatePaymentsObject(generatorConfig, dividingDay, dueDay);
    } catch (error) {
        throw new Error('Nie wybrano poprawnego okresu rozliczeniowego!');
    }
};

export const generateAmountsArray = (amount, paymentsCount) => {
    const amountDivided = new Big(amount).div(paymentsCount).toFixed(2);

    const amountsArray = [];

    for (let i = 0; i < paymentsCount; i += 1) {
        amountsArray.push(Number(amountDivided));
    }
    const isRoundCorrect = Number(amountDivided) * 3 === amount;

    if (!isRoundCorrect) {
        const difference = Number(amount - Number(amountDivided) * paymentsCount);
        amountsArray[0] += difference;
    }
    return amountsArray;
};

export const generateAdditionalTemplate = (templateConfig) => {
    const { paymentSpan, paymentsCount, paymentsObject, invoices } = templateConfig;
    return `Okres rozliczeniowy: ${paymentSpan}
Liczba przyznanych rat: ${paymentsCount}
Kwotę każdej przyznanej raty:
${paymentsObject
    .map(
        (payment, index) =>
            `Rata ${index + 1} - ${payment.amount.toFixed(2)}${
                index + 1 < paymentsObject.length
                    ? `,
`
                    : '.'
            }`
    )
    .join('')}
Termin płatności danej raty:
${paymentsObject
    .map(
        (payment, index) =>
            `Rata ${index + 1} - ${payment.date}${
                index + 1 < paymentsObject.length
                    ? `,
`
                    : ''
            }`
    )
    .join('')}
Numery faktur rozłożonych na raty:
${invoices
    .map(
        (invoice, index) =>
            `${invoice}${
                index + 1 < invoices.length
                    ? `,
`
                    : ''
            }`
    )
    .join('')}
`;
};

export const generatePaymentTemplates = (paymentConfig) => {
    const { invoices, payments, name, paymentSpan } = paymentConfig;

    const paymentsConfig = {
        currentDate: new Date(Date.now()),
        amounts: payments,
        paymentsCount: payments.length,
        paymentSpan,
    };

    const additionalTemplateConfig = {
        paymentSpan,
        paymentsCount: payments.length,
        paymentsObject: generatePayments(paymentsConfig),
        invoices,
    };

    const paymentsObject = generatePayments(paymentsConfig);

    const paymentsList = generatePaymentsList(paymentsObject);

    return {
        mainTemplate: `${generateInvoiceString(name, invoices)} na ${payments.length} raty.
${paymentsList}
Proszę pamiętać o terminowej płatności rat oraz bieżących faktur, gdyż raty mogą zostać cofnięte.
Pozdrawiam
Obsługa Klienta Play.`,
        additionalTemplate: generateAdditionalTemplate(additionalTemplateConfig),
    };
};
