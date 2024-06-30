import React, {useEffect, useRef, useState} from 'react';
import {
    Button,
    Card,
    CardContent,
    Cell,
    CellListItem,
    Headline3,
    ParagraphText1,
    Price,
    TextBox,
    TextBoxBiggerTitle,
    TextBoxBigTitle,
    TextBoxSubTitle,
    TextBoxTitle,
    TextField,
    ActionButton
} from '@salutejs/plasma-ui';
import {Modal, ModalsProvider} from "@salutejs/plasma-web";
import './style.css';
import axios from "axios";
import {createAssistant, createSmartappDebugger} from '@salutejs/client';
import {MyHeader} from "./components/MyHeader";
import { useSpatnavInitialization, useSection, getCurrentFocusedElement} from '@salutejs/spatial';
import { IconTrash } from '@salutejs/plasma-icons';
import {ToastForm} from "./components/ToastForm";



export function App() {

    const [userID, _setUserID] = useState('');
    const userIDRef = useRef(userID);

    const setUserID = (data) => {
        userIDRef.current = data;
        _setUserID(data);
    };

    function removeSpecialCharacters(str) {
        return str.replace(/[^a-zA-Z0-9]/g);
    }
    //Установили значение для userID
    function initialize_user(action){
        const sanitizedUserId = removeSpecialCharacters(action.user_id);
        setUserID(sanitizedUserId);
        console.log('User ID initialized:', sanitizedUserId);
        return action.user_id;
    }

    const [expense, setExpense] = useState([
        { user_id: "", tag_id: null, name: null, date: null, amount: null, transaction_id: null }]
    );
    const [income, setIncome] = useState([
        { user_id: "", tag_id: null, name: null, date: null, amount: null, transaction_id: null }]
    );
    let assistant;
    const initializeAssistant = (getState) => {
        if (process.env.NODE_ENV === 'development') {
            return createSmartappDebugger({
                token: process.env.REACT_APP_TOKEN ?? '',
                initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
                getState,
                nativePanel: {
                    defaultText: '',
                    screenshotMode: false,
                    tabIndex: -1,
                },
            });
        } else {
            return createAssistant({ getState });
        }
    };
    function getStateForAssistant() {
        const state = {
            item_selector: {
                items: expense.map(({tag_id, name, date, amount}) => ({
                    tag_id,
                    name,
                    date,
                    amount
                })),
                ignored_words: [
                    'добавить', 'установить', 'запиши', 'поставь', 'закинь', 'напомнить',
                    'удалить', 'удали',
                    'рубли', 'рублей'
                ],
            },
        };
        console.log('getStateForAssistant: state:', state);
        return state;
    }

    const capitalizeFirstLetter = (string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const formatDate = (date) => {
        const { day, month, year } = date;
        const formattedDay = String(day).padStart(2, '0');
        const formattedMonth = String(month).padStart(2, '0');
        return `${year}-${formattedMonth}-${formattedDay}`;
    };


    const add_expense = async (action) => {
        const user_ID = userIDRef.current;
        const data = {
            tag_id: 1,
            name: capitalizeFirstLetter(action.name),
            date: formatDate(action.date),
            amount: parseFloat(action.amount)
        };
        await axios.post(`https://salutfinanceapp.ru/api/v1/finance/expense?user_id=${user_ID}`, data);
        await fetchDataAll();
        console.log('add expense', `https://salutfinanceapp.ru/api/v1/finance/expense?user_id=${user_ID}`);
        console.log(data);
    };

    const add_income = async (action) => {
        const user_ID = userIDRef.current;
        const data = {
            tag_id: 1,
            name: capitalizeFirstLetter(action.name),
            date: formatDate(action.date),
            amount: parseFloat(action.amount)
        };
        if (action.tag_id === null) {
            throw new Error(`Tag with label "${action.tag_id}" not found`);
        }
        await axios.post(`https://salutfinanceapp.ru/api/v1/finance/income?user_id=${user_ID}`, data);
        await fetchDataAll();
        console.log('add income', user_ID);
        console.log(data);
    };

    const delete_expense = async (action) => {
        const user_ID = userIDRef.current;
        const transactionId = action.transaction_id;
        await axios.delete(`https://salutfinanceapp.ru/api/v1/finance/expense/delete/${transactionId}?user_id=${user_ID}`);
        await fetchDataAll();
        console.log('delete expense', user_ID);
        console.log(`https://salutfinanceapp.ru/api/v1/finance/expense/delete/${transactionId}?user_id=${user_ID}`);
    };

    const delete_income = async (action) => {
        const user_ID = userIDRef.current;
        const transactionId = action.transaction_id;
        await axios.delete(`https://salutfinanceapp.ru/api/v1/finance/income/delete/${transactionId}?user_id=${user_ID}`);
        await fetchDataAll();
        console.log('delete income', userID);
        console.log(`https://salutfinanceapp.ru/api/v1/finance/income/delete/${transactionId}?user_id=${user_ID}`);
    };



    const dispatchAssistantAction = (action) => {
        console.log('dispatchAssistantAction', action);
        if (action) {
            switch (action.type) {
                case 'initialize_user':
                    return initialize_user(action);
                case 'add_expense':
                    return add_expense(action);
                case 'add_income':
                    return add_income(action);
                case 'delete_expense':
                    return delete_expense(action);
                case 'delete_income':
                    return delete_income(action);

                default:
                    throw new Error(`Unknown action type: ${action.type}`);
            }
        }
    };

    // useEffect(() => {
    //     console.log('componentDidMount');
    //     assistant = initializeAssistant(() => getStateForAssistant());
    //
    //     assistant.on('data', (event) => {
    //             console.log('assistant.on(data)', event);
    //             if (event.type === 'character') {
    //                 console.log(`assistant.on(data): character: "${event?.character?.id}"`);
    //             }
    //             else if (event.type === 'insets') {
    //                 console.log('assistant.on(data): insets');
    //             } else {
    //                 const { action } = event;
    //                 dispatchAssistantAction(action);
    //             }
    //         }
    //
    //     );
    //
    //     assistant.on('start', (event) => {
    //         let initialData = assistant.getInitialData();
    //         console.log(`assistant.on(start)`, event, initialData);
    //     });
    //
    //     assistant.on('command', (event) => {
    //         console.log(`assistant.on(command)`, event);
    //     });
    //
    //     assistant.on('error', (event) => {
    //         console.log(`assistant.on(error)`, event);
    //     });
    //
    //     assistant.on('tts', (event) => {
    //         console.log(`assistant.on(tts)`, event);
    //     });
    //
    //
    // }, []);
    //
        const [currentPage, setCurrentPage] = useState('main');

    //Expense
    const [isExpenseOpen, setIsExpenseOpen] = React.useState(false);

    const openExpense = () => {
        setIsExpenseOpen(true);
        window.history.pushState({ page: 'expense' }, '');
        setCurrentPage('expense');
    };
    const closeExpense = () => {
        setIsExpenseOpen(false);
        if (currentPage === 'expense') {
            window.history.back();
        }
        setCurrentPage('main');
    };

    //Income
    const [isIncomeOpen, setIsIncomeOpen] = React.useState(false);
    const openIncome = () => {
        setIsIncomeOpen(true);
        window.history.pushState({ page: 'income' }, '');
        setCurrentPage('income');
    };

    const closeIncome = () => {
        setIsIncomeOpen(false);
        if (currentPage === 'income') {
            window.history.back();
        }
        setCurrentPage('main');
    };

    useEffect(() => {
        window.history.replaceState({ page: 'main' }, '');
        window.onpopstate = ({ state }) => {
            if (state.page === 'main') {
                setIsExpenseOpen(false);
                setIsIncomeOpen(false);
                setCurrentPage('main');
            } else if (state.page === 'expense') {
                setIsExpenseOpen(true);
                //setIsIncomeOpen(false);
                setCurrentPage('expense');
            } else if (state.page === 'income') {
                setIsIncomeOpen(true);
                //setIsExpenseOpen(false);
                setCurrentPage('income');
            }
        };
    }, []);

    //Connect backend
    const [expenseTransactions, setExpenseTransactions] = useState([]);
    const [incomeTransactions, setIncomeTransactions] = useState([]);

    const fetchDataAll = async () => {
        const user_ID = userIDRef.current;
        axios.get(`https://salutfinanceapp.ru/api/v1/finance?user_id=${user_ID}`).then(response => {
            setExpenseTransactions(response.data.transactions.expense);
            setIncomeTransactions(response.data.transactions.income);

        }).catch(error => {
            console.error('Error fetching data:', error);
        });
        console.log('initialize_user 1 ref', userIDRef.current);
        console.log('user_ID', user_ID);
    };

    useEffect(() => {
    if (userID) {
      fetchDataAll();
    }
    }, [userID]);


     const deleteExpense = async (transactionId) => {
        try {
            const user_ID = userIDRef.current;
            await axios.delete(`https://salutfinanceapp.ru/api/v1/finance/expense/delete/${transactionId}?user_id=${user_ID}`);
            console.log('Delete Notes', userID);
            console.log(`https://salutfinanceapp.ru/api/v1/finance/expense/delete/${transactionId}?user_id=${user_ID}`);
            await fetchDataAll();
        } catch (error) {
            console.error(error);
        }
    };
    const deleteIncome = async (transactionId) => {
        try {
            const user_ID = userIDRef.current;
            await axios.delete(`https://salutfinanceapp.ru/api/v1/finance/income/delete/${transactionId}?user_id=${user_ID}`);
            console.log('Delete Notes', user_ID);
            console.log(`https://salutfinanceapp.ru/api/v1/finance/income/delete/${transactionId}?user_id=${user_ID}`);
            await fetchDataAll();
        } catch (error) {
            console.error(error);
        }
    };
    const ModalElem = ({}) => {
        useSpatnavInitialization();
        const [modalSection] = useSection('TextFields');

        const [nameExpense, setNameExpense] = useState('');
        const [amountExpense, setAmountExpense] = useState('');
        const [dateInputExpense, setDateInputExpense] = useState('');

        const [errors, setErrors] = useState({ name: '', amount: '', date: '' });

        const nameRef = useRef(null);
        const amountRef = useRef(null);
        const dateRef = useRef(null);

        useEffect(() => {
            if (nameRef.current) {
                nameRef.current.focus();
            }
        }, []);

        const validateFields = () => {
        let valid = true;
        let newErrors = { name: '', amount: '', date: '' };

        // Проверка на отрицательное значение или ноль
        if (parseFloat(amountExpense) <= 0) {
            newErrors.amount = 'Стоимость должна быть больше нуля';
            valid = false;
        }

        // Проверка на пустое значение
        if (!amountExpense) {
            newErrors.amount = 'Стоимость обязательна для заполнения';
            valid = false;
        }
        if (!nameExpense) {
            newErrors.name = 'Название обязательно для заполнения';
            valid = false;
        }


    
        if (!dateInputExpense) {
            newErrors.date = 'Дата обязательна для заполнения';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
        };

        const handleNameChangeExpense = (e) => {
        setNameExpense(e.target.value);
        nameRef.current.focus(); // Сохраняем фокус
        };

        const handleAmountChangeExpense = (e) => {
        setAmountExpense(e.target.value);
        amountRef.current.focus(); // Сохраняем фокус
    };


        const handleDateChangeExpense = (e) => {
        setDateInputExpense(e.target.value);
        dateRef.current.focus(); // Сохраняем фокус
        };

        const handleSubmitExpense = async () => {
        if (!validateFields()) {
            return;
        }
        const user_ID = userIDRef.current;
        const data = {
            tag_id: 1,
            name: nameExpense,
            date: dateInputExpense,
            amount: parseFloat(amountExpense)
        };
        try {
            await axios.post(`https://salutfinanceapp.ru/api/v1/finance/expense?user_id=${user_ID}`, data);
            setIsExpenseOpen(false);
            console.log('Submit Expense', user_ID);
            console.log(data);
            setDateInputExpense('');
            setNameExpense('');
            setAmountExpense('');
            await fetchDataAll();
        } catch (error) {
            console.error("There was an error creating the expense!", error, data);
        }
        };



        return (
            <div {...modalSection}>
            <Headline3 mb={20}>Добавить расход</Headline3>
            <ParagraphText1 mt={10} mb={10}>Название:</ParagraphText1>
            <TextField
                ref={nameRef}
                required={true}
                placeholder="Объект"
                value={nameExpense}
                onChange={handleNameChangeExpense}
                error={errors.name}
                helperText={errors.name}
            />
            <ParagraphText1 mt={10} mb={10}>Стоимость:</ParagraphText1>
            <TextField
                ref={amountRef}
                required={true}
                placeholder="Введите сумму"
                type='number'
                value={amountExpense}
                onChange={handleAmountChangeExpense}
                error={errors.amount}
                helperText={errors.amount}
            />
            <ParagraphText1 mt={10} mb={10}>Дата покупки:</ParagraphText1>
            <TextField
                ref={dateRef}
                required={true}
                type="date"
                value={dateInputExpense}
                onChange={handleDateChangeExpense}
                placeholder="день.месяц.год"
                error={errors.date}
                helperText={errors.date}
            />
            <Button className="button-bar-modal-1" m={10}
                    text="Добавить" mr={10}
                    onClick={handleSubmitExpense}
                    stretch="true"
            />
            <Button className="button-bar-modal-2" m={5}
                    text="Закрыть"
                    onClick={() => setIsExpenseOpen(false)}
                    stretch="true"
            />
            
        </div>
    );
};


    const ModalElemInc = ({}) => {
        useSpatnavInitialization();
        const [modalSectionInc] = useSection('TextFields');

        const [dateInputIncome, setDateInputIncome] = React.useState('');
        const [nameIncome, setNameIncome] = useState('');
        const [amountIncome, setAmountIncome] = useState('');

        const [errors, setErrors] = useState({ name: '', amount: '', date: '' });


        const nameRef = useRef(null);
        const amountRef = useRef(null);
        const dateRef = useRef(null);

        useEffect(() => {
            if (nameRef.current) {
                nameRef.current.focus();
            }
        }, []);

        const handleNameChangeIncome = (e) => {
        setNameIncome(e.target.value);
        nameRef.current.focus(); // Сохраняем фокус
        };

        const handleAmountChangeIncome = (e) => {
        setAmountIncome(e.target.value);
        amountRef.current.focus(); // Сохраняем фокус
        };

        const handleDateChangeIncome = (e) => {
        setDateInputIncome(e.target.value);
        dateRef.current.focus(); // Сохраняем фокус
        };

        const validateFields = () => {
        let valid = true;
        let newErrors = { name: '', amount: '', date: '' };

        // Проверка на отрицательное значение или ноль
        if (parseFloat(amountIncome) <= 0) {
            newErrors.amount = 'Стоимость должна быть больше нуля';
            valid = false;
        }

        // Проверка на пустое значение
        if (!amountIncome) {
            newErrors.amount = 'Стоимость обязательна для заполнения';
            valid = false;
        }

        if (!nameIncome) {
            newErrors.name = 'Название обязательно для заполнения';
            valid = false;
        }
    
        if (!dateInputIncome) {
            newErrors.date = 'Дата обязательна для заполнения';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
        };



        const handleSubmitIncome = async () => {
        if (!validateFields()) {
            return;
        }
        const user_ID = userIDRef.current;
        const data = {
            tag_id: 1,
            name: nameIncome,
            date: dateInputIncome,
            amount: parseFloat(amountIncome)
        };

        try {
            await axios.post(`https://salutfinanceapp.ru/api/v1/finance/income?user_id=${user_ID}`, data);
            console.log('Submit Income', user_ID);
            console.log(data);
            setIsIncomeOpen(false);
            setDateInputIncome('');
            setNameIncome('');
            setAmountIncome('');
            await fetchDataAll();
        } catch (error) {
            console.error("error creating the income", error, data);
        }
        };


        return (
            <div {...modalSectionInc}>
            <Headline3 mb={20}>Добавить доход</Headline3>

            <ParagraphText1 mt={10} mb={10}>Название:</ParagraphText1>
            <TextField
                ref={nameRef}
                required={true}
                placeholder="Объект"
                value={nameIncome}
                onChange={handleNameChangeIncome}
                error={errors.name}
                helperText={errors.name}

            />
            <ParagraphText1 mt={10} mb={10}>Стоимость:</ParagraphText1>
            <TextField
                ref={amountRef}
                required={true}
                placeholder="Введите сумму"
                type='number'
                value={amountIncome}
                onChange={handleAmountChangeIncome}
                error={errors.amount}
                helperText={errors.amount}
            />
            <ParagraphText1 mt={10} mb={10}>Дата зачисления:</ParagraphText1>
            <TextField
                ref={dateRef}
                required={true}
                type="date"
                value={dateInputIncome}
                onChange={handleDateChangeIncome}
                placeholder="день.месяц.год"
                error={errors.date}
                helperText={errors.date}

            />
            <Button className="button-bar-modal-1" m={10}
                    stretch="true" text="Добавить"
                    onClick={handleSubmitIncome}
            />
            <Button className="button-bar-modal-2" m={5}
                    text="Закрыть"
                    onClick={() => setIsIncomeOpen(false)}
                    stretch="true"
            />
            </div>
    );
};

    const Elements = ({}) => {
        useSpatnavInitialization();
        const [sectionProps] = useSection('Buttons');

        const ref = useRef(null);

        const handleKeyDown = (event) => {
            if (event.code === 'ArrowDown' || event.code === 'ArrowUp') {
                const focusedElement = getCurrentFocusedElement();
                if (focusedElement) {
                    focusedElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'nearest'
                    });
                }
            }
        };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
        }, []);

        return (
            <div {...sectionProps}>
                <div className="buttons-bar" tabIndex={-1}>
                    <Button className="button-bar-button" size="l" pin="circle-circle"
                            text="Добавить расход" onClick={openExpense}/>
                    <Button className="button-bar-button" size="l" pin="circle-circle"
                            text="Добавить доход" onClick={openIncome}/>
                    <ToastForm />
                </div>
                <div className="cards-row">
                    <Card className="cards-row-card" style={{ maxHeight: '22.5rem' }} tabIndex={-1}>
                        <Cell className="name-list" content={<TextBoxBigTitle>Расходы:</TextBoxBigTitle>} />
                        <CardContent className="scrollable-content" compact>
                            {expenseTransactions.slice().reverse().map((transaction, index1) => (
                            <CellListItem
                                key={index1}
                                tabIndex={index1 + 1} // Индексы начинаются с 1
                                content={
                                    <TextBox>
                                        <TextBoxTitle>{transaction.name}</TextBoxTitle>
                                            <div className="row-notes">
                                                <TextBoxSubTitle>Id: {transaction.transaction_id}</TextBoxSubTitle>
                                                <TextBoxSubTitle>Дата: {transaction.date}</TextBoxSubTitle>
                                                <TextBoxSubTitle>Сумма: <Price currency="rub" stroke={false}>{Math.abs(transaction.amount)}</Price></TextBoxSubTitle>
                                            </div>
                                    </TextBox>
                                }
                                contentRight={
                                    <ActionButton ref={ref} pin="circle-circle" className="sn-section-item" tabIndex={-1}
                                        onClick={() => deleteExpense(transaction.transaction_id)}>
                                        <IconTrash size="xs" color="inherit" />
                                    </ActionButton>
                                }
                            />
                        ))}
                        </CardContent>
                    </Card>
                    <Card className="cards-row-card" style={{ maxHeight: '22.5rem' }} tabIndex={-1}>
                        <Cell className="name-list" content={<TextBoxBigTitle>Доходы:</TextBoxBigTitle>} />
                        <CardContent className="scrollable-content" compact>
                            {incomeTransactions.slice().reverse().map((transaction, index2) => (
                            <CellListItem
                                key={index2}
                                tabIndex={expenseTransactions.length + index2 + 1} // Индексы начинаются после последнего элемента первого списка
                                content={
                                    <TextBox>
                                        <TextBoxTitle>{transaction.name}</TextBoxTitle>
                                            <div className="row-notes">
                                                <TextBoxSubTitle>Id: {transaction.transaction_id}</TextBoxSubTitle>
                                                <TextBoxSubTitle>Дата: {transaction.date}</TextBoxSubTitle>
                                                <TextBoxSubTitle>Сумма: <Price currency="rub" stroke={false}>{Math.abs(transaction.amount)}</Price></TextBoxSubTitle>
                                            </div>
                                    </TextBox>
                                }
                                contentRight={
                                    <ActionButton ref={ref} pin="circle-circle" className="sn-section-item" tabIndex={-1}
                                        onClick={() => deleteIncome(transaction.transaction_id)}>
                                        <IconTrash size="xs" color="inherit" />
                                    </ActionButton>
                                }
                            />
                        ))}
                        </CardContent>
                    </Card>
                    <Card className="cards-row-card sum-card">
                        <CardContent compact>
                            <Cell
                                content={<TextBoxBigTitle>Общая сумма расходов: </TextBoxBigTitle>}
                            />
                            <Cell
                                content={
                                    <TextBoxBiggerTitle>
                                        <Price currency="rub" stroke={false}>{totalExpense}</Price>
                                    </TextBoxBiggerTitle>
                                }
                                alignRight="center"
                            />
                        </CardContent>
                        <CardContent compact>
                            <Cell
                                content={<TextBoxBigTitle>Общая сумма доходов: </TextBoxBigTitle>}
                            />
                            <Cell
                                content={
                                    <TextBoxBiggerTitle>
                                        <Price currency="rub" stroke={false}>{totalIncome}</Price>
                                    </TextBoxBiggerTitle>
                                }
                                alignRight="center"
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="empty-block" style={{ height: '22.5rem', width: '100%' }}>
                </div>
            </div>
        );
    }

    //sum
    const [totalExpense, setTotalExpense] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);

    useEffect(() => {
        const calculateTotalExpense = () => {
            const total = expenseTransactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
            setTotalExpense(total);
        };

        const calculateTotalIncome = () => {
            const total = incomeTransactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
            setTotalIncome(total);
        };

        calculateTotalExpense();
        calculateTotalIncome();
    }, [expenseTransactions, incomeTransactions]);


    return (
        <div className="App">
            <div className="main-app">
                <div className="my-header">
                    <MyHeader/>
                </div>
                <Elements></Elements>
                <Modal closeOnEsc={false} showCloseButton={false}
                       isOpen={isExpenseOpen} onClose={closeExpense}>
                    <ModalElem></ModalElem>
                </Modal>
                <Modal closeOnEsc={false} showCloseButton={false}
                       isOpen={isIncomeOpen} onClose={closeIncome}>
                    <ModalElemInc></ModalElemInc>
                </Modal>
            </div>
        </div>
    );

}
