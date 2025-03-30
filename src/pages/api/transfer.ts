import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { $Enums, Transaction } from "@prisma/client";
import formatRupiah from "@/helper/formatRupiah";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { amount, to, from, note } = req.body;
    if (!amount || !to || !from) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (isNaN(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (
      $Enums.TransactionCategoryType[
        to as keyof typeof $Enums.TransactionCategoryType
      ] === undefined
    ) {
      return res.status(400).json({ message: "Invalid to" });
    }

    if (
      $Enums.TransactionCategoryType[
        from as keyof typeof $Enums.TransactionCategoryType
      ] === undefined
    ) {
      return res.status(400).json({ message: "Invalid from" });
    }

    if (from === to) {
      return res.status(400).json({ message: "Sender and receiver are same" });
    }

    let transactions: Transaction[] = [];
    let transfers: { amount: number }[] = [];

    if (from === "Product") {
      transactions = await db.transaction.findMany({
        where: {
          AND: [
            {
              isDeleted: false,
            },
            {
              category: "Product",
            },
          ],
        },
      });
      transfers = await db.transaction.findMany({
        where: {
          AND: [
            {
              isDeleted: false,
            },
            {
              sender: "Product",
            },
          ],
        },
        select: {
          amount: true,
        },
      });
    } else if (from === "Capital") {
      transactions = await db.transaction.findMany({
        where: {
          AND: [
            {
              isDeleted: false,
            },
            {
              category: "Capital",
            },
          ],
        },
      });
      transfers = await db.transaction.findMany({
        where: {
          AND: [
            {
              isDeleted: false,
            },
            {
              sender: "Capital",
            },
          ],
        },
        select: {
          amount: true,
        },
      });
    } else if (from === "Finance") {
      transactions = await db.transaction.findMany({
        where: {
          AND: [
            {
              isDeleted: false,
            },
            {
              category: "Finance",
            },
          ],
        },
      });
      await db.transaction.findMany({
        where: {
          AND: [
            {
              isDeleted: false,
            },
            {
              sender: "Finance",
            },
          ],
        },
        select: {
          amount: true,
        },
      });
    } else if (from === "Operational") {
      transactions = await db.transaction.findMany({
        where: {
          AND: [
            {
              isDeleted: false,
            },
            {
              category: "Operational",
            },
          ],
        },
      });
      await db.transaction.findMany({
        where: {
          AND: [
            {
              isDeleted: false,
            },
            {
              sender: "Operational",
            },
          ],
        },
        select: {
          amount: true,
        },
      });
    }

    let MAX_TRANSFER = 0;
    for (const transaction of transactions) {
      if (transaction.transaction === "Expense") {
        MAX_TRANSFER -= transaction.amount;
      } else {
        MAX_TRANSFER += transaction.amount;
      }
    }

    for (const transfer of transfers) {
      MAX_TRANSFER -= transfer.amount;
    }

    if (MAX_TRANSFER < Number(amount)) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const transaction = await db.transaction.create({
      data: {
        amount: Number(amount),
        category: to,
        subCategory: "Transaction",
        transaction: "Income",
        sender: from,
        description: `Transfer ${from} to ${to} ${formatRupiah(amount)}`,
        note,
      },
    });

    return res
      .status(200)
      .json({ message: "Successfull create transaction", data: transaction });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default AuthApi(handler, ["OWNER"]);
