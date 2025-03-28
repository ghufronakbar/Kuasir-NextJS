import type { NextApiRequest } from "next";
import { db } from "@/config/db";
import { $Enums, OrderItem, Prisma } from "@prisma/client";
import formatRupiah from "@/helper/formatRupiah";

export const saveToLog = async (
  req: NextApiRequest,
  model: Prisma.ModelName,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonValue: any
) => {
  const { decoded, method } = req;
  let type: $Enums.LogType = $Enums.LogType.CREATE;

  switch (method) {
    case "POST":
      type = $Enums.LogType.CREATE;
      break;
    case "PUT":
      type = $Enums.LogType.UPDATE;
      break;
    case "DELETE":
      type = $Enums.LogType.DELETE;
      break;
  }

  const user = await db.user.findUnique({
    where: {
      id: decoded?.id || "",
    },
    select: {
      name: true,
      role: true,
      id: true,
    },
  });

  let description = "";

  switch (model) {
    case "User":
      description = `${jsonValue?.name}`;
      break;
    case "Stock":
      description = `${jsonValue?.name} - ${jsonValue?.unit}`;
      break;
    case "ProductCategory":
      description = `${jsonValue?.name}`;
      break;
    case "Product":
      description = `${jsonValue?.name} (${jsonValue?.productCategory.name}) - ${jsonValue?.price} for business ${jsonValue?.business?.name}`;
      break;
    case "Defect":
      description = `${jsonValue?.stock} (${jsonValue?.amount})`;
      break;
    case "Recipe":
      description = `${jsonValue?.product.name} with ${jsonValue?.stock.name} (${jsonValue?.amount})`;
      break;
    case "Order":
      description = `${jsonValue?.business.name} - ${
        jsonValue?.merchant
      } with ${jsonValue?.method} - ${jsonValue?.orderItems
        .map((item: OrderItem) => `${item.name} (${formatRupiah(item.amount)})`)
        .join(", ")} with total ${formatRupiah(jsonValue?.total)}`;
      break;
    case "OrderItem":
      description = `${jsonValue?.name}`;
      break;
    case "ParentBusiness":
      description = `${jsonValue?.name}`;
      break;
    case "Business":
      description = `${jsonValue?.name} (${jsonValue?.parentBusiness.name})`;
      break;
    case "Outcome":
      description = `${jsonValue?.stock?.name} (${jsonValue?.amount} ${
        jsonValue?.stock?.unit
      }) (${jsonValue?.category}) with ${
        jsonValue?.method
      }, price ${formatRupiah(jsonValue?.price)} with admin fee ${formatRupiah(
        jsonValue?.adminFee
      )}`;
      break;
    case "Transaction":
      description = `${jsonValue?.business?.name} (${
        jsonValue?.business?.parentBusiness?.name
      }) - ${jsonValue?.title} (${
        jsonValue?.category
      }) with amount ${formatRupiah(jsonValue?.amount)}`;
      break;
    case "LogActivity":
      description = `${jsonValue?.description}`;
      break;
  }

  await db.logActivity.create({
    data: {
      referenceId: jsonValue?.id || "",
      type: type,
      userId: user?.id || "",
      referenceModel: model,
      description: `${user?.name} (${
        user?.role
      }) ${type.toLowerCase()} ${model} for ${description}`,
      detail: jsonValue || {},
    },
  });
};
