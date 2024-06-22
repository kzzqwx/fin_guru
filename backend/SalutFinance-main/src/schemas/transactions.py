from datetime import date
from typing import Optional, List

from pydantic import BaseModel, Field, field_validator
from pydantic_core import PydanticCustomError

__all__ = ["IncomeForm", "ExpenseForm", "Expense", "ExpenseList", "Income", "IncomeList", "Transaction", "TransactionList", "TransactionGroup"]


class IncomeForm(BaseModel):
    tag_id: int
    name: str
    date: date
    amount: float


class ExpenseForm(BaseModel):
    tag_id: int
    name: str
    date: date
    amount: float


class Expense(BaseModel):
    tag_id: int
    name: str
    date: date
    amount: float


class ExpenseList(BaseModel):
    expenses: list[Expense]


class Income(BaseModel):
    tag_id: int
    name: str
    date: date
    amount: float

class IncomeList(BaseModel):
    incomes: list[Income]


class Transaction(BaseModel):
    tag_id: int
    name: str
    type: str  # 'income' or 'expense'
    date: date
    amount: float

    class Config:
        from_attributes = True


class TransactionGroup(BaseModel):
    income: List[Transaction]
    expense: List[Transaction]


class TransactionList(BaseModel):
    transactions: TransactionGroup

    class Config:
        from_attributes = True
