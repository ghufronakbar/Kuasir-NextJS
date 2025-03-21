import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const business = await db.business.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      orders: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          orderItems: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
      parentBusiness: true,
    },
    where: {
      isDeleted: false,
    },
  });

  const data: typeof business = [
    ...business,
    {
      name: "All",
      id: "-",
      createdAt: new Date(),
      parentBusinessId: "-",
      parentBusiness: {
        name: "All",
        id: "-",
        createdAt: new Date(),
        isDeleted: false,
        updatedAt: new Date(),
      },
      isDeleted: false,
      updatedAt: new Date(),
      orders: [],
    },
  ];

  return res.status(200).json({ message: "OK", data: data });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { decoded, body } = req;
    const { name, parentBusiness } = body;
    if (
      !name ||
      typeof name !== "string" ||
      !parentBusiness ||
      typeof parentBusiness !== "string"
    )
      return res.status(400).json({ message: "All fields are required" });
    const checkName = await db.business.findFirst({
      where: {
        AND: [
          {
            name: {
              equals: name,
              mode: "insensitive",
            },
          },
          {
            isDeleted: false,
          },
        ],
      },
      select: {
        name: true,
      },
    });

    if (checkName)
      return res.status(400).json({ message: "Business name already exist" });

    const checkParentBusiness = await db.parentBusiness.findFirst({
      where: {
        name: parentBusiness,
      },
    });

    let parentBusinessId = checkParentBusiness?.id;

    if (!checkParentBusiness) {
      const pb = await db.parentBusiness.create({
        data: {
          name: parentBusiness,
        },
      });
      parentBusinessId = pb.id;
    } else if (checkParentBusiness.isDeleted) {
      const pb = await db.parentBusiness.update({
        where: {
          id: checkParentBusiness.id,
        },
        data: {
          isDeleted: false,
        },
      });
      parentBusinessId = pb.id;
    }

    const business = await db.business.create({
      data: {
        name,
        parentBusinessId: parentBusinessId || "",
      },
    });

    const user = await db.user.findUnique({
      where: {
        id: decoded?.id || "",
      },
    });

    await db.logActivity.create({
      data: {
        referenceId: business.id,
        referenceModel: "Business",
        userId: decoded?.id || "",
        type: "CREATE",
        description: `${user?.name} create business ${business.name}`,
        detail: business,
      },
    });

    return res
      .status(200)
      .json({ message: "Successfull create business", data: business });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    return AuthApi(GET, ["OWNER", "MANAGER_OPERATIONAL", "CASHIER"])(req, res);
  }

  if (req.method === "POST") {
    return AuthApi(POST, ["OWNER"])(req, res);
  }
};

export default handler;
