import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const businessId = (req.query.businessId as string) || "";
  const isAll = req.query.businessId === "-";
  const products = await db.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      productCategory: true,
    },
    where: {
      AND: [
        { businessId: isAll ? undefined : businessId },
        { isDeleted: false },
      ],
    },
  });

  return res.status(200).json({ message: "OK", data: products });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { decoded, body } = req;
    const { name, price, description, image, productCategory, businessId } =
      body;
    if (
      !name ||
      typeof name !== "string" ||
      !price ||
      isNaN(Number(price)) ||
      !productCategory ||
      typeof productCategory !== "string" ||
      !businessId
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const checkProductCategory = await db.productCategory.findFirst({
      where: {
        name: productCategory,
      },
    });

    const checkBusiness = await db.business.findUnique({
      where: {
        id: businessId,
      },
    });
    if (!checkBusiness) {
      return res.status(400).json({ message: "Business not found" });
    }

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

    const product = await db.product.create({
      data: {
        name,
        price: Number(price),
        description: description || null,
        image: image || null,
        productCategoryId: productCategoryId || "",
        businessId,
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
        type: "CREATE",
        description: `${user?.name} create product ${product.name}`,
        detail: product,
      },
    });

    return res
      .status(200)
      .json({ message: "Successfull create product", data: product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    return AuthApi(GET, ["OWNER", "CASHIER", "MANAGER_OPERATIONAL"])(req, res);
  }

  if (req.method === "POST") {
    return AuthApi(POST, ["OWNER"])(req, res);
  }
};

export default handler;
