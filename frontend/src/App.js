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
    ToastProvider,
    TextField
} from '@salutejs/plasma-ui';
import {Modal, Select, ModalsProvider} from "@salutejs/plasma-web";
import './style.css';
import axios from "axios";
import {createAssistant, createSmartappDebugger} from '@salutejs/client';
import {ToastForm} from "./components/ToastForm";
import {MyHeader} from "./components/MyHeader";
import { openDB } from 'idb';
import { useSpatnavInitialization, useSection, getCurrentFocusedElement} from '@salutejs/spatial';



export function App() {

    const initDB = async () => {
        const db = await openDB('myDatabase', 1, {
            upgrade(db) {
                db.createObjectStore('keyval');
            },
        });
        return db;
    };

    const saveUserID = async (userID) => {
        const db = await initDB();
        const tx = db.transaction('keyval', 'readwrite');
        const store = tx.objectStore('keyval');
        await store.put(userID, 'userID');
        await tx.done;
    };

    const getUserID = async () => {
        const db = await initDB();
        const tx = db.transaction('keyval', 'readonly');
        const store = tx.objectStore('keyval');
        const userID = await store.get('userID');
        await tx.done;
        return userID;
    };




    function removeSpecialCharacters(str) {
        return str.replace(/[^a-zA-Z0-9]/g);
    }
    //Установили значение для userID
    function initialize_user(action){
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

    //Используем установленное  userID
    //Однако, он говорит, что userID - не определен
    const add_expense = async (action) => {
        const userID = await getUserID(); // Get userID from IndexedDB
        const data = {
            tag_id: 1,
            name: capitalizeFirstLetter(action.name),
            date: formatDate(action.date),
            amount: parseFloat(action.amount)
        };
        await axios.post(`http://45.147.177.32:8000/api/v1/finance/expense?user_id=${userID}`, data);
        fetchDataAll();
        console.log('add expense', `http://45.147.177.32:8000/api/v1/finance/expense?user_id=${userID}`);
        console.log(data);
    };

    const add_income = async (action) => {
        const userID = await getUserID();
        const data = {
            tag_id: 1,
            name: capitalizeFirstLetter(action.name),
            date: formatDate(action.date),
            amount: parseFloat(action.amount)
        };
        if (action.tag_id === null) {
            throw new Error(`Tag with label "${action.tag_id}" not found`);
        }
        await axios.post(`http://45.147.177.32:8000/api/v1/finance/income?user_id=${userID}`, data);
        fetchDataAll(); // Обновляем списки транзакций после успешного добавления
        console.log('add income', userID);
        console.log(data);
    };
    const delete_expense = async (action) => {
        const userID = await getUserID();
        const transactionId = action.transaction_id;
        await axios.delete(`http://45.147.177.32:8000/api/v1/finance/expense/delete/${transactionId}?user_id=${userID}`);
        await fetchDataAll();
        console.log('delete expense', userID);
        console.log(`http://45.147.177.32:8000/api/v1/finance/expense/delete/${transactionId}?user_id=${userID}`);
    };

    const delete_income = async (action) => {
        const userID = await getUserID();
        const transactionId = action.transaction_id;
        await axios.delete(`http://45.147.177.32:8000/api/v1/finance/income/delete/${transactionId}?user_id=${userID}`);
        await fetchDataAll();
        console.log('delete income', userID);
        console.log(`http://45.147.177.32:8000/api/v1/finance/income/delete/${transactionId}?user_id=${userID}`);
    };



    const dispatchAssistantAction = (action) => {
        console.log('dispatchAssistantAction', action);
        if (action) {
            switch (action.type) {
                case 'initialize_user':
                    //localStorage.setItem("userID", removeSpecialCharacters(action.user_id));
                    saveUserID(removeSpecialCharacters(action.user_id));
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


    //Expense
    const [isExpenseOpen, setIsExpenseOpen] = React.useState(false);
    const closeExpense = React.useCallback(() => {
            setIsExpenseOpen(false);
    });
    const [dateInputExpense, setDateInputExpense] = React.useState('');

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


    //Income
    const [isIncomeOpen, setIsIncomeOpen] = React.useState(false);
    const closeIncome = React.useCallback(() => {
            setIsIncomeOpen(false);
    });
    const [dateInputIncome, setDateInputIncome] = React.useState('');
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

    //Connect backend
    const [expenseTransactions, setExpenseTransactions] = useState([]);
    const [incomeTransactions, setIncomeTransactions] = useState([]);
    const fetchDataAll = async () => {
        const userID = await getUserID(); // Get userID from IndexedDB
        axios.get('http://45.147.177.32:8000/api/v1/finance', {
            params: { user_id: userID }
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



    //Добавить расход через форму
    //userID видно без проблем
    //во всех остальных функциях, где используется экран тоже userID определен
    const handleSubmitExpense = async () => {
        const userID = await getUserID();
        const data = {
            tag_id: 1,
            name: nameExpense,
            date: dateInputExpense,
            amount: parseFloat(amountExpense)
        };
        try {
            await axios.post(`http://45.147.177.32:8000/api/v1/finance/expense?user_id=${userID}`, data);
            closeExpense();
            console.log('Submit Expense', userID);
            console.log(data);
            await fetchDataAll();
            setDateInputExpense('');
            setNameExpense('');
            setAmountExpense('');
        } catch (error) {
            console.error("There was an error creating the expense!", error, data);
        }
    };


    //IncomeForm
    const handleSubmitIncome = async () => {
        const userID = await getUserID();
        const data = {
            tag_id: 1,
            name: nameIncome,
            date: dateInputIncome,
            amount: parseFloat(amountIncome)
        };
        try {
            await axios.post(`http://45.147.177.32:8000/api/v1/finance/income?user_id=${userID}`, data);
            closeIncome();
            console.log('Submit Income', userID);
            console.log(data);
            await fetchDataAll();
            setDateInputIncome('');
            setNameIncome('');
            setAmountIncome('');
        } catch (error) {
            console.error("error creating the income", error, data);
        }
    };
    //Delete
    const [isDeleteOpenExpense, setIsDeleteOpenExpense] = React.useState(false);
    const closeDeleteExpense = React.useCallback(() => {
        setIsDeleteOpenExpense(false);
    });
    const [idOperationExpense, setIdOperationExpense] = useState('');
    const handleIdOperationExpense = (e) => {
        setIdOperationExpense(e.target.value);
    };
    const handleDeleteExpense = async () => {
        const userID = await getUserID();
        try {
            await axios.delete(`http://45.147.177.32:8000/api/v1/finance/expense/delete/${idOperationExpense}?user_id=${userID}`);
        } catch (error) {
            console.error(error);
        }
        setIdOperationExpense('');
        closeDeleteExpense();
        console.log('Delete Notes', userID);
        console.log(`http://45.147.177.32:8000/api/v1/finance/expense/delete/${idOperationExpense}?user_id=${userID}`);
        await fetchDataAll();
    };
    //DeleteIncome
    const [isDeleteOpenIncome, setIsDeleteOpenIncome] = React.useState(false);
    const closeDeleteIncome = React.useCallback(() => {
        setIsDeleteOpenIncome(false);
    });
    const [idOperationIncome, setIdOperationIncome] = useState('');

    const handleIdOperationIncome = (e) => {
        setIdOperationIncome(e.target.value);
    };
    const handleDeleteIncome = async () => {
        const userID = await getUserID();
        try {
            await axios.delete(`http://45.147.177.32:8000/api/v1/finance/income/delete/${idOperationIncome}?user_id=${userID}`);
        } catch (error) {
            console.error(error);
        }
        setIdOperationIncome('');
        closeDeleteIncome();
        console.log('Delete Notes', userID);
        console.log(`http://45.147.177.32:8000/api/v1/finance/income/delete/${idOperationIncome}?user_id=${userID}`);
        await fetchDataAll();
    };


    const elementIds = ['button-0', 'button-1', 'button-2', 'button-3', 'button-4'];
    const [activeElementId, setActiveElementId] = useState(elementIds[0]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const currentIndex = elementIds.indexOf(activeElementId);
            switch(event.code) {
                case 'ArrowDown':
                    // вниз
                    if (currentIndex < elementIds.length - 1) {
                        setActiveElementId(elementIds[currentIndex + 1]);
                    }
                    break;
                case 'ArrowUp':
                    // вверх
                    if (currentIndex > 0) {
                        setActiveElementId(elementIds[currentIndex - 1]);
                    }
                    break;
                case 'Enter':
                    // ок
                    const activeElement = document.getElementById(activeElementId);
                    if (activeElement) {
                        activeElement.focus();
                        activeElement.click(); // если нужно имитировать клик
                        if (currentIndex < elementIds.length - 1) {
                            setActiveElementId(elementIds[currentIndex + 1]);
                        }
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [activeElementId, elementIds]);




    // document.addEventListener('keydown', (event) => {
    //         switch (event.code) {
    //             case 'ArrowDown':
    //                 // вниз
    //                 console.log("pupupu")
    //
    //                 break;
    //             case 'ArrowUp':
    //                 console.log("aaaa")
    //                 // вверх
    //
    //                 break;
    //
    //             case 'Enter':
    //                 // ок
    //
    //                 break;
    //         }
    //     }
    // )


    const Elements = ({}) => {
        useSpatnavInitialization();
        const [sectionProps] = useSection('Buttons');

        const ref = useRef(null);

        useEffect(() => {
            const focusable = ref.current;

            if (focusable) {
                focusable.focus();
            }
        }, []);
        return (
            <div {...sectionProps}>

                    <div className="buttons-bar" tabIndex={-1}>
                        <Button className="button-bar-button" size="l" pin="circle-circle"
                                text="Добавить расход" onClick={() => setIsExpenseOpen(true)}/>


                        <Button className="button-bar-button" size="l" pin="circle-circle"
                                text="Добавить доход" onClick={() => setIsIncomeOpen(true)}/>



                        <Button className="button-bar-button" size="l" pin="circle-circle"
                                text="Удалить расход" onClick={() => setIsDeleteOpenExpense(true)}/>



                        <Button className="button-bar-button" size="l" pin="circle-circle"
                                text="Удалить доход" onClick={() => setIsDeleteOpenIncome(true)}/>
                        <ToastForm/>
                    </div>
            </div>

        );

    }

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
            <div className="main-app">
                <ToastProvider>
                    <div className="my-header">
                        <MyHeader/>
                    </div>
                    <Elements></Elements>
                    <Modal className="scrollable-content-modal" isOpen={isExpenseOpen} onClose={closeExpense}>
                        <Headline3 mb={20}>Добавить расход</Headline3>
                        <ParagraphText1 mt={10} mb={10}>Название</ParagraphText1>
                        <TextField className="sn-section-item"
                                   id="button-0"
                                   required={true}
                                   placeholder="Объект"
                                   value={nameExpense}
                                   onChange={handleNameChangeExpense}
                                   tabIndex={activeElementId === 'button-1' ? 0 : -1}
                        />
                        <ParagraphText1 mt={10} mb={10}>Стоимость:</ParagraphText1>
                        <TextField className="sn-section-item"
                                   id="button-2"
                                   required={true}
                                   placeholder="Введите сумму"
                                   type='number'
                                   value={amountExpense}
                                   onChange={handleAmountChangeExpense}
                                   tabIndex={activeElementId === 'button-2' ? 0 : -1}
                        />
                        <ParagraphText1 mt={10} mb={10}>Дата покупки:</ParagraphText1>
                        <TextField id="button-3"
                                   required={true}
                                   type="date"
                                   value={dateInputExpense}
                                   onChange={handleDateChangeExpense}
                                   placeholder="день.месяц.год"
                                   tabIndex={activeElementId === 'button-3' ? 0 : -1}

                        />
                        <Button className="sn-section-item button-bar-modal" m={10}  id="button-4" tabIndex={activeElementId === 'button-4' ? 0 : -1}
                                stretch="true" text="Добавить"
                                onClick={handleSubmitExpense}
                        />
                    </Modal>
                    <Modal className="scrollable-content-modal" isOpen={isIncomeOpen} onClose={closeIncome}>
                        <Headline3 mb={20}>Добавить доход </Headline3>
                        <ParagraphText1 mt={10} mb={10}>Название:</ParagraphText1>
                        <TextField placeholder="Объект"
                                   required={true}
                                   value={nameIncome}
                                   onChange={handleNameChangeIncome}/>
                        <ParagraphText1 mt={10} mb={10}>Сумма:</ParagraphText1>
                        <TextField
                            required={true}
                            placeholder="Введите сумму"
                            type='number'
                            value={amountIncome}
                            onChange={handleAmountChangeIncome}
                        />
                        <ParagraphText1 mt={10} mb={10}>Дата зачисления:</ParagraphText1>
                        <TextField
                            required={true}
                            type="date"
                            value={dateInputIncome}
                            placeholder="день.месяц.год"
                            onChange={handleDateChangeIncome}
                        />
                        <Button stretch="true" text="Добавить" onClick={handleSubmitIncome}
                                className="button-bar-modal"/>
                    </Modal>
                    <Modal className="scrollable-content-modal" isOpen={isDeleteOpenExpense} onClose={closeDeleteExpense}>
                        <Headline3 mb={20}>Удалить расход</Headline3>
                        <ParagraphText1 mt={10} mb={10}>Введите id записи:</ParagraphText1>
                        <TextField
                            required={true}
                            placeholder="Id"
                            type='number'
                            value={idOperationExpense}
                            onChange={handleIdOperationExpense}
                        />
                        <Button className="button-bar-modal" stretch="true" text="Удалить" onClick={handleDeleteExpense}/>
                    </Modal>
                    <Modal className="scrollable-content-modal" isOpen={isDeleteOpenIncome} onClose={closeDeleteIncome}>
                        <Headline3 mb={20}>Удалить доход</Headline3>
                        <ParagraphText1 mt={10} mb={10}>Введите id записи:</ParagraphText1>
                        <TextField
                            required={true}
                            placeholder="Id"
                            type='number'
                            value={idOperationIncome}
                            onChange={handleIdOperationIncome}
                        />

                        <Button className="button-bar-modal" stretch="true" text="Удалить" onClick={handleDeleteIncome}/>
                    </Modal>

                    <div className="cards-row">
                        <Card className="cards-row-card" style={{maxHeight: '22.5rem'}}>
                            <Cell className="name-list" content={<TextBoxBigTitle>Расходы:</TextBoxBigTitle>}/>
                            <CardContent className="scrollable-content" compact>
                                {expenseTransactions.slice().reverse().map((transaction) => (
                                    <CellListItem
                                        key={transaction.transaction_id}
                                        content={
                                            <TextBox>
                                                <TextBoxTitle>{transaction.name}</TextBoxTitle>
                                                <div className="row-notes">
                                                    <TextBoxSubTitle>Id: {transaction.transaction_id}</TextBoxSubTitle>
                                                    <TextBoxSubTitle>Дата: {transaction.date}</TextBoxSubTitle>
                                                    <TextBoxSubTitle>Сумма: <Price currency="rub"
                                                                                   stroke={false}>{transaction.amount}</Price></TextBoxSubTitle>
                                                </div>
                                            </TextBox>
                                        }
                                    />
                                ))}
                            </CardContent>
                        </Card>
                        <Card className="cards-row-card" style={{maxHeight: '22.5rem'}}>
                            <Cell className="name-list" content={<TextBoxBigTitle>Доходы:</TextBoxBigTitle>}/>
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
                                                    <TextBoxSubTitle>Сумма: <Price currency="rub"
                                                                                   stroke={false}>{transaction.amount}</Price></TextBoxSubTitle>
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
                                    content={<TextBoxBiggerTitle><Price currency="rub"
                                                                        stroke={false}>{totalExpense}</Price></TextBoxBiggerTitle>}

                                    alignRight="center"
                                />
                            </CardContent>
                            <CardContent compact>
                                <Cell
                                    content={<TextBoxBigTitle>Общая сумма доходов: </TextBoxBigTitle>}
                                />
                                <Cell
                                    content={<TextBoxBiggerTitle><Price currency="rub"
                                                                        stroke={false}>{totalIncome}</Price></TextBoxBiggerTitle>}

                                    alignRight="center"
                                />
                            </CardContent>
                        </Card>
                    </div>

                </ToastProvider>
            </div>
        </div>
    );

}

