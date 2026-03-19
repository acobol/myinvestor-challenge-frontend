import { Button } from "@/components/ui/button";

interface LinkButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export function LinkButton({ onClick, children }: LinkButtonProps) {
  return (
    <Button variant="link" onClick={onClick}>
      {children}
    </Button>
  );
}
