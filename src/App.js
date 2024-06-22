import React, {useEffect, useState} from 'react';
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
    ToastProvider
} from '@salutejs/plasma-ui';
import {Modal, Select, TextField} from "@salutejs/plasma-web";
import './style.css';
import axios from "axios";
import {createAssistant, createSmartappDebugger} from '@salutejs/client';
import {ToastForm} from "./components/ToastForm";
import {MyHeader} from "./components/MyHeader";

export function App() {
    //Assistant
    // const [transactions, setTransactions] = useState([
    //     { id: Math.random().toString(36).substring(7), type: 'expense', name: 'Groceries', сategory: 'Food', amount: 50, date: new Date().toISOString() },
    //     { id: Math.random().toString(36).substring(7), type: 'income', name: 'Salary', category: 'Job', amount: 1000, date: new Date().toISOString() }
    // ]);
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
                // getRecoveryState: getState,
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
        //console.log('getStateForAssistant: transactions:', transactions);

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

    const getValueByLabelExp = (label) => {

        const item = items_Expense.find(item => item.label === label);
        return item ? item.value : null;
    };


    const getValueByLabelInc = (label) => {

        const item = items_Income.find(item => item.label === label);
        return item ? item.value : null;}


    const add_expense = async (action) => {
        const user_id = localStorage.getItem('user_id');
        //const user_id = action.user_id;
        //const user_id = 1;
        console.log('add expense user',user_id);
        const data = {
            tag_id: getValueByLabelExp(capitalizeFirstLetter(action.tag_id)),
            name: action.name,
            date: formatDate(action.date),
            amount: parseFloat(action.amount)

        };
        if (action.tag_id === null) {
            throw new Error(`Tag with label "${action.tag_id}" not found`);
        }

        await axios.post(`http://45.147.177.32:8000/api/v1/finance/expense?user_id=${user_id}`, data);
        fetchDataAll(); // Обновляем списки транзакций после успешного добавления
        console.log(data);
    };


    const add_income = async (action) => {
        console.log('add_income', action);
        const user_id = localStorage.getItem('user_id');
        //const user_id = 1;
        const data = {
            tag_id: getValueByLabelInc(capitalizeFirstLetter(action.tag_id)),
            name: action.name,
            date: formatDate(action.date),
            amount: parseFloat(action.amount)

        };
        if (action.tag_id === null) {
            throw new Error(`Tag with label "${action.tag_id}" not found`);
        }
        await axios.post(`http://45.147.177.32:8000/api/v1/finance/income?user_id=${user_id}`, data);
        fetchDataAll(); // Обновляем списки транзакций после успешного добавления
        console.log(data);
    };

    function delete_expense(action) {
        //const user_id = action.user_id;
        const user_id = localStorage.getItem('user_id');
        const transactionId = action.transaction_id;
        axios.delete(`http://45.147.177.32:8000/api/v1/finance/expense/delete/${transactionId}?user_id=${user_id}`);
        fetchDataAll();

    }

    function delete_income(action) {
        const user_id = localStorage.getItem('user_id');
       // const user_id = 1;
        const transactionId = action.transaction_id;
        axios.delete(`http://45.147.177.32:8000/api/v1/finance/income/delete/${transactionId}?user_id=${user_id}`);
        fetchDataAll();

    }
    function initialize_user(action){
        //const characterId = action.characterID;
        console.log('initialize_user', action.user_id);
        return action.user_id;
    }
    //const user_id = initialize_user(action);

    const dispatchAssistantAction = (action) => {
        console.log('dispatchAssistantAction', action);
        if (action) {
            switch (action.type) {
                case 'add_expense':
                    return add_expense(action);
                case 'add_income':
                    return add_income(action);

                case 'delete_expense':
                    return delete_expense(action);
                case 'delete_income':
                    return delete_income(action);

                case 'initialize_user':
                    //const user_id = action.user_id;
                    console.log('user_is', action.user_id);
                    localStorage.setItem('user_id', action.user_id);
                    return initialize_user(action);

                default:
                    throw new Error(`Unknown action type: ${action.type}`);
            }
        }
    };
    useEffect(() => {
        console.log('componentDidMount');
        assistant = initializeAssistant(() => getStateForAssistant());

        assistant.on('data', (event) => {
            console.log('assistant.on(data)', event);
            if (event.type === 'character') {
                console.log(`assistant.on(data): character: "${event?.character?.id}"`);
            }

            else if (event.type === 'insets') {
                console.log('assistant.on(data): insets');
            } else {
                const { action } = event;
                dispatchAssistantAction(action);
            }
        }

        );

        assistant.on('start', (event) => {
            let initialData = assistant.getInitialData();
            console.log(`assistant.on(start)`, event, initialData);
        });

        assistant.on('command', (event) => {
            console.log(`assistant.on(command)`, event);
        });

        assistant.on('error', (event) => {
            console.log(`assistant.on(error)`, event);
        });

        assistant.on('tts', (event) => {
            console.log(`assistant.on(tts)`, event);
        });


    }, []);


    function _send_action_value(action_id, value) {
        const data = {
            action: {
                action_id: action_id,
                parameters: {
                    value: value,
                },
            },
        };
        const unsubscribe = this.assistant.sendData(data, (data) => {
            const { type, payload } = data;
            console.log('sendData onData:', type, payload);
            unsubscribe();
        });
    }

    //IntroScreen
    const [isIntroVisible, setIsIntroVisible] = React.useState(true);
    const handleStartClick = () => {
        setIsIntroVisible(false);
    };




    //Expense
    const [isExpenseOpen, setIsExpenseOpen] = React.useState(false);
    const closeExpense = React.useCallback(() => {
            setIsExpenseOpen(false);
    });
    const [dateInputExpense, setDateInputExpense] = React.useState('');
    const [dateExpense, setDateExpense] = useState('');
    const [nameExpense, setNameExpense] = useState('');
    const [amountExpense, setAmountExpense] = useState('');
    const handleNameChangeExpense = (e) => {
        setNameExpense(e.target.value);
    };

    const handleAmountChangeExpense = (e) => {
            setAmountExpense(e.target.value);
    };
    const handleDateChangeExpense = (e) => {
        setDateInputExpense(e.target.value);
    };
    // написать подсказку в ассистенте
    const items_Expense = [
        {value: 1, label: 'Одежда'},
        {value: 2, label: 'Продукты'},
        {value: 3, label: 'Дом'},
        {value: 4, label: 'Рестораны'},
        {value: 5, label: 'Услуги'},
        {value: 6, label: 'Развлечения'},
        {value: 7, label: 'Иное'}
    ];


    //Income
    const [isIncomeOpen, setIsIncomeOpen] = React.useState(false);
    const closeIncome = React.useCallback(() => {
            setIsIncomeOpen(false);
    });
    const [dateInputIncome, setDateInputIncome] = React.useState('');
    const [dateIncome, setDateIncome] = useState(null);
    const [nameIncome, setNameIncome] = useState('');
    const [amountIncome, setAmountIncome] = useState('');
    const handleNameChangeIncome = (e) => {
        setNameIncome(e.target.value);
    };
    const handleAmountChangeIncome = (e) => {
        setAmountIncome(e.target.value);
    };
    const handleDateChangeIncome = (e) => {
        setDateInputIncome(e.target.value);
    };
    const items_Income = [
        {value: 1, label: 'Зарплата'},
        {value: 2, label: 'Подарок'},
        {value: 3, label: 'Иной доход'},
    ];

    //Connect backend
    const [expenseTransactions, setExpenseTransactions] = useState([]);
    const [incomeTransactions, setIncomeTransactions] = useState([]);
    const fetchDataAll = () => {
        const user_id = localStorage.getItem('user_id');

        axios.get('http://45.147.177.32:8000/api/v1/finance', {
            params: {user_id: user_id}
        }).then(response => {
            setExpenseTransactions(response.data.transactions.expense);
            setIncomeTransactions(response.data.transactions.income);
        }).catch(error => {
            console.error('Error fetching data:', error);
        });
    };
    useEffect(() => {
        fetchDataAll();
    }, []);


    const getLabelByValueExpense = (value) => {
        const item = items_Expense.find(item => item.value === value);
        return item ? item.label : 'Неизвестно';
    };


    //ExpenceForm
    const handleSubmitExpense = async () => {
        const user_id = localStorage.getItem('user_id');
        const data = {
            tag_id: dateExpense,
            name: nameExpense,
            date: dateInputExpense,
            amount: parseFloat(amountExpense)
        };
        try {
            await axios.post(`http://45.147.177.32:8000/api/v1/finance/expense?user_id=${user_id}`, data);
            closeExpense();
            console.log('front user_id', user_id, data);
            fetchDataAll();
            setDateInputExpense('');
            setDateExpense('');
            setNameExpense('');
            setAmountExpense('');
        } catch (error) {
            console.error("There was an error creating the expense!", error, data);
        }
    };

    //IncomeForm
    const handleSubmitIncome = async () => {
        const user_id = localStorage.getItem('user_id');
        const data = {
            tag_id: dateIncome,
            name: nameIncome,
            date: dateInputIncome,
            amount: parseFloat(amountIncome)
        };
        try {
            await axios.post(`http://45.147.177.32:8000/api/v1/finance/income?user_id=${user_id}`, data);
            closeIncome();
            fetchDataAll();
            setDateInputIncome('');
            setDateIncome('');
            setNameIncome('');
            setAmountIncome('');

            } catch (error) {
                console.error("error creating the income", error, data);
            }
    };
    const getLabelByValueIncome = (value) => {
        const item = items_Income.find(item => item.value === value);
        return item ? item.label : 'Неизвестно';
    };


    //Edit
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const closeEdit = React.useCallback(() => {
        setIsEditOpen(false);
    });
    const [idEdit, setIdEdit] = useState('');
    const handleIdEdit = (e) => {
        setIdEdit(e.target.value);
    };
    const [dateEdit, setDateEdit] = React.useState('');
    const [nameEdit, setNameEdit] = useState('');
    const [amountEdit, setAmountEdit] = useState('');
    const handleNameEdit = (e) => {
        setNameEdit(e.target.value);
    };

    const handleAmountEdit = (e) => {
        setAmountEdit(e.target.value);
    };

    const handleDateEdit = (e) => {
        setDateEdit(e.target.value);
    };

    const handleEdit = async () => {
        const user_id = localStorage.getItem('user_id');
        const new_data = {
            tag_id: 0,
            name: nameEdit,
            type: operationType,
            date: dateEdit,
            amount: parseFloat(amountEdit)
        };
        try {
            await axios.put(`http://45.147.177.32:8000/api/v1/finance/${operationType}/update/${idEdit}?user_id=${user_id}`, new_data);
            fetchDataAll();
            setIdEdit('');
            setOperationType('');
            setNameEdit('');
            setAmountEdit('');
            closeEdit();
        } catch (error) {
            console.error("There was an error creating the income!", error, new_data);
        }
    };

    //Delete
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const closeDelete = React.useCallback(() => {
        setIsDeleteOpen(false);
    });

    const [operationType, setOperationType] = useState('');
    const options_delete = [
            { value: 'income', label: 'Доходы' },
        { value: 'expense', label: 'Расходы' }
    ];

    const handleOperationType = (e) => {
            setOperationType(e.target.value);
        };
    const [idOperation, setIdOperation] = useState('');

    const handleIdOperation = (e) => {
        setIdOperation(e.target.value);
    };
    const handleDelete = async () => {
        const user_id = localStorage.getItem('user_id');
        try {
            axios.delete(`http://45.147.177.32:8000/api/v1/finance/${operationType}/delete/${idOperation}?user_id=${user_id}`);

        } catch (error) {
            console.error( error);
        }
            setIdOperation('');
            setOperationType('');
            closeDelete();
            fetchDataAll();
    };


    //sum
    const [totalExpense, setTotalExpense] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);

    useEffect(() => {
        const calculateTotalExpense = () => {
            const total = expenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
            setTotalExpense(total);
        };

        const calculateTotalIncome = () => {
            const total = incomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
            setTotalIncome(total);
        };

        calculateTotalExpense();
        calculateTotalIncome();
    }, [expenseTransactions, incomeTransactions]);


        return (
            <div className="App">
                {isIntroVisible ? (
                    <div className="intro-screen">
                        <TextBox as="h1" size="xl" weight="bold">
                            Финансовый Гуру
                        </TextBox>
                        <Button onClick={handleStartClick} size="l">
                            Начать
                        </Button>
                    </div>
                ) : (
                    <div className="main-app">
                        <ToastProvider>
                            <div className="my-header">
                                <MyHeader />
                            </div>
                            <div className="buttons-bar">
                                <Button className="button-bar-button" size="l" pin="circle-circle"
                                        text="Добавить расходы" onClick={() => setIsExpenseOpen(true)}/>

                                <Modal className="scrollable-content-modal" isOpen={isExpenseOpen} onClose={closeExpense}>
                                    <Headline3 mb={20}>Добавить расходы</Headline3>
                                    <ParagraphText1 mt={10} mb={10}>Название</ParagraphText1>
                                    <TextField
                                        required='true'
                                        placeholder="Объект"
                                        value={nameExpense}
                                        onChange={handleNameChangeExpense}
                                    />
                                    <ParagraphText1 mt={10} mb={10}>Тип:</ParagraphText1>
                                    <Select
                                        required='true'
                                        value={dateExpense}
                                        items={items_Expense}
                                        onChange={setDateExpense}
                                        placeholder="Выберите..."
                                        status="success"
                                    />
                                    <ParagraphText1 mt={10} mb={10}>Стоимость:</ParagraphText1>
                                    <TextField
                                        required='true'
                                        placeholder="Введите сумму"
                                        type='number'
                                        value={amountExpense}
                                        onChange={handleAmountChangeExpense}
                                    />
                                    <ParagraphText1 mt={10} mb={10}>Дата покупки:</ParagraphText1>
                                    <TextField
                                        required='true'
                                        type="date"
                                        value={dateInputExpense}
                                        onChange={handleDateChangeExpense}
                                    />
                                    <Button m={10} stretch="true" text="Добавить" onClick={handleSubmitExpense}
                                            className="button-bar-modal"/>
                                </Modal>
                                <Button className="button-bar-button" size="l" pin="circle-circle"
                                        text="Добавить доходы" onClick={() => setIsIncomeOpen(true)}/>
                                <Modal className="scrollable-content-modal" isOpen={isIncomeOpen} onClose={closeIncome}>
                                    <Headline3 mb={20}>Добавить доходы </Headline3>
                                    <ParagraphText1 mt={10} mb={10}>Название:</ParagraphText1>
                                    <TextField placeholder="Объект"
                                               required='true'
                                               value={nameIncome}
                                               onChange={handleNameChangeIncome}/>
                                    <ParagraphText1 mt={10} mb={10}>Тип:</ParagraphText1>
                                    <Select
                                        required='true'
                                        value={dateIncome}
                                        items={items_Income}
                                        onChange={setDateIncome}
                                        placeholder="Выберите..."
                                        status="success"
                                    />
                                    <ParagraphText1 mt={10} mb={10}>Сумма:</ParagraphText1>
                                    <TextField
                                        required='true'
                                        placeholder="Введите сумму"
                                        type='number'
                                        value={amountIncome}
                                        onChange={handleAmountChangeIncome}
                                    />
                                    <ParagraphText1 mt={10} mb={10}>Дата зачисления:</ParagraphText1>
                                    <TextField
                                        required='true'
                                        type="date"
                                        value={dateInputIncome}
                                        onChange={handleDateChangeIncome}
                                    />
                                    <Button stretch="true" text="Добавить" onClick={handleSubmitIncome} className="button-bar-modal"/>
                                </Modal>

                                <Button className="button-bar-button" size="l" pin="circle-circle"
                                        text="Редактировать запись" onClick={() => setIsEditOpen(true)}/>
                                <Modal className="scrollable-content-modal" isOpen={isEditOpen} onClose={closeEdit}>
                                    <Headline3 mb={20}>Редактировать запись</Headline3>
                                    <ParagraphText1 mt={10} mb={10}>Из какого списка?</ParagraphText1>
                                    <Select
                                        required='true'
                                        value={operationType}
                                        items={options_delete}
                                        onChange={setOperationType}
                                        placeholder="Выберите..."
                                        status="success"
                                    />
                                    <ParagraphText1 mt={10} mb={10}>Введите id записи:</ParagraphText1>
                                    <TextField
                                        required='true'
                                        placeholder="Id"
                                        type='number'
                                        value={idEdit}
                                        onChange={handleIdEdit}
                                    />
                                    <ParagraphText1 mt={10} mb={10}>Новое название:</ParagraphText1>
                                    <TextField placeholder="Объект"
                                               required='true'
                                               value={nameEdit}
                                               onChange={handleNameEdit}
                                    />
                                    <ParagraphText1 mt={10} mb={10}>Новая стоимость:</ParagraphText1>
                                    <TextField
                                        required='true'
                                        placeholder="Введите сумму"
                                        type='number'
                                        value={amountEdit}
                                        onChange={handleAmountEdit}
                                    />
                                    <ParagraphText1 mt={10} mb={10}>Новая дата:</ParagraphText1>
                                    <TextField
                                        required='true'
                                        type="date"
                                        value={dateEdit}
                                        onChange={handleDateEdit}
                                    />
                                    <Button className="button-bar-modal" stretch="true" text="Изменить" onClick={handleEdit}/>
                                </Modal>

                                <Button className="button-bar-button" size="l" pin="circle-circle"
                                        text="Удалить запись" onClick={() => setIsDeleteOpen(true)}/>
                                <Modal className="scrollable-content-modal" isOpen={isDeleteOpen} onClose={closeDelete}>
                                    <Headline3 mb={20}>Удалить запись</Headline3>
                                    <ParagraphText1 mt={10} mb={10}>Из какого списка?</ParagraphText1>
                                    <Select
                                        required='true'
                                        value={operationType}
                                        items={options_delete}
                                        onChange={setOperationType}
                                        placeholder="Выберите..."
                                        status="success"
                                    />
                                    <ParagraphText1 mt={10} mb={10}>Введите id записи:</ParagraphText1>
                                    <TextField
                                        required='true'
                                        placeholder="Id"
                                        type='number'
                                        value={idOperation}
                                        onChange={handleIdOperation}
                                    />
                                    <Button className="button-bar-modal" stretch="true" text="Удалить" onClick={handleDelete}/>
                                </Modal>

                                <ToastForm/>
                            </div>

                            <div className="cards-row">
                                <Card className="cards-row-card" style={{ maxHeight: '22.5rem'}}>
                                    <Cell className="name-list" content={<TextBoxBigTitle>Расходы:</TextBoxBigTitle>}/>
                                    <CardContent className="scrollable-content" compact>
                                        {expenseTransactions.slice().reverse().map((transaction, index) => (
                                            <CellListItem
                                                key={index}
                                                content={
                                                    <TextBox>
                                                        <TextBoxTitle>{transaction.name}</TextBoxTitle>
                                                        <div className="row-notes">
                                                            <TextBoxSubTitle>Id: {transaction.transaction_id}</TextBoxSubTitle>
                                                            <TextBoxSubTitle>Дата: {transaction.date}</TextBoxSubTitle>
                                                            <TextBoxSubTitle>Сумма: <Price currency="rub" stroke={false}>{transaction.amount}</Price></TextBoxSubTitle>
                                                            <TextBoxSubTitle>Тип: {getLabelByValueExpense(transaction.tag_id)} </TextBoxSubTitle>
                                                        </div>
                                                    </TextBox>
                                                }
                                            />
                                        ))}
                                    </CardContent>
                                </Card>
                                <Card className="cards-row-card" style={{ maxHeight: '22.5rem'}}>
                                    <Cell className="name-list"content={<TextBoxBigTitle>Доходы:</TextBoxBigTitle>}/>
                                    <CardContent className="scrollable-content" compact>
                                        {incomeTransactions.slice().reverse().map((transaction, index) => (
                                            <CellListItem
                                                key={index}
                                                content={
                                                    <TextBox>
                                                        <TextBoxTitle>{transaction.name}</TextBoxTitle>
                                                        <div className="row-notes">
                                                            <TextBoxSubTitle>Id: {transaction.transaction_id}</TextBoxSubTitle>
                                                            <TextBoxSubTitle>Дата: {transaction.date}</TextBoxSubTitle>
                                                            <TextBoxSubTitle>Сумма: <Price currency="rub" stroke={false}>{transaction.amount}</Price></TextBoxSubTitle>
                                                            <TextBoxSubTitle>Тип: {getLabelByValueIncome(transaction.tag_id)} </TextBoxSubTitle>
                                                        </div>

                                                    </TextBox>
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
                                            content={<TextBoxBiggerTitle><Price currency="rub" stroke={false}>{totalExpense}</Price></TextBoxBiggerTitle>}

                                            alignRight="center"
                                        />
                                    </CardContent>
                                    <CardContent compact>
                                        <Cell
                                            content={<TextBoxBigTitle>Общая сумма доходов: </TextBoxBigTitle>}
                                        />
                                        <Cell
                                            content={<TextBoxBiggerTitle><Price currency="rub" stroke={false}>{totalIncome}</Price></TextBoxBiggerTitle>}

                                            alignRight="center"
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                        </ToastProvider>
                    </div>
                )}


            </div>
        );

    }
