import { DashboardLayout } from "@/components/layout/dashboard-layout";
import formatRupiah from "@/helper/formatRupiah";
import { useEffect, useState } from "react";
import { Wallet } from "../api/wallet";
import { api } from "@/config/api";
import { Api } from "@/models/response";
import { LoadingPage } from "@/components/material/loading-page";
import { cn } from "@/lib/utils";
import { $Enums } from "@prisma/client";
import { makeToast } from "@/helper/makeToast";
import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { MdTransferWithinAStation } from "react-icons/md";
import { Label } from "@/components/ui/label";

const WalletPage = () => {
  const { data, fetchData } = useWallet();
  const { form, onChange, onClose, onSubmit, open, setOpen, WALLETS } =
    useTransfer(data?.report, fetchData);

  return (
    <DashboardLayout
      title="Wallet"
      childrenHeader={
        <Dialog.Root
          size="sm"
          placement="center"
          motionPreset="slide-in-bottom"
          lazyMount
          open={open}
          onOpenChange={(e) => setOpen(e.open)}
          onExitComplete={onClose}
        >
          <Dialog.Trigger asChild>
            <Button className="bg-teal-500 px-2 text-white">
              <MdTransferWithinAStation /> Transfer
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title className="font-semibold">
                    Transfer to wallet
                  </Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Dialog.Header>
                <Dialog.Body>
                  <form
                    className="flex flex-col gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      onSubmit();
                    }}
                  >
                    <Label className="mt-2 font-medium">From</Label>
                    <select
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                      value={form.from}
                      onChange={(e) => onChange(e, "from")}
                    >
                      <option value="">Select wallet</option>
                      {WALLETS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <Label className="mt-2 font-medium">To</Label>
                    <select
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                      value={form.to}
                      onChange={(e) => onChange(e, "to")}
                    >
                      <option value="">Select receipient</option>
                      {WALLETS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>

                    <Label className="mt-2 font-medium">Amount</Label>
                    <input
                      value={form.amount}
                      onChange={(e) => onChange(e, "amount")}
                      placeholder="170000"
                      type="number"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                    />

                    <Label className="mt-2 font-medium">Note</Label>
                    <textarea
                      value={form.note}
                      onChange={(e) => onChange(e, "note")}
                      placeholder="200"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                    />

                    <Button
                      type="submit"
                      className="bg-teal-500 font-semibold text-white mt-4"
                    >
                      Save
                    </Button>
                  </form>
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      }
    >
      {data ? (
        <div className="w-full flex flex-row flex-wrap justify-between space-y-4">
          <GridFinance
            title="Total Balance"
            balance={data?.report.all.total}
            minus={data?.report?.all?.minus}
            plus={data?.report?.all?.plus}
            className="w-full"
          />
          <GridFinance
            title="Product Report"
            balance={data?.report?.order?.total}
            minus={data?.report?.order?.minus}
            plus={data?.report?.order?.plus}
            className="w-full md:w-[48%] lg:w-[24%]"
          />
          <GridFinance
            title="Operational Report"
            balance={data?.report?.operational?.total}
            minus={data?.report?.operational?.minus}
            plus={data?.report?.operational?.plus}
            className="w-full md:w-[48%] lg:w-[24%]"
          />
          <GridFinance
            title="Capital Report"
            balance={data?.report?.capital?.total}
            minus={data?.report?.capital?.minus}
            plus={data?.report?.capital?.plus}
            className="w-full md:w-[48%] lg:w-[24%]"
          />
          <GridFinance
            title="Finance Report"
            balance={data?.report?.finance?.total}
            minus={data?.report?.finance?.minus}
            plus={data?.report?.finance?.plus}
            className="w-full md:w-[48%] lg:w-[24%]"
          />
        </div>
      ) : (
        <LoadingPage />
      )}
    </DashboardLayout>
  );
};

const useWallet = () => {
  const [data, setData] = useState<Wallet>();

  const fetchData = async () => {
    const res = await api.get<Api<Wallet>>("/wallet");
    setData(res.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, fetchData };
};

interface FinanceProps {
  balance: number;
  plus: number;
  minus: number;
  title: string;
  className?: string;
}

const GridFinance: React.FC<FinanceProps> = ({
  minus,
  plus,
  balance,
  title,
  className,
}) => {
  return (
    <div
      className={cn(
        "w-fit h-60 bg-white rounded-lg border border-gray-300 flex flex-col px-4 py-2 gap-2 overflow-hidden",
        className
      )}
    >
      <h4 className="text-md text-neutral-700">{title}</h4>
      <div>
        <p className="text-sm text-neutral-600 font-normal">Balance</p>
        <p className="text-3xl text-neutral-800 font-semibold">
          {formatRupiah(balance)}{" "}
        </p>
      </div>
      <div>
        <p className="text-sm text-neutral-600 font-normal">To Be Received</p>
        <p className="text-xl font-semibold text-green-500">
          {formatRupiah(plus)}{" "}
        </p>
      </div>
      <div>
        <p className="text-sm text-neutral-600 font-normal">To Be Paid</p>
        <p className="text-xl text-red-500 font-semibold">
          {formatRupiah(minus)}
        </p>
      </div>
    </div>
  );
};
export default WalletPage;

interface Transfer {
  amount: number;
  from: $Enums.TransactionCategoryType;
  to: $Enums.TransactionCategoryType;
  note: string;
}

const initTransfer: Transfer = {
  amount: 0,
  from: $Enums.TransactionCategoryType.Product,
  to: $Enums.TransactionCategoryType.Finance,
  note: "",
};

const useTransfer = (
  wallet?: Wallet["report"],
  refetch?: () => Promise<void>
) => {
  const [form, setForm] = useState<Transfer>(initTransfer);
  const [open, setOpen] = useState<boolean>(false);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    key: keyof Transfer
  ) => {
    setForm({ ...form, [key]: e.target.value });
  };

  const onClose = () => {
    setForm(initTransfer);
    setOpen(false);
  };

  const onSubmit = async () => {
    try {
      makeToast("info");
      const res = await api.post<Api>("/transfer", form);
      await refetch?.();
      onClose();
      makeToast("success", res?.data?.message);
    } catch (error) {
      makeToast("error", error);
    }
  };

  const WALLETS = Object.values($Enums.TransactionCategoryType).map((item) => {
    let total = 0;

    switch (item) {
      case "Product":
        total = wallet?.order.total || 0;
        break;
      case "Operational":
        total = wallet?.operational.total || 0;
        break;
      case "Capital":
        total = wallet?.capital.total || 0;
        break;
      case "Finance":
        total = wallet?.finance.total || 0;
        break;
    }
    return {
      value: item,
      label: `${item} (${formatRupiah(total)})`,
    };
  });

  return { form, open, setOpen, onChange, onClose, onSubmit, WALLETS };
};
