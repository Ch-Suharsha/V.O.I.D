import { triggerWipe } from "@/components/WipeTransition"

export function useWipe() {
  return (href: string) => {
    triggerWipe(href)
  }
}
