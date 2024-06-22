import json
from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.configurations.database import get_async_session
from src.schemas import TransactionList, Transaction, IncomeForm, ExpenseForm
from src.db.crud.transactions import get_all_transactions_crud, create_transaction_crud


transactions_router = APIRouter(tags=["Transactions"], prefix="/finance")

# Больше не симулируем хранилище данных. Подключаемся к реальному, через сессию.
DBSession = Annotated[AsyncSession, Depends(get_async_session)]


# Ручка, возвращающая все транзакции
@transactions_router.get("/", response_model=TransactionList, status_code=status.HTTP_201_CREATED)
async def get_all_transactions(session: DBSession, user_id: int):
    transactions = await get_all_transactions_crud(session, user_id)
    income_transactions = [transaction for transaction in transactions if transaction.type == 'income']
    expense_transactions = [transaction for transaction in transactions if transaction.type == 'expense']
    grouped_transactions = {
        "income": income_transactions,
        "expense": expense_transactions
    }
    return {"transactions": grouped_transactions}


@transactions_router.post("/income", response_model=Transaction, status_code=status.HTTP_201_CREATED)
async def add_income(income: IncomeForm, session: DBSession, user_id: int):
    transaction_data = Transaction(
        tag_id=income.tag_id,
        type="income",
        name=income.name,
        date=income.date,
        amount=income.amount
    )
    new_transaction = await create_transaction_crud(session, transaction_data, user_id)
    return new_transaction

@transactions_router.post("/expense", response_model=Transaction, status_code=status.HTTP_201_CREATED)
async def add_expense(expense: ExpenseForm, session: DBSession, user_id: int):
    transaction_data = Transaction(
        tag_id=expense.tag_id,
        type="expense",
        name=expense.name,
        date=expense.date,
        amount=expense.amount
    )
    new_transaction = await create_transaction_crud(session, transaction_data, user_id)
    return new_transaction


# # Ручка для обновления данных о книге
# @books_router.put("/{book_id}", status_code=status.HTTP_200_OK, response_model=ReturnedBook)
# async def update_book(book_id: int, new_data: UpdateBook, session: DBSession, current_seller: SellerOut = Depends(get_current_seller)):
#     if updated_book := await session.get(Book, book_id):
#         updated_book.author = new_data.author
#         updated_book.title = new_data.title
#         updated_book.year = new_data.year
#         updated_book.count_pages = new_data.count_pages
#         updated_book.seller_id = new_data.seller_id

#         await session.flush()

#         return updated_book

#     return Response(status_code=status.HTTP_404_NOT_FOUND)
