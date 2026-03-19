import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg text-sm font-medium",
          success:
            "border-emerald-200 bg-emerald-50 text-emerald-800 [&>[data-icon]]:text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 dark:[&>[data-icon]]:text-emerald-400",
          error:
            "border-red-200 bg-red-50 text-red-800 [&>[data-icon]]:text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-200 dark:[&>[data-icon]]:text-red-400",
          info:
            "border-blue-200 bg-blue-50 text-blue-800 [&>[data-icon]]:text-blue-600 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200 dark:[&>[data-icon]]:text-blue-400",
          warning:
            "border-amber-200 bg-amber-50 text-amber-800 [&>[data-icon]]:text-amber-600 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 dark:[&>[data-icon]]:text-amber-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
