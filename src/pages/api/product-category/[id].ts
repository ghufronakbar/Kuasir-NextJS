import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const productCategory = await db.productCategory.findUnique({
    include: {
      products: true,
    },
    where: {
      id,
    },
  });

  if (!productCategory)
    return res.status(404).json({ message: "Product category not found" });
  if (productCategory.isDeleted)
    return res.status(404).json({ message: "Product category not found" });

  return res.status(200).json({ message: "OK", data: productCategory });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const id = (req.query.id as string) || "";
    const { decoded, body } = req;
    const { name } = body;
    if (!name || typeof name !== "string")
      return res.status(400).json({ message: "All fields are required" });

    const check = await db.productCategory.findUnique({
      where: {
        id,
      },
    });

    if (!check)
      return res.status(400).json({ message: "Product category not found" });

    const category = await db.productCategory.update({
      data: {
        name,
      },
      where: {
        id,
      },
    });

    const user = await db.user.findUnique({
      where: {
        id: decoded?.id || "",
      },
    });

    const checkName = await db.productCategory.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (checkName && checkName.id !== id) {
      return res
        .status(400)
        .json({ message: "Product category name already exist" });
    }

    await db.logActivity.create({
      data: {
        referenceId: category.id,
        referenceModel: "ProductCategory",
        userId: decoded?.id || "",
        type: "UPDATE",
        description: `${user?.name} edit product category ${check.name} to ${category.name}`,
        detail: category,
        before: check,
      },
    });

    return res
      .status(200)
      .json({ message: "Successfull edit product", data: category });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { decoded } = req;
    const id = (req.query.id as string) || "";
    const check = await db.productCategory.findUnique({
      where: {
        id,
      },
    });
    const user = await db.user.findUnique({
      where: {
        id: decoded?.id || "",
      },
    });

    if (!check || !user)
      return res.status(400).json({ message: "Product category not found" });

    const category = await db.productCategory.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    await db.logActivity.create({
      data: {
        referenceId: category.id,
        referenceModel: "ProductCategory",
        userId: decoded?.id || "",
        type: "DELETE",
        description: `${user?.name} delete product category ${check.name}`,
        detail: category,
      },
    });

    return res
      .status(200)
      .json({ message: "Successfull delete product", data: category });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    return AuthApi(GET, ["OWNER", "CASHIER", "MANAGER_OPERATIONAL"])(req, res);
  }

  if (req.method === "PUT") {
    return AuthApi(PUT, ["OWNER"])(req, res);
  }

  if (req.method === "DELETE") {
    return AuthApi(DELETE, ["OWNER"])(req, res);
  }
};

export default handler;
