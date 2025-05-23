import { FC } from "react";
import { SidebarApp } from "../material/sidebar-app";
import { SyncButton } from "../material/sync-button";

interface Props {
  title?: string;
  childrenHeader?: React.ReactNode;
  children?: React.ReactNode;
  belowHeader?: React.ReactNode;
}
export const DashboardLayout: FC<Props> = ({
  title,
  childrenHeader,
  children,
  belowHeader,
}) => {
  return (
    <SidebarApp>
      <div className="px-6 md:p-10 rounded-tl-2xl border border-neutral-200 bg-gray-50 flex flex-col gap-2 flex-1 w-full h-full overflow-auto py-4 md:py-8 lg:py-12 min-h-screen relative">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2 items-start">
            <h2 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl tracking-tight font-medium text-black ">
              {title}
            </h2>
            <div>{belowHeader}</div>
          </div>
          {childrenHeader}
        </div>
        <div className="flex flex-col gap-2 flex-1 mt-4">{children}</div>
      </div>
      <SyncButton />
    </SidebarApp>
  );
};
