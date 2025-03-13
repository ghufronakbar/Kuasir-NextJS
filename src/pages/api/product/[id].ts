import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const product = await db.product.findUnique({
    include: {
      productCategory: true,
      recipes: {
        include: {
          stock: true,
        },
        where: {
          isDeleted: false,
        },
      },
    },
    where: {
      id,
    },
  });

  if (!product) return res.status(404).json({ message: "Product not found" });
  if (product.isDeleted)
    return res.status(404).json({ message: "Product not found" });

  return res.status(200).json({ message: "OK", data: product });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const id = (req.query.id as string) || "";
    const { decoded, body } = req;
    const { name, price, description, image, productCategory } = body;
    if (
      !name ||
      typeof name !== "string" ||
      !price ||
      isNaN(Number(price)) ||
      !productCategory ||
      typeof productCategory !== "string"
    )
      return res.status(400).json({ message: "All fields are required" });

    const checkProductCategory = await db.productCategory.findFirst({
      where: {
        name: productCategory,
      },
    });

    let productCategoryId = checkProductCategory?.id;
    if (!checkProductCategory) {
      const pc = await db.productCategory.create({
        data: {
          name: productCategory,
        },
      });
      productCategoryId = pc.id;
    } else if (checkProductCategory && checkProductCategory.isDeleted) {
      const pc = await db.productCategory.update({
        where: {
          id: checkProductCategory.id,
        },
        data: {
          isDeleted: false,
        },
      });
      productCategoryId = pc.id;
    }

    const checkId = await db.product.findUnique({
      where: {
        id,
      },
    });

    if (!checkId) {
      return res.status(400).json({ message: "Product not found" });
    }

    const product = await db.product.update({
      where: {
        id,
      },
      data: {
        name,
        price: Number(price),
        description: description || null,
        image: image || checkId.image,
        productCategoryId,
      },
    });

    const user = await db.user.findUnique({
      where: {
        id: decoded?.id || "",
      },
    });

    await db.logActivity.create({
      data: {
        referenceId: product.id,
        referenceModel: "Product",
        userId: decoded?.id || "",
        type: "UPDATE",
        description: `${user?.name} edit product ${checkId.name} to ${product.name}`,
        detail: product,
        before: checkId,
      },
    });

    return res
      .status(200)
      .json({ message: "Successfull edit product", data: product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const id = (req.query.id as string) || "";
    const product = await db.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    const updatedProduct = await db.product.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    const user = await db.user.findUnique({
      where: {
        id: req.decoded?.id || "",
      },
    });

    await db.logActivity.create({
      data: {
        referenceId: product.id,
        referenceModel: "Product",
        userId: req.decoded?.id || "",
        type: "DELETE",
        description: `${user?.name} delete product ${product.name}`,
        detail: updatedProduct,
      },
    });

    return res
      .status(200)
      .json({ message: "Successfull delete product", data: updatedProduct });
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
