"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, CalendarPlus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
  dob: z.date().refine((val) => !!val, {
    message: "Date of birth is required.",
  }),
  startDate: z.date().refine((val) => !!val, {
    message: "Start date is required.",
  }),
  percentage: z.array(z.number()).min(1).max(1),
})

type FormValues = z.infer<typeof formSchema>

export function LifePercentageCalculator() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      percentage: [50],
    },
  })

  // Watch values to calculate automatically
  const values = form.watch()
  const { dob, startDate, percentage } = values

  const targetDate = React.useMemo(() => {
    if (!dob || !startDate || percentage?.[0] === undefined) {
      return null
    }

    if (startDate < dob) {
      return null
    }

    const p = percentage[0] / 100
    if (p >= 1) return null

    const S = startDate.getTime()
    const D = dob.getTime()
    
    // Formula: T = (S - p*D) / (1 - p)
    const T = (S - p * D) / (1 - p)
    return new Date(T)
  }, [dob, startDate, percentage])

  const handleGoogleCalendar = () => {
    if (!targetDate || !dob || !startDate) return
    const title = `Life Percentage Reached: ${percentage?.[0]}%`
    const description = `Based on my birth date (${format(dob, "PPP")}) and start date (${format(startDate, "PPP")}), I reached ${percentage?.[0]}% of my life with this activity on this day!`
    
    const year = targetDate.getFullYear()
    const month = String(targetDate.getMonth() + 1).padStart(2, "0")
    const day = String(targetDate.getDate()).padStart(2, "0")
    const gStart = `${year}${month}${day}`
    
    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)
    const gEnd = `${nextDay.getFullYear()}${String(nextDay.getMonth() + 1).padStart(2, "0")}${String(nextDay.getDate()).padStart(2, "0")}`
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${gStart}/${gEnd}&details=${encodeURIComponent(description)}&sf=true&output=xml`
    window.open(url, "_blank")
  }

  const handleDownloadICS = () => {
    if (!targetDate || !dob || !startDate) return
    const title = `Life Percentage Reached: ${percentage?.[0]}%`
    const description = `Based on my birth date (${format(dob, "PPP")}) and start date (${format(startDate, "PPP")}), I reached ${percentage?.[0]}% of my life with this activity on this day!`
    
    const year = targetDate.getFullYear()
    const month = String(targetDate.getMonth() + 1).padStart(2, "0")
    const day = String(targetDate.getDate()).padStart(2, "0")
    const icsStart = `${year}${month}${day}`

    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)
    const icsEnd = `${nextDay.getFullYear()}${String(nextDay.getMonth() + 1).padStart(2, "0")}${String(nextDay.getDate()).padStart(2, "0")}`

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Life Percentage Calculator//EN",
      "BEGIN:VEVENT",
      `DTSTART;VALUE=DATE:${icsStart}`,
      `DTEND;VALUE=DATE:${icsEnd}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n")

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "life-percentage.ics")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8 p-6 border rounded-lg bg-card text-card-foreground shadow-sm max-w-md mx-auto my-8">
      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
                <DatePicker 
                  value={field.value} 
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                 <DatePicker 
                  value={field.value} 
                  onChange={field.onChange}
                  disabled={(date) => values.dob ? date < values.dob : false}
                />
                <FormMessage />
                {values.dob && values.startDate && values.startDate < values.dob && (
                  <p className="text-sm font-medium text-destructive">
                     Start date cannot be before birth date
                  </p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="percentage"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center mb-2">
                  <FormLabel>Life Percentage</FormLabel>
                  <span className="text-sm text-muted-foreground font-mono">
                    {field.value?.[0]}%
                  </span>
                </div>
                <FormControl>
                  <Slider
                    max={95}
                    min={5}
                    step={5}
                    defaultValue={[50]}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      <div className="pt-4 border-t">
        {targetDate ? (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">You can claim this on</p>
            <p className="text-2xl font-bold text-primary">
              {format(targetDate, "PPP")}
            </p>
            <p className="text-xs text-muted-foreground">
              (Age: {((targetDate.getTime() - values.dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)} years)
            </p>
            <div className="pt-4 flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarPlus className="h-4 w-4" />
                    Add to Calendar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem onClick={handleGoogleCalendar}>
                    Google Calendar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadICS}>
                    Apple / Outlook (.ics)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground h-16 flex items-center justify-center">
            {values.startDate && values.dob && values.startDate < values.dob 
              ? "Start date cannot be before birth date" 
              : "Enter dates to see your results"}
          </p>
        )}
      </div>
    </div>
  )
}

function DatePicker({ 
  value, 
  onChange, 
  disabled,
}: { 
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button 
            variant="outline" 
            className="w-full justify-between font-normal"
          >
            {value
              ? format(value, "PPP")
              : "Pick a date"}
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          captionLayout="dropdown"
          onSelect={(date) => {
            onChange(date)
            setIsOpen(false)
          }}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  )
}
