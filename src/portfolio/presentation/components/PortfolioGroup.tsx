import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { FundCategory } from "@/fund/domain/fund.constants";
import type { PortfolioPosition } from "@/portfolio/domain/portfolio.schema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PortfolioItemRow } from "./PortfolioItemRow";

interface PortfolioGroupProps {
  category: FundCategory;
  items: PortfolioPosition[];
  onBuy: (position: PortfolioPosition) => void;
  onSell: (position: PortfolioPosition) => void;
  onTransfer: (position: PortfolioPosition) => void;
  onSeeDetails: (position: PortfolioPosition) => void;
}

export function PortfolioGroup({ category, items, onBuy, onSell, onTransfer, onSeeDetails }: PortfolioGroupProps) {
  const { t } = useTranslation();

  return (
    <Collapsible defaultOpen className="border-b last:border-b-0">
      <CollapsibleTrigger className="group flex w-full items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-accent/50 transition-colors">
        <span>{t(`funds.categories.${category}`)}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-normal text-muted-foreground">{items.length}</span>
          <ChevronDown
            size={15}
            className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <ul>
          {items.map((position) => (
            <li key={position.id} className="border-t">
              <PortfolioItemRow
                position={position}
                onBuy={() => onBuy(position)}
                onSell={() => onSell(position)}
                onTransfer={() => onTransfer(position)}
                onSeeDetails={() => onSeeDetails(position)}
              />
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
