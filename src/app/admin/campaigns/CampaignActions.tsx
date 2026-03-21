"use client";

import { Edit2, Trash2 } from "lucide-react";
import { RowActions } from "@/components/admin/RowActions";
import { deleteAd } from "@/app/actions/ads";

interface CampaignActionsProps {
  adId: string;
}

export function CampaignActions({ adId }: CampaignActionsProps) {
  return (
    <RowActions
      actions={[
        {
          label: "Edit",
          icon: <Edit2 className="w-3.5 h-3.5" />,
          href: `/admin/campaigns/editor?id=${adId}`,
        },
        {
          label: "Delete",
          icon: <Trash2 className="w-3.5 h-3.5" />,
          variant: "danger",
          // Using a bound server action via a helper approach
          onClick: async () => {
            await deleteAd(adId);
          },
        },
      ]}
    />
  );
}
