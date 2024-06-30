function addExpense(name, tag_id, date, amount, context){
    addAction({
        type: "add_expense",
        tag_id: tag_id,
        name: name,
        date: date,
        amount: amount
    }, context);
}

function addIncome(name, tag_id, date, amount, context){
    addAction({
        type: "add_income",
        tag_id: tag_id,
        name: name,
        date: date,
        amount: amount
    }, context);
}

function deleteExpense(transaction_id, context){
    addAction({
        type: "delete_expense",   
        transaction_id: transaction_id
    }, context);
}

function deleteIncome(transaction_id, context){
    addAction({
        type: "delete_income",   
        transaction_id: transaction_id
    }, context);
}

function initializeUser(user_id, characterID, context){
    addAction({
        type: "initialize_user",
        characterID: characterID,
        user_id: user_id
    }, context);
}