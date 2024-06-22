from fastapi import HTTPException, Response, status
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from src.db.utils import DBSession
from src.models.transactions import Transaction


async def get_all_transactions_crud(session: DBSession, user_id: int):
    stmt = select(Transaction).where(Transaction.user_id == user_id)
    res = await session.execute(stmt)
    transactions = res.scalars().all()

    return transactions
 

async def create_transaction_crud(session: DBSession, transaction_data, user_id: int) -> Transaction:
    new_transaction = Transaction(
        user_id=user_id,
        tag_id=transaction_data.tag_id,
        type=transaction_data.type,
        name=transaction_data.name,
        date=transaction_data.date,
        amount=transaction_data.amount
    )
    session.add(new_transaction)
    await session.flush()

    return new_transaction

# async def get_sellers_crud(session: DBSession):
#     query = select(Seller)
#     res = await session.execute(query)
#     sellers = res.scalars().all()
#     return {"sellers": sellers}


# async def delete_seller_crud(seller_id: int, session: DBSession):
#     deleted_seller = await session.get(Seller, seller_id)
#     if deleted_seller:
#         await session.delete(deleted_seller)
#         return Response(status_code=status.HTTP_204_NO_CONTENT)
#     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seller not found")


# async def update_seller_crud(seller_id: int, new_data: SellerOut, session: DBSession):
#     if updated_seller := await session.get(Seller, seller_id):
#         updated_seller.first_name = new_data.first_name
#         updated_seller.last_name = new_data.last_name
#         updated_seller.email = new_data.email

#         await session.flush()

#         return updated_seller
#     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seller not found")


# async def get_seller_by_id(session: DBSession, seller_id: int):
#     stmt = select(Seller).where(Seller.id == seller_id)
#     res = await session.execute(stmt)
#     seller = res.scalar_one_or_none()

#     return seller


# async def get_seller_crud(seller_id: int, session: DBSession):
#     query = select(Seller).options(selectinload(Seller.books)).where(Seller.id == seller_id)
#     res = await session.execute(query)
#     seller = res.scalars().first()
#     if seller:
#         return seller
#     else:
#         return Response(status_code=status.HTTP_404_NOT_FOUND)
