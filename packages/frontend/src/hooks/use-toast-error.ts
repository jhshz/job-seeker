import { toaster } from "@/components/ui/toaster";
import { getApiErrorMessage } from "@/api/axios";

export function useToastError() {
  return (error: unknown) => {
    toaster.create({
      title: "خطا",
      description: getApiErrorMessage(error),
      type: "error",
    });
  };
}
