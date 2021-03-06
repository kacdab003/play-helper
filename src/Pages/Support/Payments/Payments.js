import React, { useState } from 'react';
import { connect } from 'react-redux';
import Calculator from './Sections/Calculator';
import Invoices from './Sections/Invoices';
import PaymentSpan from './Sections/PaymentSpan';
import { PaymentsContainer } from './StyledPayments';
import AdditionalTemplate from '../../../components/AdditionalTemplate/AdditionalTemplate';
import MainTextarea from '../../../components/MainTextarea/MainTextarea';
import config from '../../../shared/identifiers';
import { generatePaymentTemplates, generateAmountsArray } from '../../../modules/payments/payments';
import ConfirmButtons from '../../../components/ConfirmButtons/ConfirmButtons';
import ErrorBadge from '../../../components/UI/ErrorBadge/ErrorBadge';

const Payments = ({ fullName }) => {
    const [paymentSpan, setPaymentSpan] = useState(null);
    const [amount, setAmount] = useState(0);
    const [paymentsCount, setPaymentsCount] = useState(config.payments.minCount);
    const [invoices, setInvoices] = useState([]);
    const [template, setTemplate] = useState('');
    const [additionalTemplateActive, setAdditionalTemplateActive] = useState(false);
    const [additionalTemplate, setAdditionalTemplate] = useState('');
    const [paymentsError, setPaymentsError] = useState(null);

    const setInvoicesHandler = (event) => {
        try {
            const invoiceClickEvent = event;
            if (invoices.length === config.payments.maxInvoices) {
                throw new Error(`Fakturę rozkładamy na maksymalnie ${config.payments.maxInvoices} raty`);
            }
            const invoiceString = event.target.value;
            const invoiceMatch = invoiceString.match(config.payments.invoiceRegex)?.[0];

            if (invoiceMatch && !invoices.includes(invoiceMatch)) {
                setInvoices((currentInvoices) => [...currentInvoices, invoiceMatch]);
                invoiceClickEvent.target.value = '';
            }
        } catch (error) {
            setPaymentsError(error);
        }
    };

    const onRemoveInvoice = (invoiceNumber) => {
        return setInvoices((currentInvoices) => currentInvoices.filter((invoice) => invoice !== invoiceNumber));
    };

    const onDivideAmount = () => {
        try {
            const parsedAmount = Number(amount);

            if (Number.isNaN(parsedAmount) || parsedAmount === 0 || parsedAmount > config.payments.maxAmount) {
                throw new Error('Została podana nieprawidłowa kwota do podziału na raty');
            }
            if (invoices.length <= 0 || invoices.length > 3) {
                throw new Error('Niepoprawna liczba faktur');
            }

            const amountsArray = generateAmountsArray(parsedAmount, paymentsCount);
            const paymentTemplates = generatePaymentTemplates({
                name: fullName,
                payments: amountsArray,
                invoices,
                paymentSpan,
            });
            setTemplate(paymentTemplates.mainTemplate);
            setAdditionalTemplateActive(true);
            setAdditionalTemplate(paymentTemplates.additionalTemplate);
        } catch (error) {
            setPaymentsError(error);
        }
    };

    const onClearFields = () => {
        setPaymentSpan(null);
        setAmount(null);
        setPaymentsCount(config.payments.minCount);
        setInvoices([]);
        setTemplate('');
        setAdditionalTemplateActive(false);
    };
    return (
        <>
            <PaymentsContainer>
                <ErrorBadge message={paymentsError?.message} deleteError={() => setPaymentsError(null)} />
                <PaymentSpan setting={paymentSpan} setHandler={setPaymentSpan} />
                <Calculator
                    paymentsCount={paymentsCount}
                    setPaymentsCountHandler={setPaymentsCount}
                    amount={amount}
                    setAmountHandler={setAmount}
                    invoices={invoices}
                    setInvoiceHandler={setInvoicesHandler}
                />
                <Invoices invoices={invoices} removeInvoiceHandler={onRemoveInvoice} />
                <AdditionalTemplate
                    title="Formatka ratalna"
                    enabled={additionalTemplateActive}
                    template={additionalTemplate}
                />
                <ConfirmButtons onGenerateTemplate={onDivideAmount} onClearFields={onClearFields} />
            </PaymentsContainer>
            <MainTextarea value={template} setTemplate={setTemplate} />
        </>
    );
};
const mapStateToProps = (state) => ({
    fullName: state.auth.fullName,
});
export default connect(mapStateToProps, null)(Payments);
