import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { api } from "@/config/api";
import formatDate from "@/helper/formatDate";
import { AuthPage } from "@/middleware/auth-page";
import { Api } from "@/models/response";
import { JSX, useEffect, useState } from "react";
import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { MdCreate } from "react-icons/md";
import { DetailLogActivity } from "@/models/schema";
import { convertToReadableString } from "@/helper/formatString";
import { useAuth } from "@/hooks/useAuth";

const THEAD = [
  "No",
  "Data",
  "User",
  "Action",
  "Model",
  "Description",
  "Time",
  "",
];

interface JSONValue {
  [key: string]: unknown;
}

const renderJson = (data: JSONValue): JSX.Element[] => {
  return Object.entries(data).map(([key, value]) => {
    if (typeof value === "object" && value !== null) {
      return (
        <div key={key} className="py-4">
          <strong>{convertToReadableString(key)}:</strong>
          <div style={{ marginLeft: "20px" }}>
            {Array.isArray(value)
              ? value.map((item, index) => (
                  <div key={index}>{renderJson(item)}</div>
                ))
              : renderJson(value as JSONValue)}
          </div>
        </div>
      );
    }
    return (
      <div key={key} className="flex">
        <strong>{convertToReadableString(key)}:</strong> {JSON.stringify(value)}
      </div>
    );
  });
};

const JsonViewer = ({ data }: { data: JSONValue }) => {
  return <div>{renderJson(data)}</div>;
};

const LogActivityScreen = () => {
  const { data, Loading, open, setOpen, onClickDetail, onClose, selected } =
    useLog();
  const { decoded } = useAuth();
  const isAdmin = decoded?.role === "OWNER";
  return (
    <DashboardLayout
      title="Log Activity"
      childrenHeader={
        <Dialog.Root
          size="lg"
          placement="center"
          motionPreset="slide-in-bottom"
          lazyMount
          open={open}
          onOpenChange={(e) => setOpen(e.open)}
          onExitComplete={onClose}
        >
          <Dialog.Trigger asChild>
            <Button className="bg-teal-500 px-2 text-white hidden">
              <MdCreate /> Create New
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title className="font-semibold">
                    Detail Log
                  </Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Dialog.Header>
                <Dialog.Body>
                  <div className="flex flex-col gap-2 overflow-x-auto overflow-auto">
                    {selected?.before && (
                      <>
                        <h4 className="font-semibold text-lg">Before</h4>
                        <JsonViewer
                          data={(selected?.before as JSONValue) || {}}
                        />
                      </>
                    )}
                    <h4 className="font-semibold text-lg">Detail</h4>
                    {selected?.detail && (
                      <JsonViewer data={selected.detail as JSONValue} />
                    )}
                  </div>
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      }
    >
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              {THEAD.map((item, index) => (
                <th key={index} scope="col" className="px-6 py-3">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr className="bg-white border-b  border-gray-200" key={index}>
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  {index + 1}
                </th>
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  {item.referenceModel}
                </th>
                <td className="px-6 py-4">{`${item.user.name} ${
                  isAdmin ? "(" + item.user.role + ")" : ""
                }`}</td>
                <td className="px-6 py-4">{item.type}</td>
                <td className="px-6 py-4">{item.referenceModel}</td>
                <td className="px-6 py-4">{item.description}</td>
                <td className="px-6 py-4">
                  {formatDate(item.createdAt, true, true)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-row gap-2 font-medium">
                    <Button
                      className="bg-slate-500 text-white px-2"
                      onClick={() => onClickDetail(item)}
                    >
                      Detail
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Loading />
    </DashboardLayout>
  );
};

export default AuthPage(LogActivityScreen, ["OWNER"]);

const useLog = () => {
  const [data, setData] = useState<DetailLogActivity[]>([]);
  const [selected, setSelected] = useState<DetailLogActivity>();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const response = await api.get<Api<DetailLogActivity[]>>("/log");
    setData(response.data.data);
    setLoading(false);
  };

  const onClickDetail = (item: DetailLogActivity) => {
    setOpen(true);
    setSelected(item);
  };

  const onClose = () => {
    setSelected(undefined);
    setOpen(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const Loading = () => {
    if (!loading) {
      return null;
    }
    return (
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 bottom-10 right-10 fixed z-50 pointer-events-none"></div>
    );
  };

  return {
    data,
    Loading,
    open,
    setOpen,
    onClickDetail,
    onClose,
    selected,
  };
};
