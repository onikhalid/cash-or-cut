/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./label"
import { cva, VariantProps } from "class-variance-authority"
import { Eye, EyeOff } from "lucide-react"
import FormError from "./form-error"


export const inputVariants = cva(
  "!appearance-none flex items-center h-[2.75rem] 2xl:h-[3rem] rounded-md text-[13px] w-full px-3.5 py-1.5 border-2 border-transparent outline-none focus:outline-none",
  {
    variants: {
      variant: {
        default: cn(
          "bg-transparent h-[2.875rem] py-[0.8125rem] px-4 text-sm outline-none border-[2px] border-[#340271]",
          "focus:border-purple-600 placeholder:text-white/60 transition-all",
          "file:bg-transparent file:text-sm ",
        ),
        transparent:
          "bg-white/20 text-white backdrop-blur-sm focus:border-white focus-within:border-white placeholder:text-white/60 transparent-form",
        light: "bg-[#EAE6FF] text-primary hover:border-primary",
        white: "bg-white text-primary hover:bg-primary-darker hover:text-white",
         unstyled: "",
      },
      inputSize: {
        default: "",
        short: "",
        icon: "h-9 w-9",
        unstyled: "",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  },
)
export const labelVariants: Record<string, string> = {
    "": "text-primary text-sm",
    default: "text-primary ",
    transparent: "text-white",
    light: "bg-[#EAE6FF]",
    white: "bg-white",
    unstyled: "",
}
const iconVariants: Record<string, string> = {
    "": "",
    default: " ",
    transparent: "",
    light: "",
    white: "",
    unstyled: ""
}


export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {
    label?: string | React.ReactNode
    labelClass?: string
    hasError?: boolean
    errorMessage?: string
    errorMessageClass?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    containerClassName?: string
    iconClassName?: string
    optional?: boolean
    hideLabel?: boolean
    inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      containerClassName,
      errorMessage,
      type,
      hasError,
      leftIcon,
      rightIcon,
      errorMessageClass,
      iconClassName,
      label,
      labelClass,
      inputMode,
      hideLabel,
      optional,
      ...props
    },
    ref,
  ) => {
    const [show, setShow] = React.useState(false)

    const inputType = React.useMemo(() => {
      if (show) {
        return type === "password" ? "text" : type
      } else {
        return type === "password" ? "password" : type
      }
    }, [show, type])

    return (
      <div className={containerClassName}>
        {label && (
          <Label
            className={cn(labelVariants[variant || "default"], hideLabel && "sr-only", labelClass)}
            htmlFor={typeof props.id === "string" ? props.id : ""}
          >
            {label}
          </Label>
        )}
        <div className="relative">
          {leftIcon && (
            <span
              className={cn(
                "absolute left-4 top-[25%] cursor-pointer z-[3]",
                iconVariants[variant || "default"],
              )}
            >
              {leftIcon}
            </span>
          )}
          <input
            type={type == "password" ? inputType : type}
            className={cn(
              inputVariants({ variant, inputSize, className }),
              type == "password" && "pr-12",
              !!leftIcon && "pl-12",
              !!rightIcon && "pr-12",
            )}
            ref={ref}
            inputMode={inputMode}
            {...props}
          />
          {rightIcon && <span className="absolute right-4 top-[25%] cursor-pointer z-[3]">{rightIcon}</span>}

          {type === "password" && (
            <button
              className={cn(
                iconVariants[variant || "default"],
                "absolute right-[3%] top-[25%] text-white cursor-pointer z-[3]",
              )}
              onClick={(e) => {
                e.preventDefault()
                setShow((prev) => !prev)
              }}
              type="button"
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        
        {hasError && <FormError className={errorMessageClass} errorMessage={errorMessage} />}
      </div>
    )
  },
)
Input.displayName = "Input"


type AmountInputProps = Omit<InputProps, "value" | "onChange"> & {
  value?: string | number
  onChange?: (...event: any[]) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
}

export const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
  ({ value, onChange, onBlur, name, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() => formatNumber(value ? Number(value) : 0))

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, "")
        const numericValue = Number(rawValue)

        if (!isNaN(numericValue)) {
          const formattedValue = formatNumber(numericValue)
          setDisplayValue(formattedValue)
          if (onChange) {
            onChange({
              target: {
                name: name || "",
                value: numericValue,
              },
            } as unknown as React.ChangeEvent<HTMLInputElement>)
          }
        } else {
          setDisplayValue("")
          if (onChange) {
            onChange({
              target: {
                name: name || "",
                value: "",
              },
            } as unknown as React.ChangeEvent<HTMLInputElement>)
          }
        }
      },
      [onChange, name],
    )

    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        const numericValue = Number(e.target.value.replace(/[^0-9]/g, ""))
        if (!isNaN(numericValue)) {
          const formattedValue = formatNumber(numericValue)
          setDisplayValue(formattedValue)
          if (onBlur) {
            // Create a new event with the numeric value
            const syntheticEvent = {
              ...e,
              target: {
                ...e.target,
                value: numericValue.toString(),
              },
            }
            onBlur(syntheticEvent)
          }
        }
      },
      [onBlur],
    )

    React.useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(formatNumber(Number(value)))
      }
    }, [value])

    return (
      <Input
        {...props}
        ref={ref}
        name={name}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        type="text"
        inputMode="numeric"
      />
    )
  },
)

AmountInput.displayName = "AmountInput"

function formatNumber(num: number): string {
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 })
}


export { Input }
