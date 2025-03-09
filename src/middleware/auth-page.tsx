// import { makeToast } from "@/helper/makeToast";
// import { makeToast } from "@/helper/makeToast";
import { useAuth } from "@/hooks/useAuth";
import { $Enums } from "@prisma/client";

export const AuthPage = (
  WrappedComponent: React.ComponentType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  roles: $Enums.Role[]
) => {
  const WithAuthComponent = (props: Record<string, unknown>) => {
    const { loading } = useAuth();

    if (loading) {
      return (
        <div className="flex h-screen w-screens items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    // else if (
    //   !roles.includes(decoded?.role || ("" as $Enums.Role)) &&
    //   !loading
    // ) {
    //   console.log("decoded?.role", decoded?.role, roles);
    //   signOut();
    //   makeToast("error", "You are not authorized to access this page!");
    //   return (
    //     <div className="flex h-screen w-screens items-center justify-center">
    //       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
    //     </div>
    //   );
    // }

    return (
      <>
        <WrappedComponent {...props} />
      </>
    );
  };

  return WithAuthComponent;
};
