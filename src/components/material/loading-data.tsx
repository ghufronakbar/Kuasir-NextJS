import { FC } from "react";

interface Props {
  loading: boolean;
}
export const LoadingData: FC<Props> = ({ loading }) => {
  if (!loading) {
    return null;
  }
  return (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 bottom-10 right-10 fixed z-50 pointer-events-none"></div>
  );
};
